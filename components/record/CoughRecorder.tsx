"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import LevelMeter from "@/components/record/LevelMeter";
import MedicationCategoryStep from "@/components/record/MedicationCategoryStep";
import MedicationYesNoStep from "@/components/record/MedicationYesNoStep";
import {
  blobToDataUrl,
  fileExtensionFor,
  formatDuration,
  isRecordingSupported,
  pickAudioMimeType,
} from "@/lib/audio";
import {
  LAST_RESULT_STORAGE_KEY,
  type AnimaUploadResponse,
  type StoredResult,
} from "@/lib/result";

/** 분석에 필요한 최소 길이 */
const MIN_DURATION_MS = 3000;
/** 이 시간이 지나면 자동으로 멈춥니다 */
const MAX_DURATION_MS = 15000;

type RecorderStatus =
  | "idle"
  | "requesting"
  | "recording"
  | "recorded"
  | "medication-yesno"
  | "medication-categories"
  | "denied"
  | "unsupported";

const RECORDING_TIPS: readonly string[] = [
  "조용한 곳에서",
  "얼굴에서 20cm 떨어뜨리고",
  "3초 이상",
];

/** 마이크 지원 여부는 브라우저에서만 알 수 있어, 서버 렌더링과 어긋나지 않게 읽습니다. */
const subscribeToNothing = () => () => undefined;

export default function CoughRecorder() {
  const router = useRouter();
  const [status, setStatus] = useState<RecorderStatus>("idle");
  const [elapsedMs, setElapsedMs] = useState<number>(0);
  const [recordedMs, setRecordedMs] = useState<number>(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [mimeType, setMimeType] = useState<string>("audio/webm");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [medicationValues, setMedicationValues] = useState<string[]>([]);
  const [medicationOther, setMedicationOther] = useState<string>("");

  const audioBlobRef = useRef<Blob | null>(null);
  const measuredAtRef = useRef<string>("");
  /** 업로드가 성공(기침 감지)했을 때, 복용 약을 물어보는 동안 결과를 잠깐 들고 있습니다. */
  const pendingResponseRef = useRef<AnimaUploadResponse | null>(null);
  const pendingAudioDataUrlRef = useRef<string | undefined>(undefined);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<number | null>(null);
  const startedAtRef = useRef<number>(0);
  const audioUrlRef = useRef<string | null>(null);

  /** 마이크와 타이머를 정리합니다. 녹음이 끝나면 마이크 표시등도 꺼져야 합니다. */
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

  const isSupported = useSyncExternalStore(
    subscribeToNothing,
    isRecordingSupported,
    () => true, // 서버에서는 지원한다고 보고 그립니다
  );

  useEffect(() => {
    return () => {
      releaseMicrophone();
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
      }
    };
  }, [releaseMicrophone]);

  const startRecording = async (): Promise<void> => {
    const selectedMimeType = pickAudioMimeType();
    if (!isRecordingSupported() || !selectedMimeType) {
      setStatus("unsupported");
      return;
    }

    setStatus("requesting");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          // 브라우저가 소리를 가공하면 기침의 음향 특징이 바뀝니다. 분석용이라 모두 끕니다.
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
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

      recorder.ondataavailable = (event: BlobEvent): void => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = (): void => {
        setRecordedMs(performance.now() - startedAtRef.current);
        measuredAtRef.current = new Date().toISOString();

        const blob = new Blob(chunksRef.current, { type: selectedMimeType });
        audioBlobRef.current = blob;
        if (audioUrlRef.current) {
          URL.revokeObjectURL(audioUrlRef.current);
        }
        const url = URL.createObjectURL(blob);
        audioUrlRef.current = url;

        setAudioUrl(url);
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
        if (elapsed >= MAX_DURATION_MS) {
          recorderRef.current?.stop();
        }
      }, 100);
    } catch {
      releaseMicrophone();
      setStatus("denied");
    }
  };

  const stopRecording = (): void => {
    recorderRef.current?.stop();
  };

  const resetRecording = (): void => {
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
    audioBlobRef.current = null;
    setAudioUrl(null);
    setElapsedMs(0);
    setRecordedMs(0);
    setMedicationValues([]);
    setMedicationOther("");
    pendingResponseRef.current = null;
    pendingAudioDataUrlRef.current = undefined;
    setStatus("idle");
  };

  const goToResult = (
    response: AnimaUploadResponse,
    audioDataUrl: string | undefined,
    medication?: StoredResult["medication"],
  ): void => {
    const stored: StoredResult = {
      response,
      measuredAt: measuredAtRef.current || new Date().toISOString(),
      audioDataUrl,
      medication,
    };
    sessionStorage.setItem(LAST_RESULT_STORAGE_KEY, JSON.stringify(stored));
    router.push("/result");
  };

  // "분석 요청하기" 누르면 바로 업로드. 기침 미감지/실패면 복용 약 안 묻고 바로 실패 카드로,
  // 감지 성공한 경우에만 복용 약 물어서 답 붙여 결과로 넘어감
  const uploadRecording = async (): Promise<void> => {
    const blob = audioBlobRef.current;
    if (!blob) return;

    setIsUploading(true);

    // 실패하더라도 방금 녹음한 소리는 들려드릴 수 있어야 하니 먼저 변환해 둡니다.
    let audioDataUrl: string | undefined;
    try {
      audioDataUrl = await blobToDataUrl(blob);
    } catch {
      audioDataUrl = undefined;
    }

    try {
      const formData = new FormData();
      formData.append(
        "file",
        blob,
        `anima-cough.${fileExtensionFor(mimeType)}`,
      );

      const response = await fetch("/api/record", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        goToResult({ quality: { quality_fail_reason: "UPLOAD_FAILED" } }, audioDataUrl);
        return;
      }

      const body = (await response.json().catch(() => ({}))) as AnimaUploadResponse;

      const isCough = body.prediction?.is_cough;
      const distance = body.prediction?.stage2?.distance;
      const failReason = body.quality?.quality_fail_reason;

      if (isCough === false || failReason || typeof distance !== "number") {
        goToResult(body, audioDataUrl);
        return;
      }

      // 기침이 제대로 감지된 경우에만 복용 약을 묻습니다.
      pendingResponseRef.current = body;
      pendingAudioDataUrlRef.current = audioDataUrl;
      setStatus("medication-yesno");
    } catch {
      goToResult({ quality: { quality_fail_reason: "UPLOAD_FAILED" } }, audioDataUrl);
    } finally {
      setIsUploading(false);
    }
  };

  /** 복용 약 질문에 답한 뒤, 잠깐 들고 있던 분석 결과에 답을 붙여 결과로 넘어갑니다. */
  const finalizeWithMedication = (medication: {
    taken: boolean;
    categories: string[];
    other: string;
  }): void => {
    const response = pendingResponseRef.current;
    if (!response) return;

    goToResult(response, pendingAudioDataUrlRef.current, {
      taken: medication.taken,
      categories: medication.categories,
      other: medication.other || undefined,
    });
  };

  if (!isSupported || status === "unsupported") {
    return (
      <Notice title="이 브라우저에서는 녹음할 수 없어요">
        크롬, 엣지, 사파리 최신 버전에서 다시 시도해 주세요. 주소가{" "}
        <code className="rounded bg-black/5 px-1.5 py-0.5 text-sm">https://</code>{" "}
        로 시작하지 않으면 브라우저가 마이크를 열어주지 않습니다.
      </Notice>
    );
  }

  if (status === "medication-yesno") {
    return (
      <MedicationYesNoStep
        onYes={() => setStatus("medication-categories")}
        onNo={() => finalizeWithMedication({ taken: false, categories: [], other: "" })}
        onBack={() => setStatus("recorded")}
        isSubmitting={false}
      />
    );
  }

  if (status === "medication-categories") {
    return (
      <MedicationCategoryStep
        values={medicationValues}
        onValuesChange={setMedicationValues}
        other={medicationOther}
        onOtherChange={setMedicationOther}
        onConfirm={() =>
          finalizeWithMedication({
            taken: true,
            categories: medicationValues,
            other: medicationOther.trim(),
          })
        }
        onBack={() => setStatus("medication-yesno")}
        isSubmitting={false}
      />
    );
  }

  if (status === "denied") {
    return (
      <Notice title="마이크 사용이 허용되지 않았어요">
        <span className="block">
          주소창 왼쪽의 자물쇠 아이콘을 눌러 마이크 권한을 허용으로 바꾼 뒤 다시
          시도해 주세요.
        </span>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-5 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent"
        >
          다시 시도
        </button>
      </Notice>
    );
  }

  const isRecording = status === "recording";
  const isTooShort = status === "recorded" && recordedMs < MIN_DURATION_MS;

  const headline =
    status === "recorded"
      ? "녹음을 확인해 주세요"
      : isRecording
        ? "듣고 있어요"
        : "기침을 체크해 볼까요?";

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-center text-3xl font-bold tracking-tight text-ink sm:text-4xl">
        {headline}
      </h1>

      {/* 녹음 안내 */}
      {status !== "recorded" && (
        <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          {RECORDING_TIPS.map((tip) => (
            <li
              key={tip}
              className="flex items-center gap-2 text-sm text-ink-soft"
            >
              <span
                className="h-1.5 w-1.5 rounded-full bg-primary"
                aria-hidden="true"
              />
              {tip}
            </li>
          ))}
        </ul>
      )}

      {/* 파형 */}
      <div className="mt-10 w-full max-w-md">
        {status === "recorded" ? (
          <div className="rounded-2xl border border-gray-light bg-steel-surface p-5">
            <p className="text-sm font-medium text-ink-soft">
              녹음한 소리를 들어보세요
            </p>
            {audioUrl && (
              <audio
                src={audioUrl}
                controls
                className="mt-3 w-full"
                aria-label="녹음한 기침 소리"
              />
            )}
            <p className="mt-3 text-sm text-ink-soft">
              길이 {formatDuration(recordedMs)}
            </p>
          </div>
        ) : (
          <LevelMeter analyser={analyser} />
        )}
      </div>

      {/* 경과 시간 */}
      {isRecording && (
        <p
          className="mt-6 text-2xl font-semibold tabular-nums text-ink"
          role="timer"
          aria-live="off"
        >
          {formatDuration(elapsedMs)}
        </p>
      )}

      {isTooShort && (
        <p role="alert" className="mt-6 text-sm font-medium text-red-600">
          3초보다 짧습니다. 다시 녹음해 주세요.
        </p>
      )}

      {/* 조작 버튼 */}
      <div className="mt-10 flex flex-col items-center gap-5">
        {status === "recorded" ? (
          <>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={resetRecording}
                className="rounded-full border border-line px-6 py-3.5 text-base font-medium text-ink-soft transition-colors hover:border-primary hover:text-primary"
              >
                다시 녹음
              </button>

              <button
                type="button"
                onClick={() => void uploadRecording()}
                disabled={isTooShort || isUploading}
                className={`rounded-full px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-primary/20 transition-colors ${
                  isTooShort || isUploading
                    ? "bg-line text-ink-soft shadow-none"
                    : "bg-primary hover:bg-accent"
                }`}
              >
                {isUploading ? "분석 요청하는 중..." : "분석 요청하기"}
              </button>
            </div>

            {audioUrl && (
              <a
                href={audioUrl}
                download={`anima-cough.${fileExtensionFor(mimeType)}`}
                className="text-sm font-medium text-ink-soft underline underline-offset-4 hover:text-primary"
              >
                녹음 파일 내려받기
              </a>
            )}

            <p className="max-w-sm text-center text-xs leading-relaxed text-ink-soft">
              계정을 만들지 않아도 분석을 요청할 수 있습니다. 이 브라우저에서
              바로 결과를 보여드립니다.
            </p>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              disabled={status === "requesting"}
              className={`flex h-28 w-28 flex-col items-center justify-center gap-1.5 rounded-full text-white shadow-xl transition-all disabled:opacity-60 ${
                isRecording
                  ? "bg-critical shadow-critical/30"
                  : "bg-primary shadow-primary/30 hover:bg-accent"
              }`}
            >
              {isRecording ? <StopIcon /> : <MicIcon />}
              <span className="text-sm font-semibold">
                {isRecording ? "중지" : "녹음"}
              </span>
            </button>

            <p className="text-sm text-ink-soft">
              {status === "requesting"
                ? "마이크 사용을 허용해 주세요"
                : isRecording
                  ? "기침을 3초 이상 해주세요"
                  : "버튼을 누르면 바로 시작됩니다"}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function Notice({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-md rounded-2xl border border-gray-light bg-steel-surface p-6 text-center">
      <h2 className="text-lg font-bold text-ink">{title}</h2>
      <div className="mt-3 text-sm leading-relaxed text-ink-soft">
        {children}
      </div>
    </div>
  );
}

function MicIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-8 w-8"
      aria-hidden="true"
    >
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="22" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-7 w-7"
      aria-hidden="true"
    >
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
  );
}
