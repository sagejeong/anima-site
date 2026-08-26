"use client";

import { useEffect, useRef } from "react";

const BAR_COUNT = 28;

type LevelMeterProps = {
  /** 녹음 중인 마이크 신호. null이면 정지 상태로 그립니다. */
  analyser: AnalyserNode | null;
};

/**
 * 마이크 입력 크기를 막대로 보여줍니다.
 * 매 프레임 state를 바꾸면 리렌더가 60번씩 일어나므로,
 * DOM 노드의 transform만 직접 건드립니다.
 */
export default function LevelMeter({ analyser }: LevelMeterProps) {
  const barsRef = useRef<(HTMLSpanElement | null)[]>([]);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const bars = barsRef.current;

    if (!analyser) {
      bars.forEach((bar) => {
        if (bar) bar.style.transform = "scaleY(0.08)";
      });
      return;
    }

    const buffer = new Uint8Array(analyser.fftSize);
    // 막대마다 조금씩 다르게 반응해 파형처럼 보이도록 최근 값을 기억합니다.
    const levels = new Array<number>(BAR_COUNT).fill(0.08);

    const draw = (): void => {
      analyser.getByteTimeDomainData(buffer);

      let sumOfSquares = 0;
      for (let i = 0; i < buffer.length; i += 1) {
        const centered = (buffer[i] - 128) / 128;
        sumOfSquares += centered * centered;
      }
      const rms = Math.sqrt(sumOfSquares / buffer.length);
      const level = Math.min(1, rms * 3.2);

      // 가운데가 가장 크고 바깥으로 갈수록 작아지게
      for (let i = BAR_COUNT - 1; i > 0; i -= 1) {
        levels[i] = levels[i - 1];
      }
      levels[0] = level;

      for (let i = 0; i < BAR_COUNT; i += 1) {
        const bar = bars[i];
        if (!bar) continue;
        const distanceFromCenter = Math.abs(i - (BAR_COUNT - 1) / 2);
        const falloff = 1 - distanceFromCenter / BAR_COUNT;
        const scale = Math.max(0.08, levels[Math.round(distanceFromCenter)] * falloff);
        bar.style.transform = `scaleY(${scale.toFixed(3)})`;
      }

      frameRef.current = requestAnimationFrame(draw);
    };

    frameRef.current = requestAnimationFrame(draw);

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [analyser]);

  return (
    <div
      className="flex h-24 items-center justify-center gap-1.5"
      aria-hidden="true"
    >
      {Array.from({ length: BAR_COUNT }, (_, index) => (
        <span
          key={index}
          ref={(node) => {
            barsRef.current[index] = node;
          }}
          className="h-20 w-1.5 origin-center rounded-full bg-primary/70 transition-[background-color] duration-300"
          style={{ transform: "scaleY(0.08)" }}
        />
      ))}
    </div>
  );
}
