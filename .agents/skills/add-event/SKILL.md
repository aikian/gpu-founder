---
name: add-event
description: Standard procedure for adding or modifying random dilemma events in game/data/events.js while strictly adhering to CONVENTIONS.md state variable names and trigger schema.
---

# Add Random Event Skill (`add-event`)

새로운 랜덤 이벤트나 딜레마를 `game/data/events.js`에 추가할 때 반드시 아래 절차를 따릅니다.

## 1. 스키마 준수 (`window.GAME_DATA.events`)
모든 이벤트 객체는 다음 필드를 포함해야 합니다:
```js
{
  id: 'unique_snake_case_id',
  title: '이벤트 제목',
  category: 'gov' | 'infra' | 'hr' | 'market' | 'vc',
  text: '상황 설명 및 대사',
  trigger: {
    minMonth: 3,
    chancePerMonth: 0.12,
    cooldownMonths: 12,
    require: "state.totalTflops >= 10" // 안전한 조건식 또는 체크 함수
  },
  choices: [
    {
      label: '[A] 선택지 텍스트',
      desc: '예상 결과 요약 표기',
      cost: 0,
      effects: { money: -5000000, creditScore: 10 },
      result: '선택 후 토스트/결과 모달 텍스트'
    }
  ]
}
```

## 2. 허용된 상태 변수 키 (`effects`)
`money`, `creditScore`, `reputation`, `ceoStress`, `ceoHealth`, `ceoEquity`, `lieMeter`, `morale`, `burnout`, `flags.<flagName>`, `modifier: { id, name, stat, mul, add, months }` 외의 임의 변수명을 생성하지 마십시오.

## 3. 사후 검증
추가 후 반드시 `balance-test` 스킬(`node tests/sim_bot.js`)을 실행해 조건식 평가 중 에러가 발생하지 않는지 확인합니다.
