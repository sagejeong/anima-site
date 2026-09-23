"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import CheckinRecorder, { type CheckinResult } from "@/components/checkin/CheckinRecorder";
import StatusPill from "@/components/hub/StatusPill";
import type { CheckinSession, RosterWorker } from "@/lib/hub-roster";

type Step = "loading" | "register" | "pick-session" | "recording" | "result";

/**
 * 입소자가 본인 폰으로 여는 화면. 이름 등록(최초 1회) → 오전/오후 선택 →
 * 녹음 → 실제 분석 결과 확인, 순서로 진행됨. 관리자 로그인 없이 누구나 열 수
 * 있어서, 회사 내부에서만 이 링크를 공유하는 걸 전제로 함.
 */
export default function CheckinPage() {
  const [step, setStep] = useState<Step>("loading");
  const [worker, setWorker] = useState<RosterWorker | null>(null);
  const [name, setName] = useState("");
  const [team, setTeam] = useState("");
  const [session, setSession] = useState<CheckinSession>("before");
  const [result, setResult] = useState<CheckinResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/hub/whoami")
      .then((res) => res.json())
      .then((body: { worker: RosterWorker | null }) => {
        setWorker(body.worker);
        setStep(body.worker ? "pick-session" : "register");
      })
      .catch(() => setStep("register"));
  }, []);

  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim() || !team.trim()) return;
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/hub/register-worker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, team }),
      });
      const body = await response.json();
      if (!response.ok) {
        setErrorMessage(body.error ?? "등록에 실패했습니다.");
        return;
      }
      setWorker(body.worker);
      setStep("pick-session");
    } catch {
      setErrorMessage("서버에 연결하지 못했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-steel px-5 py-10 font-hub-body text-ink sm:px-8">
      <div className="flex items-center gap-2">
        <Image src="/anima_hub_logo.png" alt="ANiMA" width={645} height={119} className="h-6 w-auto sm:h-7" />
        <span className="text-xs font-bold tracking-[0.3em] text-primary">HUB</span>
      </div>

      <div className="mt-10 w-full max-w-md flex-1">
        {step === "loading" && <p className="text-center text-sm text-ink-soft">확인 중...</p>}

        {step === "register" && (
          <div className="rounded-2xl border border-line bg-steel-surface p-6">
            <h1 className="font-hub-display text-xl font-extrabold text-ink">처음이시네요, 이름을 알려주세요</h1>
            <p className="mt-1.5 text-sm text-ink-soft">이 폰에서 다음부터는 다시 입력하지 않아도 됩니다.</p>
            <form onSubmit={(event) => void handleRegister(event)} className="mt-5 flex flex-col gap-4">
              <label className="block">
                <span className="text-sm font-bold text-ink">이름</span>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="예: 김OO"
                  required
                  className="mt-2 block w-full rounded-xl border border-line bg-steel px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </label>
              <label className="block">
                <span className="text-sm font-bold text-ink">소속 병동</span>
                <input
                  value={team}
                  onChange={(event) => setTeam(event.target.value)}
                  placeholder="예: 3병동"
                  required
                  className="mt-2 block w-full rounded-xl border border-line bg-steel px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </label>
              {errorMessage && <p className="text-sm font-bold text-critical">{errorMessage}</p>}
              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-1 rounded-full bg-primary px-6 py-3.5 text-base font-bold text-white disabled:opacity-60"
              >
                {isSubmitting ? "등록 중..." : "시작하기"}
              </button>
            </form>
          </div>
        )}

        {step === "pick-session" && worker && (
          <div className="rounded-2xl border border-line bg-steel-surface p-6 text-center">
            <p className="text-sm text-ink-soft">
              {worker.team} · {worker.name}님
            </p>
            <h1 className="mt-1.5 font-hub-display text-xl font-extrabold text-ink">언제 기침을 체크하시나요?</h1>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setSession("before");
                  setStep("recording");
                }}
                className="rounded-2xl border-2 border-line px-4 py-6 text-base font-bold text-ink transition-colors hover:border-primary"
              >
                오전 체크
              </button>
              <button
                type="button"
                onClick={() => {
                  setSession("after");
                  setStep("recording");
                }}
                className="rounded-2xl border-2 border-line px-4 py-6 text-base font-bold text-ink transition-colors hover:border-primary"
              >
                오후 체크
              </button>
            </div>
          </div>
        )}

        {step === "recording" && (
          <div className="flex flex-col items-center">
            <p className="text-sm font-bold text-primary">{session === "before" ? "오전 체크" : "오후 체크"}</p>
            <h1 className="mt-1 text-center font-hub-display text-xl font-extrabold text-ink">기침을 3초 이상 해주세요</h1>
            {errorMessage && <p className="mt-3 text-sm font-bold text-critical">{errorMessage}</p>}
            <div className="mt-6 w-full">
              <CheckinRecorder
                session={session}
                onResult={(value) => {
                  setResult(value);
                  setStep("result");
                }}
                onError={setErrorMessage}
              />
            </div>
          </div>
        )}

        {step === "result" && result && (
          <div className="rounded-2xl border border-line bg-steel-surface p-6 text-center">
            {result.status ? (
              <>
                <StatusPill status={result.status} className="mx-auto px-3.5 py-1.5 text-sm" />
                <p className="mt-4 font-hub-label text-5xl font-black tabular-nums text-ink">
                  {result.percent}
                  <span className="text-xl text-ink-soft">%</span>
                </p>
                <p className="mt-2 text-sm text-ink-soft">기준 패턴 대비 이탈도입니다. 낮을수록 평소와 비슷합니다.</p>
              </>
            ) : (
              <>
                <h1 className="font-hub-display text-lg font-extrabold text-ink">기침이 잘 인식되지 않았어요</h1>
                <p className="mt-2 text-sm text-ink-soft">조용한 곳에서 다시 시도해 주세요.</p>
              </>
            )}
            <button
              type="button"
              onClick={() => {
                setResult(null);
                setErrorMessage(null);
                setStep("pick-session");
              }}
              className="mt-6 rounded-full bg-ink px-6 py-3 text-sm font-bold text-steel"
            >
              완료
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
