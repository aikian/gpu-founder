/**
 * game/data/staff.js
 * 인사 · 채용 · 스톡옵션 · 번아웃 시스템 정적 기획 데이터
 * (01_hr_hiring_burnout.md 기준)
 */

window.GAME_DATA = window.GAME_DATA || {};

window.GAME_DATA.jobs = [
  {
    id: 'devops',
    name: '인프라/DevOps 엔지니어',
    icon: '🖥️',
    salary: 5500000,
    desc: '서버 장애 복구시간 -50%, 전체 TFLOPS 가동률 +10%',
    riskDesc: '새벽 장애콜로 burnout 2배 누적',
    effects: {
      uptime: 0.10,
      recoveryTime: -0.50
    },
    burnoutRate: 2.0,
    poachRisk: 0.4,
    govSubsidy: 0
  },
  {
    id: 'ai_research',
    name: 'AI 리서처 (석·박사)',
    icon: '🧠',
    salary: 8000000,
    desc: '자체 SaaS 수익 +25%, R&D 연구 속도 +40%',
    riskDesc: '판교/빅테크 이직 제안 확률 최고',
    effects: {
      saasIncome: 0.25,
      researchSpeed: 0.40
    },
    burnoutRate: 1.2,
    poachRisk: 0.8,
    govSubsidy: 0
  },
  {
    id: 'backend',
    name: '백엔드 개발자',
    icon: '⚙️',
    salary: 5000000,
    desc: '클라우드 렌탈 플랫폼 수익 +15%, 버그 발생 -30%',
    riskDesc: '기술부채 이벤트 발생원',
    effects: {
      cloudIncome: 0.15,
      bugRate: -0.30
    },
    burnoutRate: 1.3,
    poachRisk: 0.6,
    govSubsidy: 0
  },
  {
    id: 'admin_gov',
    name: '정부과제 행정 전담',
    icon: '📑',
    salary: 3200000,
    desc: 'e나라도움 불인정 확률 -70%, 지원사업 합격률 +15%p',
    riskDesc: '없으면 정산 이벤트 리스크 3배',
    effects: {
      grantAuditRisk: -0.70,
      grantPassRate: 0.15
    },
    burnoutRate: 1.5,
    poachRisk: 0.1,
    govSubsidy: 0
  },
  {
    id: 'marketer',
    name: '그로스 마케터',
    icon: '📢',
    salary: 4200000,
    desc: 'SaaS 마케팅 효율 +50%, 구독자 이탈 -20%',
    riskDesc: '광고비 과집행 성향',
    effects: {
      marketingEff: 0.50,
      churn: -0.20
    },
    burnoutRate: 1.0,
    poachRisk: 0.3,
    govSubsidy: 0
  },
  {
    id: 'sales',
    name: 'B2B 영업',
    icon: '🤝',
    salary: 3800000,
    desc: '엔터프라이즈 계약 단가 +20%, 바우처 수요기업 매칭',
    riskDesc: '인센티브 미지급 시 morale 급락',
    effects: {
      corpIncome: 0.20
    },
    burnoutRate: 1.1,
    poachRisk: 0.3,
    govSubsidy: 0
  },
  {
    id: 'technician',
    name: '하드웨어 테크니션',
    icon: '🔧',
    salary: 3500000,
    desc: 'GPU 고장률 -50%, 개조 성공률 +15%p',
    riskDesc: '감전/화상 사고 이벤트',
    effects: {
      gpuFailRate: -0.50,
      modSuccess: 0.15
    },
    burnoutRate: 1.0,
    poachRisk: 0.2,
    govSubsidy: 0
  },
  {
    id: 'intern',
    name: '잡부 인턴 (청년내일채움)',
    icon: '🧹',
    salary: 2100000,
    desc: '모든 직군 업무 10% 보조, 정부 인건비 지원 50%',
    riskDesc: '3개월 후 정규직 전환 요구',
    effects: {
      allAssist: 0.10
    },
    burnoutRate: 0.8,
    poachRisk: 0.05,
    govSubsidy: 0.50
  },
  {
    id: 'cfo',
    name: 'CFO / 재무이사',
    icon: '👔',
    salary: 9000000,
    desc: '대출 금리 -1%p, VC 밸류에이션 +15%',
    riskDesc: '고액 연봉, 스톡옵션 요구 2%',
    effects: {
      loanRate: -0.01,
      valuation: 0.15
    },
    burnoutRate: 0.7,
    poachRisk: 0.3,
    govSubsidy: 0
  }
];

window.GAME_DATA.channels = [
  {
    id: 'wanted',
    name: '원티드/잡코리아 공고',
    cost: 500000,
    desc: '기본 채용 공고. 숙련도 30~70 인재 영입',
    skillRange: [30, 70],
    loyaltyBonus: 0,
    salaryMul: 1.0,
    growthMul: 1.0,
    costSalaryRatio: 0,
    fakeRisk: 0,
    jobs: null,
    months: null,
    lawsuitRisk: 0
  },
  {
    id: 'referral',
    name: '지인 추천 (리퍼럴)',
    cost: 2000000,
    desc: '추천비 200만 원. 충성도 +20 시작, 퇴사 시 추천인 사기 -15',
    skillRange: [50, 85],
    loyaltyBonus: 20,
    salaryMul: 1.0,
    growthMul: 1.0,
    costSalaryRatio: 0,
    fakeRisk: 0,
    jobs: null,
    months: null,
    lawsuitRisk: 0
  },
  {
    id: 'bootcamp',
    name: '국비 부트캠프 수료생',
    cost: 0,
    desc: '채용비 무료. 월급 시장가 70%, 성장속도 2배',
    skillRange: [15, 45],
    loyaltyBonus: 5,
    salaryMul: 0.7,
    growthMul: 2.0,
    costSalaryRatio: 0,
    fakeRisk: 0,
    jobs: null,
    months: null,
    lawsuitRisk: 0
  },
  {
    id: 'headhunter',
    name: '헤드헌터 (서치펌)',
    cost: 0,
    desc: '연봉의 20% 수수료. 고급 인력(70~95), 대기업 출신 물경력 확률 15%',
    skillRange: [70, 95],
    loyaltyBonus: 0,
    salaryMul: 1.1,
    growthMul: 1.0,
    costSalaryRatio: 0.20,
    fakeRisk: 0.15,
    jobs: null,
    months: null,
    lawsuitRisk: 0
  },
  {
    id: 'lab',
    name: '대학원 연구실 산학협력',
    cost: 10000000,
    desc: '연구비 1,000만 원. AI 리서처 전용(60~90), 졸업 시즌(2월/8월)만 가능',
    skillRange: [60, 90],
    loyaltyBonus: 15,
    salaryMul: 0.95,
    growthMul: 1.3,
    costSalaryRatio: 0,
    fakeRisk: 0,
    jobs: ['ai_research'],
    months: [2, 8],
    lawsuitRisk: 0
  },
  {
    id: 'poach',
    name: '경쟁사 인력 빼오기',
    cost: 3000000,
    desc: '연봉 1.5배 제시, 즉시 에이스(75~98) 영입. 경쟁사 내용증명 리스크 20%',
    skillRange: [75, 98],
    loyaltyBonus: -10,
    salaryMul: 1.5,
    growthMul: 1.0,
    costSalaryRatio: 0,
    fakeRisk: 0,
    jobs: null,
    months: null,
    lawsuitRisk: 0.20
  }
];

window.GAME_DATA.welfarePolicies = [
  {
    id: 'lunch',
    name: '법인카드 점심 지원',
    costPerEmpMonthly: 200000,
    oneTimeCostPerEmp: 0,
    flatCost: 0,
    equityCost: 0,
    isToggle: true,
    desc: '인당 월 20만 원 식대 지원 (사기 +5/월)',
    effects: {
      monthlyMorale: 5
    }
  },
  {
    id: 'remote',
    name: '재택/하이브리드 근무',
    costPerEmpMonthly: 0,
    oneTimeCostPerEmp: 0,
    flatCost: 0,
    equityCost: 0,
    isToggle: true,
    desc: '비용 무료. 사기 +8/월, 서버 장애 대응속도 -20%',
    effects: {
      monthlyMorale: 8,
      recoveryPenalty: 0.20
    }
  },
  {
    id: 'macbook',
    name: '맥북/듀얼모니터 장비 지원',
    costPerEmpMonthly: 0,
    oneTimeCostPerEmp: 3000000,
    flatCost: 0,
    equityCost: 0,
    isToggle: false,
    desc: '인당 300만 원 1회 지급. 전 직원 직무 숙련도 성장률 +10% 영구 적용',
    effects: {
      skillGrowthMul: 1.10,
      instantMorale: 6
    }
  },
  {
    id: 'work45',
    name: '주 4.5일제 도입',
    costPerEmpMonthly: 0,
    oneTimeCostPerEmp: 0,
    flatCost: 0,
    equityCost: 0,
    isToggle: true,
    desc: '전체 업무 생산성 -10%, 사기 +12/월, 신규 채용 품질(skill) +10',
    effects: {
      monthlyMorale: 12,
      productivityMul: 0.90,
      hireSkillBonus: 10
    }
  },
  {
    id: 'dinner_forced',
    name: '회식 강제 (꼰대 문화)',
    costPerEmpMonthly: 0,
    oneTimeCostPerEmp: 0,
    flatCost: 500000,
    equityCost: 0,
    isToggle: false,
    desc: '1회 50만 원. MZ 직원은 사기 -3, 시니어/임원은 +2 (전체 평균 사기 소폭 하락)',
    effects: {
      mzMorale: -3,
      seniorMorale: 2
    }
  },
  {
    id: 'stockPool',
    name: '스톡옵션 풀 10% 설정',
    costPerEmpMonthly: 0,
    oneTimeCostPerEmp: 0,
    flatCost: 0,
    equityCost: 10,
    isToggle: false,
    desc: '대표 지분 10% 출연. 전 직원 충성도(loyalty) +25, 이직 방어력 대폭 상승',
    effects: {
      allLoyaltyBonus: 25,
      instantMorale: 10
    }
  },
  {
    id: 'family_slogan',
    name: '"우리는 가족 같은 회사" 선언',
    costPerEmpMonthly: 0,
    oneTimeCostPerEmp: 0,
    flatCost: 0,
    equityCost: 0,
    isToggle: false,
    desc: '비용 0원. 대표의 훈화 말씀으로 전 직원 사기 -10 😇',
    effects: {
      instantMorale: -10
    }
  }
];

window.GAME_DATA.koreanNames = [
  '김민준', '이서연', '박도현', '정하윤', '최지훈',
  '강서윤', '조현우', '윤지민', '장우진', '임수빈',
  '한지호', '오유진', '서동현', '신예은', '권태윤',
  '황다은', '안시우', '송채원', '류건우', '전소율',
  '홍승현', '고은서', '문준혁', '양지아', '손민재',
  '배주원', '백나윤', '허성민', '유하은', '남기훈'
];
