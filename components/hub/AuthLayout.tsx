import Image from "next/image";
import Link from "next/link";
import GradientBar from "@/components/hub/GradientBar";

type AuthLayoutProps = {
  eyebrow: string;
  title: React.ReactNode;
  description: string;
  children: React.ReactNode;
};

// 로그인/회원가입 공통 틀. 왼쪽 브랜드, 오른쪽 폼
export default function AuthLayout({ eyebrow, title, description, children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col font-hub-body lg:flex-row">
      <div className="relative flex flex-col justify-between bg-charcoal px-8 py-10 text-ink sm:px-12 sm:py-14 lg:w-[42%]">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <Image src="/anima_hub_logo.png" alt="ANiMA" width={645} height={119} className="h-6 w-auto sm:h-7" />
        </Link>

        <div className="mt-16 lg:mt-0">
          <p className="font-hub-label text-sm font-bold uppercase tracking-[0.3em] text-primary">
            {eyebrow}
          </p>
          <h1 className="mt-4 font-hub-display text-3xl font-black leading-tight text-balance sm:text-4xl">
            {title}
          </h1>
          <p className="mt-4 max-w-sm text-pretty text-base leading-relaxed text-ink/60">
            {description}
          </p>
        </div>

        <p className="hidden text-xs text-ink/40 lg:block">© ANiMA · 기침 소리로 읽는 호흡 건강</p>
      </div>

      <div className="flex flex-1 flex-col bg-steel">
        <GradientBar className="h-1.5" />
        <div className="flex flex-1 items-center justify-center px-6 py-14 sm:px-10">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </div>
    </div>
  );
}
