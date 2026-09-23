import type { Metadata } from "next";
import { Calistoga, Geist, Geist_Mono, Gothic_A1, Inter, Noto_Sans_KR } from "next/font/google";
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

// ANiMA 사이트 전용 서체 페어. 헤드라인은 Calistoga(한글은 Gothic A1로 대체),
// 본문은 Inter(한글은 Noto Sans KR로 대체), 기존 앱 폰트랑 안 섞이게 --font-hub-*로만 씀
const calistoga = Calistoga({
  variable: "--font-calistoga",
  subsets: ["latin"],
  weight: "400",
});

const gothicA1 = Gothic_A1({
  variable: "--font-gothic-a1",
  subsets: ["latin"],
  weight: ["500", "700", "800", "900"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const notoSansKr = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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
      className={`${geistSans.variable} ${geistMono.variable} ${nanumMyeongjo.variable} ${calistoga.variable} ${gothicA1.variable} ${inter.variable} ${notoSansKr.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
