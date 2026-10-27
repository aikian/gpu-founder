# 🔧 개선 스프린트 1 — 공통 계약서 (모든 에이전트 필독)

> 작성: PM. 이 문서의 계약은 AGENTS.md 다음으로 우선합니다.

## 진단된 구조 버그
1. **발열 평형 없음**: `main.js` 온도가 `(heat - cool) * 0.3 * dt` 선형 누적 → 105°C 고착, GPU 전멸.
2. **Modifier 이중 적용**: `hardware.js getGpuEffectiveSpecs()`가 `tflops/power/heat` 전역 modifier를 GPU마다 적용하고, `office.js`/`main.js`가 또 적용. `add`는 GPU 수만큼 중복.
3. **이벤트 과다**: `systems/events.js checkMonthlyEvents()`가 eligible 이벤트마다 개별 확률 판정 → 거의 매달 발생.
4. **이벤트 조건 미비**: 당근 구매 이력 없는데 벽돌사기, 조건 없이 VC 3억 등.

## 계약 A — 전역 Modifier 적용 위치 (단일화)
* `getGpuEffectiveSpecs(gpu, officeTemp)`는 **GPU 고유 물리만** 계산 (clockMul, efficiency, health, mods, tempOffset, 열 스로틀링). **전역 modifier(`getStatModifier`) 사용 금지.** → 하드웨어 에이전트 담당
* 전역 `tflops` modifier: `office.js calculateGlobalSpecs()`에서 합계에 1회 적용 (`mul` 곱, `add` 1회 가산).
* 전역 `power`: 전기요금 및 사업장 전력 합계에서 1회. 전역 `heat`: `main.js` 사업장 발열 합계에서 1회. → 코어 에이전트 담당

## 계약 B — 열 모델
* **코어(main.js)**: 사업장 온도는 평형점으로 수렴.
  ```
  heatRatio = heatGen / max(coolingRate, 0.5)
  target    = ambient + 35 * heatRatio            (상한 110)
  temp     += (target - temp) * (1 - exp(-dt / 20))
  ```
  `temp >= 95` → 사업장 **열 보호 셧다운** (`office.thermalShutdown = true`, 15초, GPU 정지, 토스트/로그), 이후 자동 재가동.
* **하드웨어(hardware.js)**:
  * 열 스로틀링: GPU 실효온도(`officeTemp + tempOffset`) > 83°C → `tflops × max(0.5, 1 - (t-83)*0.04)`
  * 마모: 실효온도 > 80°C 일 때만 `health -= (t-80) * 0.01 * dt * miningMul(1.5) * wearMul * hrFailMul`
  * 자연 노화: 채굴에디션은 상시 미세 마모 `0.0005*dt` 허용.
* `office.thermalShutdown`은 `office.isTripped`처럼 TFLOPS·전력 0 처리 (코어가 office.js에서 처리, 하드웨어는 tickHardwareWear에서 셧다운 사업장 스킵).

## 계약 C — 이벤트 빈도 & 효과
* 월간 이벤트: **기본 발생확률 35%/월** (난이도/평판 보정 가능), 발생 시 eligible 중 `chancePerMonth`를 **가중치**로 1개 추첨. 캘린더 고정 이벤트(`trigger.calendarMonth`)는 이 게이트와 별개로 해당 월에 확정 발생(최대 1개).
* 모든 `modifier` 효과는 **반드시 `months` 명시** (영구 효과 금지, 최대 12).
* GPU 실물 변동은 modifier가 아닌 **실제 GPU 추가/제거 효과**로: `addGpus: { model, count, isMining }`, `breakRandomGpu: n`, `damageRandomGpu: { count, health }` — `systems/events.js`에서 구현.
* 조건 플래그는 기존 state 필드로 판정하거나 이벤트 효과로 직접 세팅. 코어가 세팅해줘야 하는 플래그는 보고서 "코어 요청"에 기재.

## 계약 D — 검증
* 각 에이전트 완료 전: `Get-ChildItem game -Recurse -Filter *.js | % { node --check $_.FullName }` 및 `node tests/sim_bot.js` 실행. (다른 에이전트가 동시 수정 중이므로 일시적 실패는 원인 파일 소유자에게 보고만.)
* `tests/sim_bot.js`는 코어 에이전트 소유.

## 소유권 (AGENTS.md 준수)
| 에이전트 | 파일 |
| :--- | :--- |
| 코어 시뮬 | `game/data/economy.js`, `game/js/core/*.js`, `game/js/systems/office.js`, `game/js/main.js`, `tests/sim_bot.js` |
| UI | `game/js/ui/*.js`, `game/index.html`, `game/style.css` |
| 이벤트 | `game/data/events.js`, `game/js/systems/events.js`, `docs/design/02_random_events.md` |
| 하드웨어·엔딩 | `game/data/hardware.js`, `game/data/endings.js`, `game/js/systems/hardware.js`, `game/js/systems/endings.js`, `docs/design/04_*`, `docs/design/05_*` |
| 인사·피칭 | `game/data/staff.js`, `game/js/systems/hr.js`, `game/data/pitching.js`, `game/js/systems/pitching.js`, `docs/design/01_*`, `docs/design/03_*` |
