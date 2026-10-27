---
name: balance-test
description: Run headless 84-month simulation bots and syntax checks on the GPU FOUNDER codebase to verify zero runtime errors, economy balance, and ending reachability.
---

# Balance & Smoke Test Skill (`balance-test`)

코드 변경이나 신규 시스템(인사, 이벤트, 피칭, 하드웨어, 엔딩) 통합 후 반드시 이 스킬의 절차에 따라 검증합니다.

## 1. 문법 검사 (Syntax Check)
모든 JS 파일에 문법 오류가 없는지 Node로 즉시 검사합니다:
```powershell
Get-ChildItem -Path game -Recurse -Filter *.js | ForEach-Object { node --check $_.FullName }
```

## 2. 헤드리스 84개월 시뮬레이션 봇 실행
`node tests/sim_bot.js`를 실행하여 다음 4가지 플레이어 페르소나가 84개월(7년) 동안 에러 없이 돌아가는지 확인합니다:
1. **Balanced Founder (정석 경영형)**: 당근 매입 → 예비창업패키지 → 지산 이전 → 직원 채용 → VC 투자 → 데이터센터 확장
2. **Crypto Maximalist (채굴 올인형)**: 채굴 80%+ 유지, 코인 홀딩 (H1 히든엔딩 및 코인 변동성 테스트)
3. **Reckless Borrower (영끌 대출형)**: 초기 풀대출 + 고비용 인력 무리 채용 (B1 파산 / B2 단전 배드엔딩 작동 여부 확인)
4. **Sinrim Legend (신림동 원룸 장인)**: 사무실 추가 없이 원룸 1곳에서만 튜닝/쿨링 극대화 (H2 히든엔딩 검증)

## 3. 합격 기준
* 런타임 예외(`ReferenceError`, `TypeError`, `NaN` 오염) **0건**
* `state.money`, `state.totalTflops`, `state.creditScore` 중 어느 하나도 `NaN`이나 `undefined`가 되지 않을 것
* 배드엔딩과 트루/히든/기간만료 엔딩 판정이 정상 작동할 것
