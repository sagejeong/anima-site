import type { CheckinStatus } from "@/lib/hub-roster";

// 발표용 데모 데이터. hub-roster 실 체크인 기록과는 별개, 화면엔 "예시 데이터" 배지 표시

export type DemoResident = {
  id: string;
  label: string;
  room: string;
  team: string;
  percent: number;
  status: CheckinStatus;
};

export type DemoAlert = {
  id: string;
  residentId: string;
  session: "오전 체크" | "오후 체크";
  percent: number;
  status: CheckinStatus;
  when: string;
};

export const DEMO_RESIDENTS: readonly DemoResident[] = [
  { id: "d1", label: "입소자 A", room: "301호", team: "3병동", percent: 22, status: "양호" },
  { id: "d2", label: "입소자 B", room: "204호", team: "2병동", percent: 41, status: "주의" },
  { id: "d3", label: "입소자 C", room: "112호", team: "1병동", percent: 58, status: "경고" },
  { id: "d4", label: "입소자 D", room: "108호", team: "1병동", percent: 15, status: "양호" },
  { id: "d5", label: "입소자 E", room: "206호", team: "2병동", percent: 29, status: "주의" },
  { id: "d6", label: "입소자 F", room: "305호", team: "3병동", percent: 19, status: "양호" },
  { id: "d7", label: "입소자 G", room: "402호", team: "재활병동", percent: 24, status: "양호" },
  { id: "d8", label: "입소자 H", room: "115호", team: "1병동", percent: 33, status: "주의" },
  { id: "d9", label: "입소자 I", room: "210호", team: "2병동", percent: 21, status: "양호" },
  { id: "d10", label: "입소자 J", room: "308호", team: "3병동", percent: 17, status: "양호" },
] as const;

export const DEMO_WEEKLY_AFTER: readonly { date: string; average: number }[] = [
  { date: "09-17", average: 21 },
  { date: "09-18", average: 24 },
  { date: "09-19", average: 19 },
  { date: "09-20", average: 27 },
  { date: "09-21", average: 31 },
  { date: "09-22", average: 23 },
  { date: "09-23", average: 26 },
];

export const DEMO_TODAY_SESSIONS = {
  before: 18,
  beforeCount: 9,
  after: 27,
  afterCount: 8,
} as const;

export const DEMO_ALERTS: readonly DemoAlert[] = [
  { id: "a1", residentId: "d3", session: "오후 체크", percent: 58, status: "경고", when: "오늘 14:32" },
  { id: "a2", residentId: "d2", session: "오후 체크", percent: 41, status: "주의", when: "오늘 13:50" },
  { id: "a3", residentId: "d8", session: "오전 체크", percent: 33, status: "주의", when: "오늘 09:12" },
  { id: "a4", residentId: "d5", session: "오후 체크", percent: 29, status: "주의", when: "어제 15:40" },
];

// 알림 이력 화면용, 며칠치 쌓인 것처럼 길게 잡은 목록
export const DEMO_ALERTS_HISTORY: readonly DemoAlert[] = [
  { id: "h1", residentId: "d3", session: "오후 체크", percent: 58, status: "경고", when: "오늘 14:32" },
  { id: "h2", residentId: "d2", session: "오후 체크", percent: 41, status: "주의", when: "오늘 13:50" },
  { id: "h3", residentId: "d8", session: "오전 체크", percent: 33, status: "주의", when: "오늘 09:12" },
  { id: "h4", residentId: "d5", session: "오후 체크", percent: 29, status: "주의", when: "어제 15:40" },
  { id: "h5", residentId: "d3", session: "오전 체크", percent: 44, status: "주의", when: "어제 08:55" },
  { id: "h6", residentId: "d7", session: "오후 체크", percent: 61, status: "경고", when: "2일 전 16:03" },
  { id: "h7", residentId: "d9", session: "오후 체크", percent: 32, status: "주의", when: "2일 전 14:20" },
  { id: "h8", residentId: "d2", session: "오전 체크", percent: 37, status: "주의", when: "3일 전 09:47" },
  { id: "h9", residentId: "d6", session: "오후 체크", percent: 56, status: "경고", when: "4일 전 15:12" },
  { id: "h10", residentId: "d8", session: "오후 체크", percent: 31, status: "주의", when: "5일 전 13:29" },
] as const;

export function statusFor(percent: number): CheckinStatus {
  if (percent >= 55) return "경고";
  if (percent >= 30) return "주의";
  return "양호";
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
