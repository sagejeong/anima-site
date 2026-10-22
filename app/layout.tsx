import type { Metadata } from "next";
import { Calistoga, Geist, Geist_Mono, Inter } from "next/font/google";
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

// ANiMA 사이트 전용 서체 페어. 헤드라인은 Calistoga, 본문은 Inter. 둘 다 라틴 전용이라
// 한글은 OS 기본 서체(system-ui)로 대체함. 구글 폰트로 구한 한글 폰트(Gothic A1,
// Noto Sans KR)를 써봤다가 카카오톡 인앱 브라우저에서 글자가 깨지는 문제가 있어 뺐다.
// 이 폰트들은 next/font가 자동 분할하는 유니코드 범위별 @font-face 규칙이 수백 개라
// (Gothic A1 한 굵기만 397개), 일부 웹뷰가 범위를 잘못 매칭해 엉뚱한 글자를 그린다.
const calistoga = Calistoga({
  variable: "--font-calistoga",
  subsets: ["latin"],
  weight: "400",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

// 제목(h1~h3)용 나눔명조. 원본 ttf가 3MB라 scripts/subset-fonts.py로 뽑은 woff2 서브셋만 씀.
// 제목은 다 semibold 이상이라 Bold 하나로 충분 (가는 제목 필요하면 Regular 서브셋 추가)
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
  title: "ANiMA · 기침 소리로 읽는 호흡 건강",
  description:
    "기침을 녹음해 실시간으로 분석하고, 요양시설에서는 입소자의 오전/오후 변화를 대시보드 하나로 확인할 수 있는 ANiMA의 웹 서비스",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} ${nanumMyeongjo.variable} ${calistoga.variable} ${inter.variable} h-full`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
