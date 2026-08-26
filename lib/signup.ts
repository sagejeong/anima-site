/**
 * 회원가입 폼에서 쓰는 선택지와 타입 정의.
 * 화면(컴포넌트)과 데이터 정의를 분리해 두면 문항을 추가/수정할 때 이 파일만 고치면 됩니다.
 */

export type Option = {
  value: string;
  label: string;
};

/* ---------------------------------- 기본 정보 --------------------------------- */

export const GENDER_OPTIONS = [
  { value: "male", label: "남성" },
  { value: "female", label: "여성" },
  { value: "other", label: "기타" },
] as const satisfies readonly Option[];

export const COUNTRY_OPTIONS = [
  { value: "kr", label: "대한민국" },
  { value: "other", label: "그 외 국가" },
] as const satisfies readonly Option[];

/** 국가가 대한민국일 때 고르는 지역 목록 */
export const KOREA_REGION_OPTIONS = [
  "서울특별시",
  "부산광역시",
  "대구광역시",
  "인천광역시",
  "광주광역시",
  "대전광역시",
  "울산광역시",
  "세종특별자치시",
  "경기도",
  "강원특별자치도",
  "충청북도",
  "충청남도",
  "전북특별자치도",
  "전라남도",
  "경상북도",
  "경상남도",
  "제주특별자치도",
].map((name) => ({ value: name, label: name })) satisfies readonly Option[];

export const SMOKING_OPTIONS = [
  { value: "current", label: "현재 흡연" },
  { value: "past", label: "과거 흡연" },
  { value: "never", label: "비흡연" },
] as const satisfies readonly Option[];

export const YES_NO_OPTIONS = [
  { value: "yes", label: "예" },
  { value: "no", label: "아니오" },
] as const satisfies readonly Option[];

export const HAS_OPTIONS = [
  { value: "yes", label: "있음" },
  { value: "no", label: "없음" },
] as const satisfies readonly Option[];

export const LIVING_ENVIRONMENT_OPTIONS = [
  { value: "urban", label: "도심" },
  { value: "suburban", label: "교외" },
  { value: "rural", label: "농촌" },
  { value: "industrial", label: "공업지역" },
  { value: "other", label: "기타" },
] as const satisfies readonly Option[];

export const LANGUAGE_OPTIONS = [
  { value: "ko", label: "한국어" },
  { value: "en", label: "영어" },
] as const satisfies readonly Option[];

export const VISIT_PURPOSE_OPTIONS = [
  { value: "self_check", label: "건강 자가 점검" },
  { value: "research", label: "연구 참여" },
  { value: "curiosity", label: "단순 호기심" },
] as const satisfies readonly Option[];

/* ---------------------------------- 건강 정보 --------------------------------- */

export const SYMPTOM_OPTIONS = [
  { value: "cough", label: "기침" },
  { value: "sputum", label: "가래" },
  { value: "runny_nose", label: "콧물·코막힘" },
  { value: "sore_throat", label: "인후통" },
  { value: "dyspnea", label: "호흡곤란" },
  { value: "fever", label: "발열" },
] as const satisfies readonly Option[];

export const SYMPTOM_DURATION_OPTIONS = [
  { value: "none", label: "증상 없음" },
  { value: "under_1w", label: "1주 미만" },
  { value: "1_2w", label: "1~2주" },
  { value: "2_4w", label: "2~4주" },
  { value: "over_4w", label: "4주 이상" },
] as const satisfies readonly Option[];

export const RESPIRATORY_CONDITION_OPTIONS = [
  { value: "asthma", label: "천식" },
  { value: "copd", label: "만성폐쇄성폐질환(COPD)" },
  { value: "rhinitis", label: "알레르기성 비염" },
  { value: "sinusitis", label: "부비동염(축농증)" },
  { value: "bronchitis", label: "기관지염" },
  { value: "tuberculosis", label: "결핵 병력" },
] as const satisfies readonly Option[];

/* ----------------------------------- 폼 데이터 ---------------------------------- */

export type SignupFormData = {
  // 1단계: 동의
  agreedToResearch: boolean;

  // 2단계: 계정
  userId: string;
  password: string;
  passwordConfirm: string;
  recoveryEmail: string;

  // 3단계: 기본 정보
  age: string;
  gender: string;
  country: string;
  region: string;
  smoking: string;
  allergy: string;
  allergyDetail: string;
  dustExposure: string;
  hasPet: string;
  livingEnvironment: string;
  firstVisit: string;
  language: string;
  visitPurpose: string;

  // 4단계: 건강 정보 (선택 입력)
  symptoms: string[];
  symptomDuration: string;
  respiratoryConditions: string[];
  recentInfection: string;
  medication: string;
  note: string;
};

export const INITIAL_SIGNUP_FORM: SignupFormData = {
  agreedToResearch: false,

  userId: "",
  password: "",
  passwordConfirm: "",
  recoveryEmail: "",

  age: "",
  gender: "",
  country: "",
  region: "",
  smoking: "",
  allergy: "",
  allergyDetail: "",
  dustExposure: "",
  hasPet: "",
  livingEnvironment: "",
  firstVisit: "",
  language: "",
  visitPurpose: "",

  symptoms: [],
  symptomDuration: "",
  respiratoryConditions: [],
  recentInfection: "",
  medication: "",
  note: "",
};

/** 필드 이름 → 오류 메시지 */
export type FormErrors = Partial<Record<keyof SignupFormData, string>>;

const USER_ID_PATTERN = /^[a-zA-Z0-9_]{4,20}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** 2단계(계정) 검증 */
export function validateAccountStep(data: SignupFormData): FormErrors {
  const errors: FormErrors = {};

  if (!USER_ID_PATTERN.test(data.userId)) {
    errors.userId = "영문·숫자·밑줄(_) 조합 4~20자로 입력해 주세요.";
  }
  if (data.password.length < 8) {
    errors.password = "비밀번호는 8자 이상이어야 합니다.";
  }
  if (data.password !== data.passwordConfirm) {
    errors.passwordConfirm = "비밀번호가 일치하지 않습니다.";
  }
  if (data.recoveryEmail !== "" && !EMAIL_PATTERN.test(data.recoveryEmail)) {
    errors.recoveryEmail = "이메일 형식이 올바르지 않습니다.";
  }

  return errors;
}

/** 3단계(기본 정보) 검증 */
export function validateBasicInfoStep(data: SignupFormData): FormErrors {
  const errors: FormErrors = {};

  const age = Number(data.age);
  if (data.age === "" || Number.isNaN(age) || age < 1 || age > 120) {
    errors.age = "1~120 사이의 나이를 입력해 주세요.";
  }

  const required: readonly (keyof SignupFormData)[] = [
    "gender",
    "country",
    "region",
    "smoking",
    "allergy",
    "dustExposure",
    "hasPet",
    "livingEnvironment",
    "firstVisit",
    "language",
    "visitPurpose",
  ];

  for (const field of required) {
    if (data[field] === "") {
      errors[field] = "선택해 주세요.";
    }
  }
  if (data.country !== "" && data.region === "") {
    errors.region = "지역을 입력해 주세요.";
  }

  return errors;
}

/** "yes"/"no"/"" → true/false/undefined. 서버는 boolean, 빈 값은 필드 자체를 생략합니다. */
function yesNoToBoolean(value: string): boolean | undefined {
  if (value === "yes") return true;
  if (value === "no") return false;
  return undefined;
}

/** 빈 문자열은 "답하지 않음"이라 서버에 아예 보내지 않습니다. */
function emptyToUndefined(value: string): string | undefined {
  return value === "" ? undefined : value;
}

/**
 * 서버의 POST /profile 요청 본문 형태로 변환합니다.
 * 서버가 정의한 필드명(snake_case)·boolean 타입에 맞춥니다.
 */
export function toProfilePayload(data: SignupFormData) {
  const age = Number(data.age);

  return {
    age: data.age === "" || Number.isNaN(age) ? undefined : age,
    gender: emptyToUndefined(data.gender),
    country: emptyToUndefined(data.country),
    region: emptyToUndefined(data.region),
    language: emptyToUndefined(data.language),
    visit_purpose: emptyToUndefined(data.visitPurpose),
    first_visit: yesNoToBoolean(data.firstVisit),
    smoking: emptyToUndefined(data.smoking),
    allergy: yesNoToBoolean(data.allergy),
    allergy_detail: emptyToUndefined(data.allergyDetail),
    dust_exposure: yesNoToBoolean(data.dustExposure),
    has_pet: yesNoToBoolean(data.hasPet),
    living_environment: emptyToUndefined(data.livingEnvironment),
    symptoms: data.symptoms.length > 0 ? data.symptoms : undefined,
    symptom_duration: emptyToUndefined(data.symptomDuration),
    respiratory_conditions:
      data.respiratoryConditions.length > 0
        ? data.respiratoryConditions
        : undefined,
    recent_infection: yesNoToBoolean(data.recentInfection),
    medication: emptyToUndefined(data.medication),
    note: emptyToUndefined(data.note),
    consented_at: data.agreedToResearch
      ? new Date().toISOString()
      : undefined,
  };
}
