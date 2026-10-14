import fs from "fs";
import path from "path";

// 대시보드 "시설 정보" 저장소. hub-roster.ts와 같은 파일 기반 방식.
// 로그인 아이디(admin)는 환경변수로만 관리되는 값이라 여기 포함 안 함

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_PATH = path.join(DATA_DIR, "facility-settings.json");

export type FacilitySettings = {
  siteName: string;
  adminName: string;
  email: string;
};

const DEFAULT_SETTINGS: FacilitySettings = {
  siteName: "ANiMA Hub",
  adminName: "아니마",
  email: "sagejeong999@gmail.com",
};

export function readFacilitySettings(): FacilitySettings {
  try {
    const raw = fs.readFileSync(STORE_PATH, "utf-8");
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function writeFacilitySettings(patch: Partial<FacilitySettings>): FacilitySettings {
  const next = { ...readFacilitySettings(), ...patch };
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(STORE_PATH, JSON.stringify(next, null, 2), "utf-8");
  return next;
}
