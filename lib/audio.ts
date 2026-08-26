/** 브라우저별로 지원하는 녹음 형식이 달라, 쓸 수 있는 것 중 앞선 것을 고릅니다. */
const MIME_CANDIDATES: readonly string[] = [
  "audio/webm;codecs=opus", // 크롬·엣지·파이어폭스
  "audio/webm",
  "audio/mp4", // 사파리(iOS 포함)
  "audio/ogg;codecs=opus",
];

export function pickAudioMimeType(): string | null {
  if (typeof MediaRecorder === "undefined") {
    return null;
  }
  return (
    MIME_CANDIDATES.find((type) => MediaRecorder.isTypeSupported(type)) ?? null
  );
}

/** 녹음 지원 여부. 마이크는 https 또는 localhost에서만 열립니다. */
export function isRecordingSupported(): boolean {
  return (
    typeof navigator !== "undefined" &&
    typeof navigator.mediaDevices?.getUserMedia === "function" &&
    typeof MediaRecorder !== "undefined"
  );
}

export function formatDuration(milliseconds: number): string {
  const totalSeconds = milliseconds / 1000;
  return `${totalSeconds.toFixed(1)}초`;
}

export function fileExtensionFor(mimeType: string): string {
  if (mimeType.startsWith("audio/mp4")) return "m4a";
  if (mimeType.startsWith("audio/ogg")) return "ogg";
  return "webm";
}

/**
 * 녹음한 Blob을 data URL 문자열로 바꿉니다.
 * blob: URL과 달리 문자열이라 sessionStorage에 저장할 수 있고,
 * 새로고침해도 재생이 깨지지 않습니다.
 */
export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error("파일을 읽지 못했습니다."));
    reader.readAsDataURL(blob);
  });
}
