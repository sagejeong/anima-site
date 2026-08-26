# ANiMA 웹 연동을 위한 서버 DB 확장 제안

본 문서는 웹사이트(Next.js)를 기존 FastAPI 서버에 연동하기 위해 필요한 **서버 측 DB 변경 사항**을 정리한 것입니다. 앱의 「DB 설계 및 저장로직 V8」 문서를 기준으로 하며, 그 문서에서 다루지 않는 부분만 다룹니다.

- 대상 서버: `158.101.89.133:8000`
- 기준 문서: DB 설계 및 저장로직 V8 (2026-07-15)
- 작성일: 2026-08-09

---

## 0. 배경 — 왜 확장이 필요한가

**웹에는 로컬 DB가 없습니다.** 앱이 로컬 SQLite를 두는 이유는 오프라인 대응(지하철에서 녹음 → 나중에 동기화)인데, 브라우저는 인터넷이 끊기면 페이지 자체가 열리지 않습니다. 따라서 웹은 녹음 즉시 서버로 전송하며, `sync_status` · `local_audio_path` 같은 동기화 컬럼이 필요 없습니다. 브라우저가 보관하는 것은 `user_uuid` 값 하나뿐입니다.

그래서 웹 때문에 생기는 변경은 전부 **서버 쪽**에 있으며, 두 가지입니다.

**(1) 웹은 UUID만으로 같은 사용자를 계속 추적할 수 없습니다.**
앱은 기기에 저장한 `user_uuid`가 안정적으로 유지됩니다. 그러나 브라우저 저장소는 사용자가 "쿠키 및 사이트 데이터 삭제"를 하면 사라지고, **iOS 사파리는 7일간 해당 사이트 미방문 시 자동 삭제**합니다. UUID가 끊기면 한 사람의 기록이 여러 명으로 쪼개져, V8에서 준비 중인 **개인화 기준 분포(embedding_vector 누적)를 만들 수 없습니다.**

→ 해결: 처음에는 UUID로 바로 시작하되, 원하는 사용자는 아이디를 만들어 UUID를 계정에 묶을 수 있게 합니다. (게스트 → 계정 승급 방식)

**(2) 웹은 앱이 받지 않는 참여자 정보를 받습니다.**
나이·성별·흡연 여부·생활 환경 등 20개 항목을 수집하는데, 이는 측정마다 반복되는 값이 아니라 사람에 1건인 정보입니다. MRRecord(측정 1건 = 1행)에도, User(UUID와 OS만 존재)에도 넣을 자리가 없습니다.

→ 해결: `UserProfile` 테이블을 신설합니다.

---

## 1. User 테이블 확장 (컬럼 4개 추가)

기존 `user_uuid`는 PK 그대로 유지합니다. 앱 사용자는 추가 컬럼이 전부 NULL이므로 **앱 코드는 수정하지 않아도 됩니다.**

|      컬럼명      | 데이터 타입 |     제약 조건     | 설명 |
| :--------------: | :---------: | :---------------: | :--- |
| **user_id** | TEXT | NULL, UNIQUE | 웹에서 만든 계정 아이디. 계정을 만들지 않은 사용자는 NULL |
| **password_hash** | TEXT | NULL | 비밀번호 해시(bcrypt 또는 argon2). 평문 저장 금지 |
| **recovery_email** | TEXT | NULL | 비밀번호 재설정 전용. 선택 입력이며 분석 데이터와 분리 보관 |
| **account_linked_at** | TEXT | NULL | 게스트 UUID를 계정에 묶은 시각 (ISO8601) |

### device_os 값 추가

기존 `device_os`는 Android / IOS 두 값을 씁니다. 여기에 **`WEB`** 을 추가해 주십시오. 웹에서 발급된 UUID를 구분하기 위함입니다.

---

## 2. UserProfile 테이블 신설

`user_uuid`를 키로 하는 1:1 테이블입니다. 웹 참여자만 값을 갖고, 앱 사용자는 행이 없어도 무방합니다. 모든 항목은 참여자가 건너뛸 수 있으므로 **NULL을 허용해야 합니다.**

### 2-1. 식별 / 기본 정보

|      컬럼명      | 데이터 타입 | 제약 조건 | 설명 |
| :--------------: | :---------: | :-------: | :--- |
| **user_uuid** | TEXT | PK, NOT NULL | User.user_uuid 참조 |
| **age** | INTEGER | NULL | 나이 (1~120) |
| **gender** | TEXT | NULL | `male` / `female` / `other` |
| **country** | TEXT | NULL | `kr` / `other` |
| **region** | TEXT | NULL | country가 kr이면 시·도명, 그 외에는 자유 입력 |
| **language** | TEXT | NULL | 주 사용 언어. `ko` / `en` |
| **visit_purpose** | TEXT | NULL | `self_check` / `research` / `curiosity` |
| **first_visit** | INTEGER | NULL | 첫 방문 여부 (0/1) |

### 2-2. 생활 환경 / 위험 요인

|      컬럼명      | 데이터 타입 | 제약 조건 | 설명 |
| :--------------: | :---------: | :-------: | :--- |
| **smoking** | TEXT | NULL | `current` / `past` / `never` |
| **allergy** | INTEGER | NULL | 알레르기 유무 (0/1) |
| **allergy_detail** | TEXT | NULL | 알레르기 종류 (자유 입력) |
| **dust_exposure** | INTEGER | NULL | 최근 2주 내 미세먼지·대기오염 심한 곳 노출 (0/1) |
| **has_pet** | INTEGER | NULL | 반려동물 보유 (0/1) |
| **living_environment** | TEXT | NULL | `urban` / `suburban` / `rural` / `industrial` / `other` |

### 2-3. 건강 정보

|      컬럼명      | 데이터 타입 | 제약 조건 | 설명 |
| :--------------: | :---------: | :-------: | :--- |
| **symptoms** | TEXT | NULL | 현재 증상. JSON 배열 문자열 (embedding_vector와 같은 저장 방식) |
| **symptom_duration** | TEXT | NULL | `none` / `under_1w` / `1_2w` / `2_4w` / `over_4w` |
| **respiratory_conditions** | TEXT | NULL | 진단받은 호흡기 질환. JSON 배열 문자열 |
| **recent_infection** | INTEGER | NULL | 최근 2주 내 호흡기 감염 (0/1) |
| **medication** | TEXT | NULL | 복용 중인 약 (자유 입력) |
| **note** | TEXT | NULL | 참여자가 추가로 남긴 내용 |

### 2-4. 동의 / 시각

|      컬럼명      | 데이터 타입 | 제약 조건 | 설명 |
| :--------------: | :---------: | :-------: | :--- |
| **consented_at** | TEXT | NULL | 연구 참여 동의 시각 (ISO8601) |
| **created_at** | TEXT | NOT NULL DEFAULT(datetime('now')) | 레코드 생성 시각 |
| **updated_at** | TEXT | NOT NULL DEFAULT(datetime('now')) | 최종 수정 시각 |

---

## 3. 코드값 정의

웹은 아래 값을 그대로 전송합니다. 서버에서 다른 표기를 원하시면 맞추겠습니다.

| 항목 | 허용 값 | 화면 표기 |
| :--- | :--- | :--- |
| gender | `male` / `female` / `other` | 남성 / 여성 / 기타 |
| country | `kr` / `other` | 대한민국 / 그 외 국가 |
| smoking | `current` / `past` / `never` | 현재 흡연 / 과거 흡연 / 비흡연 |
| living_environment | `urban` / `suburban` / `rural` / `industrial` / `other` | 도심 / 교외 / 농촌 / 공업지역 / 기타 |
| language | `ko` / `en` | 한국어 / 영어 |
| visit_purpose | `self_check` / `research` / `curiosity` | 건강 자가 점검 / 연구 참여 / 단순 호기심 |
| symptoms (배열) | `cough` / `sputum` / `runny_nose` / `sore_throat` / `dyspnea` / `fever` | 기침 / 가래 / 콧물·코막힘 / 인후통 / 호흡곤란 / 발열 |
| symptom_duration | `none` / `under_1w` / `1_2w` / `2_4w` / `over_4w` | 증상 없음 / 1주 미만 / 1~2주 / 2~4주 / 4주 이상 |
| respiratory_conditions (배열) | `asthma` / `copd` / `rhinitis` / `sinusitis` / `bronchitis` / `tuberculosis` | 천식 / COPD / 알레르기성 비염 / 부비동염 / 기관지염 / 결핵 병력 |
| 0/1 항목 | `0` / `1` | 아니오·없음 / 예·있음 |

---

## 4. MRRecord 변경 사항

**컬럼 추가는 없습니다.** 다만 값 하나만 늘려주십시오.

| 컬럼 | 기존 값 | 추가 요청 |
| :--- | :--- | :--- |
| **source_device_type** | `APP` / `WEARABLE` | **`WEB`** 추가 |

웹이 채우지 못하는 컬럼은 NULL로 전송됩니다. 참고용으로 정리하면 아래와 같습니다.

- **채울 수 있음** — `record_uuid`, `user_uuid`, `source_device_type`, `measured_at`, `record_date`, `audio_duration_sec`, `client_app_version`
- **서버 응답으로 채워짐** — `cough_detected`, `cough_confidence`, `quality_*`, `final_*`, `healthy_distance`, `embedding_vector`, `risk_level`
- **웹에서 채울 수 없음** — `pm10`, `pm25`, `temperature`, `humidity`, `weather_desc` 등 환경 정보. 브라우저는 위치 권한을 따로 요구해야 하고 거부율이 높아, 1차에서는 수집하지 않습니다. 필요하시면 방법을 검토하겠습니다.
- **웹에 해당 없음** — `local_audio_path`, `sync_status`, `sync_retry_count`, `last_sync_attempt_at` 등 오프라인 동기화 컬럼

---

## 5. 새로 필요한 엔드포인트

현재 서버에 있는 `POST /upload`, `GET /records`는 그대로 사용합니다. 아래 세 개만 추가로 필요합니다.

| 메서드 | 경로(안) | 요청 | 응답 | 용도 |
| :--- | :--- | :--- | :--- | :--- |
| POST | `/profile` | `user_uuid` + 2장의 항목들 | 성공 여부 | 참여 정보 저장 (있으면 갱신) |
| POST | `/account/register` | `user_uuid`, `user_id`, `password`, `recovery_email?` | 성공 여부 | 게스트 UUID를 계정에 묶음 |
| POST | `/account/login` | `user_id`, `password` | `user_uuid` | 다른 기기·브라우저에서 기존 기록 이어받기 |

경로와 요청 형식은 서버 편한 대로 정하셔도 됩니다. 웹이 맞추겠습니다.

**아이디 중복 확인**은 `/account/register`가 409 같은 상태 코드로 알려주면 별도 엔드포인트 없이 처리할 수 있습니다.

---

## 6. 저장 흐름

1. **첫 접속** — 웹이 UUID를 생성해 브라우저 쿠키에 1년 만료로 저장합니다. 이 시점에는 서버에 아무것도 보내지 않습니다.
2. **첫 녹음** — `POST /upload`에 `file`과 `user_uuid`를 함께 전송합니다. 이때 서버에 User 행이 없으면 `device_os='WEB'`으로 생성해 주십시오.
3. **참여 정보 입력** — 동의 후 `POST /profile`로 UserProfile을 저장합니다. 건너뛴 항목은 NULL로 전송됩니다.
4. **계정 만들기(선택)** — 결과 화면에서 안내하며, `POST /account/register`로 기존 `user_uuid`에 아이디·비밀번호를 붙입니다. **UUID가 그대로이므로 이전 기록이 전부 유지됩니다.**
5. **다른 기기에서 로그인** — `POST /account/login`으로 `user_uuid`를 받아 쿠키에 심으면, 그 브라우저도 같은 사용자로 동작합니다.

---

## 7. 확인 부탁드리는 사항

1. `/upload` 응답이 V8 문서의 매핑 형식과 동일한지 (실제 응답 예시 1건이면 충분합니다)
2. `/upload`의 `file`이 `webm(opus)`, `mp4(aac)` 형식을 받는지. 브라우저는 wav를 생성할 수 없어, 필요하다면 서버 측 변환이 필요합니다
3. `/records/sync`의 `records` 배열이 MRRecord 컬럼 구조 그대로인지
4. 테스트 업로드를 진행해도 되는지, 또는 테스트용 `user_uuid` 규칙을 정할지
5. 위 테이블 확장이 가능한지, 일정이 어느 정도 걸릴지

CORS 설정은 필요하지 않습니다. 웹 서버가 중계하는 방식으로 처리하겠습니다.
