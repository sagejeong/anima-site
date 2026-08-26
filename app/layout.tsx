import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * 제목(h1~h3) 전용 서체(나눔명조).
 * 원본 ttf(3MB)가 아니라 scripts/subset-fonts.py로 만든 woff2 서브셋을 씁니다.
 *
 * 제목은 전부 semibold 이상이라 Bold 한 파일이면 충분합니다.
 * 가는 제목이 필요해지면 app/fonts의 Regular 서브셋을 여기에 추가하세요.
 */
const nanumMyeongjo = localFont({
  src: [
    {
      path: "./fonts/NanumMyeongjo-Bold-subset.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-nanum-myeongjo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Anima — 기침 소리 분석 서비스",
  description:
    "기침 소리를 녹음해 기준 패턴과 비교하고 기록해 볼 수 있는 개인 참고용 서비스",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} ${nanumMyeongjo.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
