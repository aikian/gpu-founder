---
name: smoke-test
description: Verify that game/index.html and all loaded scripts run cleanly with zero syntax errors, missing globals, or broken DOM bindings.
---

# Smoke Test Skill (`smoke-test`)

UI 또는 시스템 코드를 수정한 뒤 출시/통합 전 수행하는 필수 점검 절차입니다.

## 1. 로드 순서 및 파일 존재 확인
`game/index.html`의 `<script src="...">` 태그 순서가 다음과 일치하는지 확인합니다:
1. `data/economy.js`
2. `data/staff.js`
3. `data/events.js`
4. `data/pitching.js`
5. `data/hardware.js`
6. `data/endings.js`
7. `js/core/sound.js`
8. `js/core/utils.js`
9. `js/core/state.js`
10. `js/systems/office.js`
11. `js/systems/hr.js`
12. `js/systems/events.js`
13. `js/systems/pitching.js`
14. `js/systems/hardware.js`
15. `js/systems/endings.js`
16. `js/ui/modals.js`
17. `js/ui/render.js`
18. `js/main.js`

## 2. 금지 문법 스캔
`file://` 더블클릭 실행을 깨뜨리는 `import `, `export `, `fetch(` 구문이 `game/` 폴더 내에 없는지 확인합니다.

## 3. 자동 시뮬레이션 검증
`node tests/sim_bot.js`를 실행하여 전 시스템 연동과 84개월 루프 완주를 확인합니다.
