# 🧭 GPU FOUNDER — 에이전트 공통 개발 규칙 (AGENTS.md)

이 문서는 `GPU FOUNDER (한국 GPU 스타트업 타이쿤)` 프로젝트의 모든 메인 에이전트와 서브에이전트에게 자동 주입되는 최상위 규칙입니다.

## 1. 기술 제약 (절대 준수)
* **순수 HTML5 + Vanilla JS**: 빌드 도구(Vite/Webpack), npm 패키지, 외부 프레임워크 사용 금지.
* **`file://` 로컬 실행 보장**: `game/index.html`을 브라우저에서 더블클릭만으로 실행할 수 있어야 함.
  * ❌ `import` / `export` (ES Modules) 사용 금지 (로컬 `file://` CORS 차단 방지)
  * ❌ `fetch()`로 로컬 `.json` 로드 금지
* **전역 네임스페이스 규칙**:
  * 모든 정적 기획 데이터는 `window.GAME_DATA = window.GAME_DATA || {};` 하위 프로퍼티로 등록 (`game/data/*.js`)
  * 모든 시스템 모듈은 `window.Systems = window.Systems || {};` 하위 객체나 전역 함수로 등록 (`game/js/systems/*.js`)
* **스크립트 로드 순서 (`game/index.html`)**:
  1. `game/data/*.js` (`economy.js`, `staff.js`, `events.js`, `pitching.js`, `hardware.js`, `endings.js`)
  2. `game/js/core/*.js` (`sound.js`, `utils.js`, `state.js`)
  3. `game/js/systems/*.js` (`office.js`, `hr.js`, `events.js`, `pitching.js`, `hardware.js`, `endings.js`)
  4. `game/js/ui/*.js` (`render.js`, `modals.js`)
  5. `game/js/main.js`

## 2. 단위 · 시간 · 계절 체계
* **통화**: 원(KRW) 정수. 화면 표시는 `formatKRW(val)` 사용 (만/억/조 단위 자동 변환).
* **시간**: `1게임일 = 2초`, `1게임월 = 30일 = 60초 실시간`, `1년 = 12개월`, **최대 84개월(7년)**.
* **시작 시점**: `2025년 3월` (`month = 0`, `calendarMonth = 3`, 예비창업자 신분).
* **계절/월별 효과**:
  * `7~8월` (여름 폭염): 전력 피크 할증 (전기요금 ×1.4, 외기냉방 효율 급감, 실내 기본 온도 상승)
  * `12~2월` (겨울 한파): 외기냉방 효율 ×1.5, 실내 기본 온도 하강
  * `6월, 12월` (대학원 기말고사): AI 클라우드 스팟 렌탈 수요/수익 ×1.5
  * `2월, 8월` (졸업 시즌): 대학원 산학협력(AI 리서처) 채용 채널 오픈

## 3. 공통 상태 변수 (`state`) 표준 스키마
모든 서브시스템과 이벤트 효과·조건식은 반드시 아래 이름을 기준으로 참조/변경합니다.

| 키 | 타입/범위 | 설명 |
| :--- | :--- | :--- |
| `money` | Number | 보유 현금 (KRW) |
| `creditScore` | 0~1000 | 신용점수 (`getCreditTier()`로 AAA/A/B/C/D 환산) |
| `reputation` | 0~100 | 기업 평판 (고객·투자자·언론, 기본 50) |
| `ceoStress` | 0~100 | 대표 스트레스 (100 도달 + 직원 전멸 시 B4 배드엔딩) |
| `ceoHealth` | 0~100 | 대표 체력 (기본 100) |
| `ceoEquity` | 0~100 | 대표 지분율 % (기본 100%, VC 투자·스톡옵션 부여 시 차감) |
| `lieMeter` | Number | 피칭 블러핑 거짓말 누적 횟수 |
| `morale` | 0~100 | 전 직원 평균 사기 |
| `burnout` | 0~100 | 전 직원 평균 번아웃 |
| `totalTflops` | Number | 총 가동 연산력 (TFLOPS, 읽기전용 캐시) |
| `monthlyProfit` | Number | 직전 월 순이익 (읽기전용) |
| `month` | 0~84 | 경과 개월 수 |
| `calendarMonth` | 1~12 | 현재 달력 월 (3월부터 시작) |
| `year` | Number | 현재 연도 (2025년부터 시작) |
| `dayProgress` | 0~60 | 현재 월 내 경과 초 (0~60초) |
| `speed` | 0, 1, 2, 4 | 게임 배속 (0=일시정지, 1=1배속, 2=2배속, 4=4배속) |
| `employees` | Array | 재직 중인 직원 목록 (`{ uid, jobId, name, skill, morale, burnout, loyalty, salary, stockOption, monthsEmployed, isFake }`) |
| `welfare` | Object | 활성화된 사내 복지/문화 토글 맵 |
| `flags` | Object | 불리언 상태 플래그 (`bizRegistered`, `listed`, `govBanned`, `grantFraud`, `auditCaught`, `hasAdminStaff`, `hadEmployees`, `landlordMaxed`, `acceptedMnA`, `hasChuncheonDC` 등) |
| `modifiers` | Array | 기간형 버프/디버프 (`{ id, name, stat, mul, add, months }`) |

## 4. 파일 소유권 및 에이전트 분업 규칙
동시 작업 시 충돌을 방지하기 위해 각 서브에이전트는 지정된 담당 파일만 수정합니다.
* **인사(HR) 에이전트**: `game/data/staff.js`, `game/js/systems/hr.js`
* **랜덤 이벤트 에이전트**: `game/data/events.js`, `game/js/systems/events.js`
* **피칭 미니게임 에이전트**: `game/data/pitching.js`, `game/js/systems/pitching.js`
* **하드웨어/테크트리 & 엔딩 에이전트**: `game/data/hardware.js`, `game/data/endings.js`, `game/js/systems/hardware.js`, `game/js/systems/endings.js`
* **코어 & UI 통합 (PM 에이전트)**: `game/data/economy.js`, `game/js/core/*.js`, `game/js/systems/office.js`, `game/js/ui/*.js`, `game/js/main.js`, `game/index.html`, `game/style.css`
