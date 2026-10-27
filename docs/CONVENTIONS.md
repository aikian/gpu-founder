# 🧭 개발 공통 규칙 (모든 작업자/에이전트 필독)

## 1. 기술 제약
* 순수 HTML5 + Vanilla JS. 빌드 도구·npm·프레임워크 금지.
* `game/index.html`을 **file:// 로 더블클릭 실행**해야 함 → **ES Module(`import`) 금지, `fetch()`로 JSON 로드 금지.**
* 데이터는 `game/data/*.js`에 전역 객체로 선언:
  ```js
  window.GAME_DATA = window.GAME_DATA || {};
  window.GAME_DATA.gpus = { ... };
  ```
* 스크립트 로드 순서: `data/*.js` → `js/core/*.js` → `js/systems/*.js` → `js/ui/*.js` → `js/main.js`

## 2. 단위 · 시간
* 통화: **원(KRW) 정수**. 표시는 `formatKRW()` (만/억 단위).
* **1게임일 = 2초, 1게임월 = 30일 = 60초 실시간**, 1년 = 12개월. 최대 84개월(7년).
* 게임 시작: **2025년 3월** (예비창업자 신분, 사업자 미등록).
* 전력: W, 냉각력: 초당 °C 하강량 단위 `coolRate`, 연산력: TFLOPS(FP16 기준 게임 수치).

## 3. 공통 상태 변수 이름 (이벤트 효과·조건에서 이 이름만 사용)
| 키 | 의미 |
| :--- | :--- |
| `money` | 보유 현금 |
| `creditScore` | 신용점수 0~1000 |
| `reputation` | 평판 0~100 (고객·투자자·언론) |
| `ceoStress` | 대표 스트레스 0~100 |
| `ceoHealth` | 대표 체력 0~100 |
| `ceoEquity` | 대표 지분 % |
| `lieMeter` | 거짓말 누적 |
| `morale` | 직원 평균 사기 (효과 적용 시 전원) |
| `burnout` | 직원 평균 번아웃 |
| `totalTflops` | 총 연산력 (조건용, 읽기전용) |
| `monthlyProfit` | 직전 월 순이익 (읽기전용) |
| `month` | 경과 개월 (0부터), `calendarMonth` 1~12 |
| `flags.*` | 불리언 플래그 (예: `flags.bizRegistered`, `flags.listed`, `flags.govBanned`) |
| `modifiers[]` | 기간형 효과 `{ id, stat, mul|add, months }` |

## 4. 이벤트/효과 스키마
```js
{
  id: 'grant_audit',
  title: '...', text: '...',
  trigger: { minMonth: 6, chancePerMonth: 0.08, cooldownMonths: 12,
             require: "flags.hasGrant && !flags.hasAdminStaff" },   // JS 표현식 문자열, state 기준
  choices: [
    { label: '...', effects: { money: -50000000, creditScore: +20 }, result: '...' },
    { label: '...', cost: 5000000,
      outcomes: [ { chance: 0.5, effects: {...}, result: '...' },
                  { chance: 0.5, effects: { 'flags.govBanned': true }, result: '...' } ] }
  ]
}
```
* 기간형 효과: `effects: { modifier: { stat: 'cloudIncome', mul: 0.5, months: 1 } }`
* 수익 배율 stat 이름: `cryptoIncome`, `cloudIncome`, `saasIncome`, `corpIncome`, `allIncome`, `tflops`, `power`, `heat`, `electricPrice`, `rent`

## 5. 파일 소유권 (동시 작업 충돌 방지)
* 자기 담당 파일 외에는 **수정 금지**. 필요하면 보고서에 "변경 요청"으로 남길 것.
* 수치의 단일 기준(Source of Truth): `docs/design/00_economy_balance.md` + `game/data/economy.js`
