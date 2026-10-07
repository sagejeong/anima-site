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
  return (
    <label className="block">
      <span className="text-sm font-bold text-ink">{label}</span>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        value={value}
        onChange={onChange}
        className="mt-2 block w-full rounded-xl border border-line bg-steel-surface px-4 py-3 text-sm text-ink placeholder:text-ink-soft/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
    </label>
  );
}
