import { cookies } from "next/headers";
import { USER_UUID_COOKIE } from "@/proxy";

/**
 * ANiMA FastAPI 서버 주소.
 * 배포 환경에서는 ANIMA_API_BASE_URL 환경변수로 덮어쓸 수 있습니다.
 */
export const ANIMA_API_BASE_URL =
  process.env.ANIMA_API_BASE_URL ?? "http://158.101.89.133:8000";

/** 서버 응답을 기다리는 최대 시간 (분석에 시간이 걸릴 수 있어 넉넉히 잡습니다) */
const REQUEST_TIMEOUT_MS = 60_000;

/** 쿠키에 심어둔 방문자 UUID를 읽습니다. proxy.ts가 먼저 발급해 둡니다. */
export async function readUserUuid(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(USER_UUID_COOKIE)?.value ?? null;
}

const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: ONE_YEAR_IN_SECONDS,
  secure: process.env.NODE_ENV === "production",
};

/**
 * 방문자 UUID 쿠키를 특정 값으로 덮어씁니다.
 * 로그인 성공 시 이 브라우저를 "그 계정이 원래 쓰던 UUID"로 바꿔치기해,
 * 다른 기기에서도 같은 기록을 이어보게 합니다.
 */
export async function writeUserUuidCookie(userUuid: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(USER_UUID_COOKIE, userUuid, COOKIE_OPTIONS);
}

/** 계정에 로그인/연결된 상태에서만 존재하는 쿠키. 헤더에 아이디를 보여줄 때 씁니다. */
const DISPLAY_ID_COOKIE = "anima_display_id";

export async function readDisplayUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(DISPLAY_ID_COOKIE)?.value ?? null;
}

export async function writeDisplayUserIdCookie(userId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(DISPLAY_ID_COOKIE, userId, COOKIE_OPTIONS);
}

/**
 * 로그아웃: 두 쿠키를 모두 지웁니다.
 * user_uuid까지 지우는 이유는, 이 브라우저를 다시 "이름 없는 방문자" 상태로
 * 되돌리기 위해서입니다. 다음 요청부터 proxy.ts가 새 게스트 UUID를 발급합니다.
 * 계정에 쌓인 기존 기록은 서버에 그대로 남아 있고, 이 브라우저에서만 로그아웃됩니다.
 */
export async function clearAuthCookies(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(USER_UUID_COOKIE);
  cookieStore.delete(DISPLAY_ID_COOKIE);
}

export function animaUrl(
  path: string,
  searchParams?: Record<string, string>,
): string {
  const url = new URL(path, ANIMA_API_BASE_URL);
  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      url.searchParams.set(key, value);
    }
  }
  return url.toString();
}

export type AnimaApiResult<T> =
  | { ok: true; status: number; data: T }
  | { ok: false; status: number; error: string };

/**
 * ANiMA 서버를 호출합니다. 브라우저가 아니라 이 서버에서 부르기 때문에
 * CORS 설정이 필요 없고, 나중에 사이트를 https로 배포해도 막히지 않습니다.
 */
export async function callAnimaApi<T>(
  url: string,
  init?: RequestInit,
): Promise<AnimaApiResult<T>> {
  try {
    const response = await fetch(url, {
      ...init,
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      cache: "no-store",
    });

    const text = await response.text();
    let data: unknown = null;
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        return {
          ok: false,
          status: response.status,
          error: `서버가 JSON이 아닌 응답을 보냈습니다: ${text.slice(0, 200)}`,
        };
      }
    }

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        error:
          typeof data === "object" && data !== null && "detail" in data
            ? JSON.stringify((data as { detail: unknown }).detail)
            : `서버가 ${response.status} 상태로 응답했습니다.`,
      };
    }

    return { ok: true, status: response.status, data: data as T };
  } catch (error) {
    const isTimeout = error instanceof Error && error.name === "TimeoutError";
    return {
      ok: false,
      status: isTimeout ? 504 : 502,
      error: isTimeout
        ? "서버 응답이 없어 시간이 초과되었습니다."
        : "서버에 연결하지 못했습니다.",
    };
  }
}
