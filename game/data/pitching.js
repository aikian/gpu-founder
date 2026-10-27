/**
 * game/data/pitching.js
 * 정부지원사업(4종) · VC 투자 라운드(2종) 프로그램 세팅, 심사위원 4인 프로필, 압박 면접 질문 풀(10문항)
 * 기준 문서: docs/design/03_pitching_minigame.md, AGENTS.md, docs/CONVENTIONS.md
 */
window.GAME_DATA = window.GAME_DATA || {};

/**
 * 1. 심사위원 4인 데이터 (김 교수, 박 심사역, 이 사무관, 최 대표)
 */
window.GAME_DATA.pitchJudges = {
  kim: {
    id: 'kim',
    name: '김 교수',
    title: 'KAIST 전산학과 교수',
    avatar: '🎓',
    personality: '기술 덕후, 수식과 정량적 아키텍처 근거를 좋아함',
    scores: {
      tech: 20,
      bluff: -5,
      honest: 10
    },
    bluffDetectChance: 0.5,
    bluffDetectPenalty: -15,
    specialRuleDesc: '블러핑 간파 확률 50% (간파 시 해당 세션 -15점 추가 감점)'
  },
  park: {
    id: 'park',
    name: '박 심사역',
    title: 'VC 수석 심사역',
    avatar: '💼',
    personality: '시장성·숫자·TAM과 매출 지표를 중시함',
    scores: {
      tech: 10,
      bluff: 18,
      honest: 5
    },
    metricFailPenalty: -10,
    noVisionPenalty: -7,
    specialRuleDesc: '비즈니스 비전/스케일업 야성이 결여된 안이한 답변 시 사업성 감점(-7점), 지표 미달 시 압박'
  },
  lee: {
    id: 'lee',
    name: '이 사무관',
    title: '중기부 출신 사무관',
    avatar: '🏛️',
    personality: '규정·서식·예산집행 계획과 절차적 정당성을 중시함',
    scores: {
      tech: 8,
      bluff: -10,
      honest: 18
    },
    missingAdminPenalty: -20,
    govOnly: true,
    specialRuleDesc: '정부사업에서만 등장, 서식/행정 미비 상태로 허위 주장 시 즉시 -20점'
  },
  choi: {
    id: 'choi',
    name: '최 대표',
    title: '엑싯한 연쇄창업가',
    avatar: '🦈',
    personality: '창업자의 야성과 현장 엔지니어링 감각을 중시함',
    scores: {
      tech: 10,
      bluff: 12,
      honest: 15
    },
    vcOnly: true,
    specialRuleDesc: 'VC 피칭 전용 심사위원, "본인이 직접 코딩하세요?" 질문 선호'
  }
};

/**
 * 2. 피칭 프로그램 6종 (정부지원사업 4종 + VC 라운드 2종)
 */
const pitchProgramsList = [
  // Government Grants (type: 'grant')
  {
    id: 'yechangpae',
    name: '예비창업패키지',
    type: 'grant',
    org: '창업진흥원 (중소벤처기업부)',
    requireExpr: '!state.flags.bizRegistered',
    requireDesc: '사업자 미등록 (예비창업자 신분)',
    questionCount: 3,
    passScore: 72,
    baseAmount: 50000000,
    reward: 50000000,
    equityDilution: 0,
    judges: ['kim', 'park', 'lee'],
    cooldownMonths: 3,
    desc: '사업자등록 전 예비창업자에게 최대 5,000만 원 바우처 지원. 합격 시 법인 설립(사업자 등록) 자동 완료!'
  },
  {
    id: 'chocangpae',
    name: '초기창업패키지',
    type: 'grant',
    org: '창업진흥원 (중소벤처기업부)',
    requireExpr: 'state.month <= 36 && totalGpuCount >= 5',
    requireDesc: '업력 3년(36개월) 이하 & 보유 GPU 5대 이상',
    questionCount: 5,
    passScore: 70,
    baseAmount: 100000000,
    reward: 100000000,
    equityDilution: 0,
    judges: ['kim', 'park', 'lee'],
    cooldownMonths: 4,
    desc: '창업 3년 이내 초기 AI 인프라 기업의 시제품 제작 및 서버 증설 비용 1억 원 무상 지원.'
  },
  {
    id: 'aivoucher',
    name: 'AI 바우처 공급기업',
    type: 'grant',
    org: 'NIPA (정보통신산업진흥원)',
    requireExpr: 'state.totalTflops >= 200',
    requireDesc: '총 가동 연산력 200 TFLOPS 이상',
    questionCount: 5,
    passScore: 70,
    baseAmount: 180000000,
    reward: 180000000,
    equityDilution: 0,
    judges: ['kim', 'lee', 'park'],
    cooldownMonths: 4,
    desc: '수요기업에 GPU 클라우드 인프라를 공급하고 정부 바우처 정산금 1.8억 원을 수령합니다.'
  },
  {
    id: 'tips',
    name: 'TIPS R&D',
    type: 'grant',
    org: '중소벤처기업부 · 민간운영사',
    requireExpr: "state.vcState && state.vcState.seed_round === 'approved'",
    requireDesc: 'Seed 라운드 VC 투자 유치 완료',
    questionCount: 5,
    passScore: 78,
    baseAmount: 500000000,
    reward: 500000000,
    equityDilution: 0,
    judges: ['kim', 'park', 'lee'],
    cooldownMonths: 6,
    desc: '민간 VC(Seed) 추천을 거친 딥테크 스타트업에 R&D 출연금 5억 원을 매칭 지원합니다.'
  },

  // VC Rounds (type: 'vc')
  {
    id: 'seed_round',
    name: 'Seed 라운드',
    type: 'vc',
    org: '초기 딥테크 액셀러레이터 & VC',
    requireExpr: 'state.totalTflops >= 80',
    requireDesc: '총 가동 연산력 80 TFLOPS 이상',
    questionCount: 5,
    passScore: 72,
    baseAmount: 300000000,
    reward: 300000000,
    equityDilution: 12,
    dilution: 12,
    judges: ['kim', 'park', 'choi'],
    cooldownMonths: 3,
    desc: '지분 12%를 발행하여 3억 원 규모의 시드 자금을 유치합니다. (TIPS 지원 자격 해금)'
  },
  {
    id: 'series_a',
    name: 'Series A 라운드',
    type: 'vc',
    org: '대형 벤처캐피탈 컨소시엄',
    requireExpr: 'state.totalTflops >= 600 && state.monthlyProfit > 0',
    requireDesc: '총 연산력 600 TFLOPS 이상 & 월 순이익 흑자',
    questionCount: 5,
    passScore: 80,
    baseAmount: 2500000000,
    reward: 2500000000,
    equityDilution: 18,
    dilution: 18,
    judges: ['kim', 'park', 'choi'],
    cooldownMonths: 4,
    desc: '지분 18%를 희석하여 25억 원의 대규모 기관 자금을 조달, 데이터센터급 인프라로 도약합니다.'
  }
];

// 배열 순회(forEach/find/filter)와 ID 키 접근(pitchPrograms.yechangpae) 모두 호환되도록 등록
pitchProgramsList.forEach(prog => {
  Object.defineProperty(pitchProgramsList, prog.id, {
    value: prog,
    enumerable: false,
    writable: false,
    configurable: true
  });
});

window.GAME_DATA.pitchPrograms = pitchProgramsList;

/**
 * 3. 압박 면접 질문 풀 10문항 (docs/design/03_pitching_minigame.md Section 3)
 */
window.GAME_DATA.pitchQuestions = [
  {
    id: 1,
    judgeId: 'kim',
    question: '"그냥 AWS 쓰면 되지, 왜 자체 GPU를 사요?"',
    metricCheck: 'totalGpuCount >= 10',
    metricLabel: '보유 GPU 10대 이상',
    answers: {
      tech: {
        text: '"시간당 단가 비교 시 18개월 이후 TCO가 62% 저렴합니다"'
      },
      bluff: {
        text: '"AWS는 곧 망합니다. 저희가 한국의 AWS가 될 겁니다"',
        isIllegal: false
      },
      honest: {
        text: '"솔직히 초기엔 비슷하지만 장기적으로 유리하다고 봅니다"'
      }
    }
  },
  {
    id: 2,
    judgeId: 'park',
    question: '"월 매출 얼마예요? 리텐션은?"',
    metricCheck: 'state.monthlyProfit > 0',
    metricLabel: '월 순이익 흑자 (monthlyProfit > 0)',
    answers: {
      tech: {
        text: '"MRR 1,200만, 3개월 리텐션 68%입니다"'
      },
      bluff: {
        text: '"다음 달 MRR 1억 찍을 예정입니다"',
        isIllegal: false
      },
      honest: {
        text: '"아직 미미하지만 성장률은 월 30%입니다"'
      }
    }
  },
  {
    id: 3,
    judgeId: 'lee',
    question: '"사업비 중 인건비 비중이 왜 이렇게 높죠?"',
    metricCheck: 'state.flags.hasAdminStaff',
    metricLabel: '행정/재무 총무(GA) 직원 보유',
    answers: {
      tech: {
        text: '"AI 엔지니어 확보가 핵심 경쟁력이라…"'
      },
      bluff: {
        text: '"인건비는 사실 장비비로 쓸 겁니다"',
        isIllegal: true
      },
      honest: {
        text: '"규정 확인하여 비율 조정하겠습니다"'
      }
    }
  },
  {
    id: 4,
    judgeId: 'kim',
    question: '"발열 문제는 어떻게 해결하나요?"',
    metricCheck: 'hasUpgradedCooling',
    metricLabel: '냉각 업그레이드 (T2 이상 또는 상위 사업장)',
    answers: {
      tech: {
        text: '"PUE 1.3 목표, 수랭 전환 계획 있습니다"'
      },
      bluff: {
        text: '"자체 특허 냉각 기술이 있습니다"',
        isIllegal: false
      },
      honest: {
        text: '"현재 에어컨으로 버티고 있습니다…"'
      }
    }
  },
  {
    id: 5,
    judgeId: 'park',
    question: '"엔비디아가 직접 클라우드 하면 어떡해요?"',
    metricCheck: 'state.saasUsers >= 500 || state.totalTflops >= 150',
    metricLabel: '고객사/구독자 확보 (SaaS 500명+ 또는 150TF+)',
    answers: {
      tech: {
        text: '"한국어 엔지니어링 지원·규제 대응은 로컬 강자가 유리"'
      },
      bluff: {
        text: '"엔비디아와 MOU 협의 중입니다"',
        isIllegal: false
      },
      honest: {
        text: '"그게 가장 큰 리스크라 생각합니다"'
      }
    }
  },
  {
    id: 6,
    judgeId: 'lee',
    question: '"과거 정부과제 수행 이력과 결과는?"',
    metricCheck: 'state.flags.hasGrant',
    metricLabel: '정부과제 수행 이력 보유',
    answers: {
      tech: {
        text: '"AI 바우처 성공 판정, 결과보고서 첨부"'
      },
      bluff: {
        text: '"모두 \'우수\' 판정받았습니다"',
        isIllegal: false
      },
      honest: {
        text: '"이번이 첫 과제입니다"'
      }
    }
  },
  {
    id: 7,
    judgeId: 'kim',
    question: '"GPU 가동률(utilization)은 얼마나 되나요?"',
    metricCheck: 'totalAllocPct >= 80',
    metricLabel: '워크로드 배분율 합계 80% 이상',
    answers: {
      tech: {
        text: '"슬라이더 배분 기준 평균 87%"'
      },
      bluff: {
        text: '"항상 100%입니다"',
        isIllegal: false
      },
      honest: {
        text: '"유휴 시간이 꽤 있어서 개선 중입니다"'
      }
    }
  },
  {
    id: 8,
    judgeId: 'park',
    question: '"Exit 전략은요?"',
    metricCheck: 'state.totalTflops >= 1000',
    metricLabel: '연산력 1,000 TFLOPS 이상',
    answers: {
      tech: {
        text: '"3년 내 코스닥 기술특례 상장 목표"'
      },
      bluff: {
        text: '"이미 대기업 3곳에서 인수 제안 받았습니다"',
        isIllegal: false
      },
      honest: {
        text: '"아직 구체적으로 생각 안 해봤습니다"'
      }
    }
  },
  {
    id: 9,
    judgeId: 'lee',
    question: '"최저가 비교견적 3곳 받으셨나요?"',
    metricCheck: 'state.flags.hasAdminStaff',
    metricLabel: '행정/재무 총무(GA) 직원 보유',
    answers: {
      tech: {
        text: '"용산 총판 2곳 + 해외 1곳 견적 첨부"'
      },
      bluff: {
        text: '"네 물론이죠"',
        isIllegal: false
      },
      honest: {
        text: '"2곳만 받았는데 추가하겠습니다"'
      }
    }
  },
  {
    id: 10,
    judgeId: 'common',
    question: '"대표님은 왜 이 사업을 해야 하나요? (본인이 직접 코딩·랙 구성도 하시나요?)"',
    metricCheck: 'state.month >= 6 || totalGpuCount >= 5',
    metricLabel: '대표 경력 (창업 6개월+ 또는 GPU 5대+ 직접 운영)',
    answers: {
      tech: {
        text: '"인프라 엔지니어 8년 경력, 직접 랙 300대 운영"'
      },
      bluff: {
        text: '"제가 아니면 한국 AI는 끝납니다"',
        isIllegal: false
      },
      honest: {
        text: '"GPU를 너무 좋아해서요"'
      }
    }
  }
];
