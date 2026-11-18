// 회원가입 폼에서 쓰는 타입 모음. 계정(아이디/비번) 관련만 남음 — 기본정보·건강정보
// 질문은 서버 분석에 안 쓰여서 전부 삭제함(2026-11-18)

export type Option = {
  value: string;
  label: string;
};

export type SignupFormData = {
  agreedToTerms: boolean;

  userId: string;
  password: string;
  passwordConfirm: string;
  recoveryEmail: string;
};

export const INITIAL_SIGNUP_FORM: SignupFormData = {
  agreedToTerms: false,

  userId: "",
  password: "",
  passwordConfirm: "",
  recoveryEmail: "",
};

/** 필드 이름별 오류 메시지 */
export type FormErrors = Partial<Record<keyof SignupFormData, string>>;

export const USER_ID_PATTERN = /^[a-zA-Z0-9]{4,20}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_HAS_LETTER = /[a-zA-Z]/;
const PASSWORD_HAS_DIGIT = /[0-9]/;
const PASSWORD_HAS_SPECIAL = /[^a-zA-Z0-9]/;

// 관리자 로그인 아이디(proxy.ts의 getAdminId())와 겹치면 혼동되니 일반 회원가입에서는 막음
const RESERVED_USER_IDS = new Set(["admin"]);

export function isReservedUserId(userId: string): boolean {
  return RESERVED_USER_IDS.has(userId.toLowerCase());
}

export function isValidSignupPassword(password: string): boolean {
  return (
    password.length >= 8 &&
    PASSWORD_HAS_LETTER.test(password) &&
    PASSWORD_HAS_DIGIT.test(password) &&
    PASSWORD_HAS_SPECIAL.test(password)
  );
}

/** 계정 만들기 단계 검증 */
export function validateAccountStep(data: SignupFormData): FormErrors {
  const errors: FormErrors = {};

  if (!USER_ID_PATTERN.test(data.userId)) {
    errors.userId = "영문, 숫자 조합 4~20자로 입력해 주세요.";
  } else if (isReservedUserId(data.userId)) {
    errors.userId = "사용할 수 없는 아이디입니다.";
  }
  if (!isValidSignupPassword(data.password)) {
    errors.password = "비밀번호는 숫자, 영문, 특수문자를 포함해 8자 이상이어야 합니다.";
  }
  if (data.password !== data.passwordConfirm) {
    errors.passwordConfirm = "비밀번호가 일치하지 않습니다.";
  }
  if (data.recoveryEmail !== "" && !EMAIL_PATTERN.test(data.recoveryEmail)) {
    errors.recoveryEmail = "이메일 형식이 올바르지 않습니다.";
  }

  return errors;
}

/** 서비스 이용 동의 시각만 서버에 남긴다. 계정 생성 전에도 동의 기록은 남아야 해서 별도로 보냄 */
export function toProfilePayload(data: SignupFormData) {
  return {
    consented_at: data.agreedToTerms ? new Date().toISOString() : undefined,
  };
}
