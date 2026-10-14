"use client";

import { useState } from "react";
import type { Option } from "@/lib/signup";

type FieldProps = {
  label: string;
  htmlFor?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
};

/** 라벨 + 도움말 + 오류 메시지를 감싸는 공통 필드 래퍼 */
export function Field({
  label,
  htmlFor,
  required = false,
  hint,
  error,
  children,
}: FieldProps) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="flex items-center gap-1.5 text-sm font-semibold text-ink"
      >
        {label}
        {required && (
          <span className="text-primary" aria-label="필수 입력">
            *
          </span>
        )}
      </label>
      {hint && <p className="mt-1 text-xs text-ink-soft">{hint}</p>}
      <div className="mt-2">{children}</div>
      {error && (
        <p role="alert" className="mt-1.5 text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

const INPUT_BASE =
  "w-full rounded-xl border bg-steel-surface px-4 py-3 text-base text-ink placeholder:text-ink-soft transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30";

function inputClass(hasError: boolean): string {
  return `${INPUT_BASE} ${
    hasError ? "border-red-400" : "border-gray-light focus:border-primary"
  }`;
}

type TextFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "password" | "email" | "number";
  placeholder?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  autoComplete?: string;
  min?: number;
  max?: number;
};

export function TextField({
  id,
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required = false,
  hint,
  error,
  autoComplete,
  min,
  max,
}: TextFieldProps) {
  const [isVisible, setIsVisible] = useState(false);
  const isPassword = type === "password";

  return (
    <Field label={label} htmlFor={id} required={required} hint={hint} error={error}>
      <div className="relative">
        <input
          id={id}
          type={isPassword && isVisible ? "text" : type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          min={min}
          max={max}
          aria-invalid={error ? true : undefined}
          className={`${inputClass(Boolean(error))} ${isPassword ? "pr-11" : ""}`}
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
    </Field>
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

type SelectFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly Option[];
  placeholder?: string;
  required?: boolean;
  hint?: string;
  error?: string;
};

export function SelectField({
  id,
  label,
  value,
  onChange,
  options,
  placeholder = "선택해 주세요",
  required = false,
  hint,
  error,
}: SelectFieldProps) {
  return (
    <Field label={label} htmlFor={id} required={required} hint={hint} error={error}>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? true : undefined}
        className={`${inputClass(Boolean(error))} appearance-none`}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

type RadioGroupFieldProps = {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly Option[];
  required?: boolean;
  hint?: string;
  error?: string;
};

/** 칩 형태의 단일 선택 그룹 */
export function RadioGroupField({
  name,
  label,
  value,
  onChange,
  options,
  required = false,
  hint,
  error,
}: RadioGroupFieldProps) {
  return (
    <fieldset>
      <legend className="flex items-center gap-1.5 text-sm font-semibold text-ink">
        {label}
        {required && (
          <span className="text-primary" aria-label="필수 입력">
            *
          </span>
        )}
      </legend>
      {hint && <p className="mt-1 text-xs text-ink-soft">{hint}</p>}
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((option) => (
          <label key={option.value} className="cursor-pointer">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="peer sr-only"
            />
            <span className="inline-flex items-center rounded-full border border-gray-light px-4 py-2 text-sm text-ink-soft transition-colors hover:border-primary/50 peer-checked:border-primary peer-checked:bg-primary/10 peer-checked:font-semibold peer-checked:text-primary peer-focus-visible:ring-2 peer-focus-visible:ring-primary/30">
              {option.label}
            </span>
          </label>
        ))}
      </div>
      {error && (
        <p role="alert" className="mt-1.5 text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </fieldset>
  );
}

type CheckboxGroupFieldProps = {
  label: string;
  values: readonly string[];
  onChange: (values: string[]) => void;
  options: readonly Option[];
  hint?: string;
};

/** 칩 형태의 복수 선택 그룹 */
export function CheckboxGroupField({
  label,
  values,
  onChange,
  options,
  hint,
}: CheckboxGroupFieldProps) {
  const toggle = (target: string): void => {
    onChange(
      values.includes(target)
        ? values.filter((value) => value !== target)
        : [...values, target],
    );
  };

  return (
    <fieldset>
      <legend className="text-sm font-semibold text-ink">{label}</legend>
      {hint && <p className="mt-1 text-xs text-ink-soft">{hint}</p>}
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((option) => (
          <label key={option.value} className="cursor-pointer">
            <input
              type="checkbox"
              checked={values.includes(option.value)}
              onChange={() => toggle(option.value)}
              className="peer sr-only"
            />
            <span className="inline-flex items-center rounded-full border border-gray-light px-4 py-2 text-sm text-ink-soft transition-colors hover:border-primary/50 peer-checked:border-primary peer-checked:bg-primary/10 peer-checked:font-semibold peer-checked:text-primary peer-focus-visible:ring-2 peer-focus-visible:ring-primary/30">
              {option.label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

type TextareaFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
  rows?: number;
};

export function TextareaField({
  id,
  label,
  value,
  onChange,
  placeholder,
  hint,
  rows = 3,
}: TextareaFieldProps) {
  return (
    <Field label={label} htmlFor={id} hint={hint}>
      <textarea
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={`${inputClass(false)} resize-y`}
      />
    </Field>
  );
}
