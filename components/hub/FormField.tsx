"use client";

import { useState } from "react";

type FormFieldProps = {
  label: string;
  type?: string;
  name: string;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
  /** 값을 직접 관리해야 할 때만 넘김(예: 로그인 비밀번호). 안 넘기면 FormData로만 읽음 */
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

// 로그인/회원가입 폼에서 쓰는 라벨 + 인풋
export default function FormField({
  label,
  type = "text",
  name,
  placeholder,
  required = true,
  autoComplete,
  value,
  onChange,
}: FormFieldProps) {
  const [isVisible, setIsVisible] = useState(false);
  const isPassword = type === "password";

  return (
    <label className="block">
      <span className="text-sm font-bold text-ink">{label}</span>
      <div className="relative mt-2">
        <input
          type={isPassword && isVisible ? "text" : type}
          name={name}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          value={value}
          onChange={onChange}
          className={`block w-full rounded-xl border border-line bg-steel-surface px-4 py-3 text-sm text-ink placeholder:text-ink-soft/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${isPassword ? "pr-11" : ""}`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setIsVisible((v) => !v)}
            aria-label={isVisible ? "비밀번호 숨기기" : "비밀번호 보기"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft transition-colors hover:text-ink"
          >
            {isVisible ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        )}
      </div>
    </label>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
      <path d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
      <path d="M3 3l18 18" />
      <path d="M10.6 5.1A10.9 10.9 0 0 1 12 5c7 0 10.5 7 10.5 7a13.2 13.2 0 0 1-3.1 4" />
      <path d="M6.6 6.6C3.8 8.4 1.5 12 1.5 12s3.5 7 10.5 7a10.4 10.4 0 0 0 5.4-1.5" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </svg>
  );
}
