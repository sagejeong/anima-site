"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import LevelMeter from "@/components/record/LevelMeter";
import { fileExtensionFor, formatDuration, isRecordingSupported, pickAudioMimeType } from "@/lib/audio";
import type { CheckinSession, CheckinStatus } from "@/lib/hub-roster";

const MIN_DURATION_MS = 3000;
const MAX_DURATION_MS = 15000;

export type CheckinResult = {
  percent: number | null;
  status: CheckinStatus | null;
  failReason: string | null;
};

type RecorderStatus = "idle" | "requesting" | "recording" | "recorded" | "uploading" | "denied" | "unsupported";

const subscribeToNothing = () => () => undefined;

type CheckinRecorderProps = {
  session: CheckinSession;
  onResult: (result: CheckinResult) => void;
  onError: (message: string) => void;
};

/**
 * /checkin 전용 녹음기. CoughRecorder랑 녹음 방식은 같지만, 복용 약 질문 같은
 * 소비자 앱 단계는 빼고 녹음 → 업로드 → 결과 콜백까지만 함.
 */
export default function CheckinRecorder({ session, onResult, onError }: CheckinRecorderProps) {
  const [status, setStatus] = useState<RecorderStatus>("idle");
  const [elapsedMs, setElapsedMs] = useState(0);
  const [recordedMs, setRecordedMs] = useState(0);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [mimeType, setMimeType] = useState("audio/webm");

  const audioBlobRef = useRef<Blob | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<number | null>(null);
  const startedAtRef = useRef(0);

  const isSupported = useSyncExternalStore(subscribeToNothing, isRecordingSupported, () => true);

  const releaseMicrophone = useCallback((): void => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    void audioContextRef.current?.close().catch(() => undefined);
    audioContextRef.current = null;
    setAnalyser(null);
  }, []);

  useEffect(() => () => releaseMicrophone(), [releaseMicrophone]);

  const startRecording = async (): Promise<void> => {
    const selectedMimeType = pickAudioMimeType();
    if (!isRecordingSupported() || !selectedMimeType) {
      setStatus("unsupported");
      return;
    }

    setStatus("requesting");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      });
      streamRef.current = stream;

      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const analyserNode = audioContext.createAnalyser();
      analyserNode.fftSize = 1024;
      source.connect(analyserNode);
      setAnalyser(analyserNode);

      const recorder = new MediaRecorder(stream, { mimeType: selectedMimeType });
      recorderRef.current = recorder;
      chunksRef.current = [];
      setMimeType(selectedMimeType);

      recorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onstop = () => {
        setRecordedMs(performance.now() - startedAtRef.current);
        audioBlobRef.current = new Blob(chunksRef.current, { type: selectedMimeType });
        setStatus("recorded");
        releaseMicrophone();
      };

      recorder.start();
      startedAtRef.current = performance.now();
      setElapsedMs(0);
      setStatus("recording");

      timerRef.current = window.setInterval(() => {
        const elapsed = performance.now() - startedAtRef.current;
        setElapsedMs(elapsed);
        if (elapsed >= MAX_DURATION_MS) recorderRef.current?.stop();
      }, 100);
    } catch {
      releaseMicrophone();
      setStatus("denied");
    }
  };

  const stopRecording = (): void => recorderRef.current?.stop();

  const resetRecording = (): void => {
    audioBlobRef.current = null;
    setElapsedMs(0);
    setRecordedMs(0);
    setStatus("idle");
  };

  const uploadRecording = async (): Promise<void> => {
    const blob = audioBlobRef.current;
    if (!blob) return;

    setStatus("uploading");

    try {
      const formData = new FormData();
      formData.append("file", blob, `anima-checkin.${fileExtensionFor(mimeType)}`);
      formData.append("session", session);

      const response = await fetch("/api/hub/checkin", { method: "POST", body: formData });
      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        onError(body.error ?? "분석 요청에 실패했습니다.");
        setStatus("recorded");
        return;
      }

      onResult({
        percent: body.checkin?.percent ?? null,
        status: body.checkin?.status ?? null,
        failReason: body.checkin?.failReason ?? null,
      });
    } catch {
      onError("서버에 연결하지 못했습니다.");
      setStatus("recorded");
    }
  };

  if (!isSupported || status === "unsupported") {
    return (
      <Notice title="이 브라우저에서는 녹음할 수 없어요">
        크롬, 사파리 최신 버전에서 다시 시도해 주세요. 주소가 https://로 시작해야 마이크를 열 수 있습니다.
      </Notice>
    );
  }

  if (status === "denied") {
    return (
      <Notice title="마이크 권한이 필요해요">
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-4 rounded-full bg-primary px-6 py-3 text-sm font-bold text-white"
        >
          다시 시도
        </button>
      </Notice>
    );
  }

  const isRecording = status === "recording";
  const isTooShort = status === "recorded" && recordedMs < MIN_DURATION_MS;

  return (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-steel-surface p-6">
        <LevelMeter analyser={analyser} />
      </div>

      {isRecording && (
        <p className="mt-6 font-hub-mono text-2xl font-semibold tabular-nums text-ink">
          {formatDuration(elapsedMs)}
        </p>
      )}

      {isTooShort && (
        <p role="alert" className="mt-4 text-sm font-bold text-critical">
          3초보다 짧습니다. 다시 녹음해 주세요.
        </p>
      )}

      <div className="mt-8 flex flex-col items-center gap-4">
        {status === "recorded" ? (
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={resetRecording}
              className="rounded-full border-2 border-ink px-6 py-3.5 text-base font-bold text-ink"
            >
              다시 녹음
            </button>
            <button
              type="button"
              onClick={() => void uploadRecording()}
              disabled={isTooShort}
              className={`rounded-full px-8 py-3.5 text-base font-bold text-white shadow-lg shadow-primary/25 ${
                isTooShort ? "bg-line text-ink-soft shadow-none" : "bg-primary hover:bg-accent"
              }`}
            >
              분석 요청하기
            </button>
          </div>
        ) : status === "uploading" ? (
          <p className="text-base font-bold text-ink-soft">분석 요청하는 중...</p>
        ) : (
          <>
            <button
              type="button"
              onClick={isRecording ? stopRecording : () => void startRecording()}
              disabled={status === "requesting"}
              className={`flex h-28 w-28 flex-col items-center justify-center gap-1.5 rounded-full text-white shadow-xl transition-all disabled:opacity-60 ${
                isRecording ? "bg-ink" : "bg-primary hover:bg-accent"
              }`}
            >
              {isRecording ? <StopIcon /> : <MicIcon />}
              <span className="text-sm font-bold">{isRecording ? "중지" : "녹음"}</span>
            </button>
            <p className="text-sm text-ink-soft">
              {status === "requesting" ? "마이크 사용을 허용해 주세요" : isRecording ? "기침을 3초 이상 해주세요" : "버튼을 누르면 바로 시작됩니다"}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function Notice({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-sm rounded-2xl border border-line bg-steel-surface p-6 text-center">
      <h2 className="font-hub-display text-lg font-extrabold text-ink">{title}</h2>
      <div className="mt-3 text-sm leading-relaxed text-ink-soft">{children}</div>
    </div>
  );
}

function MicIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8" aria-hidden="true">
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="22" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7" aria-hidden="true">
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
  );
}
