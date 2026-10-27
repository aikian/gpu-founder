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

/**
 * 사내 익명 블라인드 & 슬랙 리얼리즘 피드 대사 풀 (STAFF_MURMURS)
 * 직군별/상황별(고번아웃, 고사기, 저현금, 일상) 20+가지 이상의 리얼 스타트업 대사 풀
 */
window.GAME_DATA.STAFF_MURMURS = {
  // 인프라 / DevOps 엔지니어
  devops: {
    highBurnout: [
      '아 오늘 서버실 찜질방 실화냐… 맥주 땡긴다',
      '새벽 3시에 PagerDuty 알람 울려서 심장 떨어지는 줄... 차라리 쿠버네티스가 날 죽여라',
      '링크드인 알림 켜둠… 판교 이직 준비 중',
      'IDC 센터 바닥에서 침낭 펴고 자는 삶, 이게 21세기 테크 스타트업인가',
      'GPU 발열 때문에 라면 물 끓여도 되겠음... 내 뇌세포도 같이 스로틀링 걸린다',
      '로그 100만 줄 보다가 동공 풀림... 나 지금 깨어있는 건가'
    ],
    highMorale: [
      '오늘 밤샘 작업 끝나고 대표님이 쏜 치킨과 맥주는 진짜 야근 인정이다',
      '클러스터 가동률 99.98% 달성! 우리 인프라 세팅 판교 어디 내놔도 안 꿀린다',
      '스톡옵션 풀 열렸다길래 바로 서명함. 우리 회사 상장하면 테슬라 모델 Y 뽑는다',
      '자동 복구 쉘 스크립트 완벽 가동 중. 서버 뻗어도 3초 컷 복구 뿌듯하네',
      '대표님이 100Gbps 인피니밴드 스위치 결재해 주심! 인프라 덕질의 극치다'
    ],
    lowCash: [
      'IDC 회선 비용 청구서 왔는데 경리팀 분위기 싸늘함... 통장 괜찮은 거 맞죠?',
      'GPU 서버 전기세 고지서 보고 심장 멎는 줄... 전력 피크 할증 어쩌냐',
      '비품실 케이블 타이 하나도 결재 맡고 쓰는 중... 회사 유동성 비상인가',
      '서버실 에어컨 온도 1도 올리라는 공지 내려옴... GPU 타죽으면 누가 책임짐?'
    ],
    normal: [
      'RTX 4090 라이저 카드 접촉 불량 잡느라 반나절 다 갔다... 손가락에 구리스 묻음',
      '외기 냉방 효율 돌리려면 비 좀 그만 왔으면 좋겠다',
      '서버 랙 뒤편 배선 정리 완벽하게 각 잡았을 때의 카타르시스는 엔지니어만 안다',
      '오늘도 무중단 배포 성공. 커피 한 잔 마시며 그라파나 대시보드 멍때리는 중',
      '도커 이미지 경량화 성공해서 빌드 시간 5분 단축함!'
    ]
  },

  // AI 리서처 (석·박사)
  ai_research: {
    highBurnout: [
      'Loss 값이 84번째 에포크에서 발산(NaN)했다... 내 멘탈도 같이 NaN 뜸',
      '판교 모 대기업에서 이직 오퍼 왔는데 흔들린다... 연봉 앞자리가 다른데',
      '논문 마감 3일 남았는데 GPU 노드 선점 실패해서 대기열 5시간째 기다림...',
      '데이터 전처리 노가다만 3주째... 내가 석박사를 왜 했는지 자괴감 든다',
      '하이퍼파라미터 튜닝만 100번째 시도 중... 인공지능이 아니라 인공지능 노예가 된 기분'
    ],
    highMorale: [
      '우리 파운데이션 모델 벤치마크 점수 오픈AI 직전 모델 턱밑까지 따라잡음! 대박!',
      '대표님이 연구실에 최신 GPU 더 넣어준다고 약속하심! 가슴이 웅장해진다',
      '이번 논문 NeurIPS 워크숍 채택 각이다. 우리 연구팀 진짜 미쳤음',
      '스톡옵션 대박 나면 연구실 후배들 밥부터 거하게 사줘야지',
      '오늘 파인튜닝 수렴 곡선 너무 아름다워서 바탕화면으로 지정함'
    ],
    lowCash: [
      'API 크레딧 충전 요청했는데 CFO님이 반려하셨다... 무료 오픈소스 모델 써야 하나',
      '학습 한 번 돌릴 때마다 돈 나가는 소리가 들려서 배치 사이즈 눈물겹게 줄이는 중...',
      '이번 달 급여는 제때 들어오겠지? (e나라도움 연구비 잔고 계속 조회 중)',
      '클라우드 인스턴스 시간당 단가 계산하면서 연구하려니 머리가 쪼개진다'
    ],
    normal: [
      'Attention is All You Need 다시 정독 중. 기본이 제일 중요함',
      'LoRA 가중치 파인튜닝 수렴 속도 왜 이리 빠르지? 기분 째지네',
      '오늘 점심은 뭐 먹지... 뇌가 당분을 간절히 원하고 있다',
      'Hugging Face 실시간 트렌드 1위에 우리 모델 올라가는 상상함',
      '아카이브(arXiv) 신규 논문 훑어보다가 번뜩이는 아이디어 떠오름'
    ]
  },

  // 백엔드 개발자
  backend: {
    highBurnout: [
      '기획서가 오늘만 4번 바뀜... 애자일이 아니라 그냥 의식의 흐름이잖아요',
      '레거시 스파게티 코드 보다가 안구 건조증 도짐... 판교 이력서 열람 풀었다',
      '버그 하나 잡았더니 연쇄 버그 3개 튀어나옴. 히드라인가',
      '주말에도 슬랙 알림 울릴까 봐 폰 무음 모드 해두고 불안해하는 중',
      '커밋 메시지 "fix: 진짜최종수정제발" 남발하는 내 모습이 처량하다'
    ],
    highMorale: [
      '오늘 결제 모듈 리팩토링으로 API 레이턴시 70% 줄임! 내가 봐도 천재다',
      '우리 렌탈 서비스 동접자 급증! 서버 증설 요청 승인 시원하게 났다',
      '스톡옵션 행사할 날만 기다린다. 초기 멤버로 고생한 보람이 있네',
      '대표님이 고생했다고 맥북 프로 풀스펙으로 바꿔주심! 충성 충성',
      '테스트 코드 커버리지 95% 달성! 오늘 밤은 두 다리 뻗고 잔다'
    ],
    lowCash: [
      'AWS 프리티어 만료되고 비용 절감하라고 난리남... 온프레미스로 다 옮겨야 하나',
      '탕비실 믹스커피가 맥심 노란색에서 저가 PB 브랜드로 바뀌었다... 위기 신호다',
      '다음 달 월급 밀리면 어쩌지? 잡플래닛 리뷰 슬쩍 찾아보는 중',
      '유료 IDE 라이선스 갱신 품의 올렸는데 보류됨... VS Code 무료 플러그인 깔러 간다'
    ],
    normal: [
      'git push --force 날리고 식은땀 흘렸는데 백업 브랜치 있어서 살았다 휴',
      '도커 컨테이너 빌드되는 동안 스트레칭 좀 해야지',
      '탭이냐 스페이스냐... 백엔드 회의 1시간째 격론 중',
      '클라우드 렌탈 플랫폼 결제 주기 자동화 완료. 퇴근각 잡는다',
      'Redis 캐시 레이어 하나 얹었을 뿐인데 응답속도 날아다님'
    ]
  },

  // 하드웨어 테크니션
  technician: {
    highBurnout: [
      '용산 전자상가 중고 GPU 30장 까서 써멀 재도포하는데 허리 끊어질 듯...',
      '쇼트 나서 퍽 소리 날 때마다 심장도 덜컥 내려앉음... 안전제일',
      '납땜 연기 너무 마셔서 코가 매캐하다. 방독마스크 사달라고 슬랙 올림',
      '쿨러 팬 날개에 손가락 베임... 파상풍 주사 맞으러 가야 하나',
      '중고 채굴 에디션 기판에서 녹물 나오는 거 실화냐... 이걸 살려내라니'
    ],
    highMorale: [
      '냉납 현상 났던 RTX 3080 히팅건으로 리볼링 살려냈다! 심폐소생술 장인 등극!',
      '테크니션 장비 지원으로 플루크 고급 테스터기 들어왔음! 작업 속도 2배!',
      '대표님이 나보고 "우리 회사의 심장"이래... 솔직히 좀 감동 먹음',
      'GPU 개조 커스텀 수랭 블록 수로 완벽 밀폐! 누수 테스트 전량 통과!',
      '용산 도매상 사장님이 우리 회사에만 A급 매물 우선 배정해 준다고 함'
    ],
    lowCash: [
      '써멀구리스도 싼 거 쓰라는데... 칩셋 온도 잡히겠냐고요',
      '교체용 팬 스페어 재고가 0개임. 망가지면 진짜 손으로 입김 불어 돌려야 할 판',
      '공구함 드라이버 세트도 다 닳았는데 품의서 결재가 안 난다',
      '테스터기 배터리 살 돈도 아끼라는 건 너무한 거 아닙니까'
    ],
    normal: [
      'PCIe 라이저 케이블은 역시 직결해야 속이 편함',
      '중고 GPU 채굴 냄새 빼느라 세척실에서 하루 종일 환기 돌림',
      '온도 65도 이하로 얌전하게 돌아갈 때 제일 예쁨',
      '납땜 인두기 예열 완료. 오늘은 GPU 바이오스 롬플래시 작업이다',
      '서멀 패드 두께 0.5mm 차이로 코어 온도 5도 잡았다! 예술의 경지'
    ]
  },

  // 정부과제 행정 전담
  admin_gov: {
    highBurnout: [
      'e나라도움 액티브X 오류 12번째... 담당 공무원 통화 중... 모니터 부술 뻔',
      '정부지원사업 정산 증빙 영수증 400장 풀칠하다가 지문 없어질 지경',
      '점심 식대 100원 불인정됐다고 소명서 쓰라는 게 말이 되냐',
      '과제 회계감사 시즌마다 수명이 1년씩 줄어드는 기분',
      '사업비 통장 잔액 10원 안 맞는다고 지급 승인 반려당함... 악몽이다'
    ],
    highMorale: [
      'TIPS R&D 과제 서면 평가 통과! 발표 평가 준비 바로 들어갑니다!',
      '청년내일채움공제 지원금 전액 정상 입금 확인! 행정의 승리다',
      '주관기관 전담 매니저가 우리 정산 서류 완벽하다고 칭찬함!',
      '이번 정부 AI 바우처 공급기업 최종 선정! 매출 터진다!',
      '사업비 불인정 0건으로 정산 검수 최종 승인 완료! 만세!'
    ],
    lowCash: [
      '정부 지원금 2차 분할금 지급이 지연되고 있다... 통장 잔고 0원 직전',
      '과제비 통장에서 일반 경비 쓰면 횡령으로 잡혀가요 대표님! 절대 안 됩니다',
      '세무서에서 4대보험 체납 고지서 날아왔는데 손이 덜덜 떨린다',
      '비품 구매 영수증 처리도 자금 부족으로 다음 달로 이월하라는 지시 내려옴'
    ],
    normal: [
      '나라장터 입찰 공고 업데이트 확인 중',
      '법인인감증명서 떼러 주민센터 다녀옵니다',
      '연구노트 날짜랑 서명 누락된 분들 당장 행정팀으로 오세요',
      '엑셀 시트 VLOOKUP 함수 걸어두니 세상 편하네',
      '과제 참여 연구원 인건비 지급 품의 작성 완료'
    ]
  },

  // 그로스 마케터
  marketer: {
    highBurnout: [
      'ROAS(광고수익률) 곤두박질치는데 예산은 쥐꼬리... 기적이 일어나길 비는 중',
      'SNS 카드뉴스 20장 만들었는데 대표님이 "뭔가 느낌이 안 사는데" 한마디로 반려',
      '야간에도 페이스북 광고 성과 모니터링하느라 불면증 걸림',
      '클라우드 렌탈 키워드 CPC(클릭단가)가 주식마냥 폭등하고 있다...'
    ],
    highMorale: [
      '링크드인 바이럴 터져서 B2B 문의 리드 100건 들어옴! 이게 마케팅이지!',
      'AI 콘퍼런스 부스에 사람들 줄 서서 명함 주고 감! 우리 회사 인지도 떡상!',
      'SaaS 구독 전환율 15% 돌파! 인센티브 기대해도 되나요 대표님?',
      '테크 뉴스레터 1면에 우리 GPU 클러스터 혁신 사례 단독 보도됨!'
    ],
    lowCash: [
      '마케팅 예산 전액 동결... 오가닉 바이럴만으로 고객 데려오라는 건 마법사 구하는 거 아님?',
      '검색 광고 키워드 단가 비싸서 다 껐음... 유입 줄어드는 거 실시간으로 보임',
      '무료 툴로 마케팅 자동화 파이프라인 짜느라 노가다 중...'
    ],
    normal: [
      '블로그 테크 아티클 초안 작성 완료. 개발팀 기술 감수 부탁드립니다',
      '경쟁사 홈페이지 디자인 바뀐 거 벤치마킹 분석 중',
      '부스 기념품으로 GPU 모양 스티커 발주 넣음. 귀엽다',
      '이번 주 랜딩 페이지 A/B 테스트 지표 결과 취합 완료'
    ]
  },

  // B2B 영업
  sales: {
    highBurnout: [
      '을(乙)의 설움... 대기업 구매팀 미팅 갔다가 1시간 대기하고 5분 면담함',
      '술 접대 연달아 뛰었더니 간이 썩어가는 기분... 실적 압박 미치겠다',
      '계약 직전에 고객사 대표가 단가 30% 후려치기 들어옴... 피가 거꾸로 솟는다',
      '주말에도 고객사 CTO 전화 받고 장애 사과 브리핑함... 워라밸 실종'
    ],
    highMorale: [
      '국내 대형 AI 유니콘과 1년 GPU 독점 렌탈 계약 체결 완료! 계약금 꽂힌다!',
      '영업 인센티브 들어오면 부모님 용돈부터 두둑하게 챙겨드려야지',
      '대표님이 영업팀 활약 덕분에 회사 살았다고 어깨 토닥여주심!',
      '고객사에서 우리 GPU 클러스터 가성비 최고라고 입소문 내주는 중!'
    ],
    lowCash: [
      '고객사 외상 대금 미수금 언제 입금되냐고 매일 독촉 전화 돌리는 중...',
      '법인카드 한도 초과로 고객사 커피값 내 사비로 긁음... 실화냐',
      '선입금 안 해주면 서버 공급 못 한다고 말할 때마다 식은땀 줄줄'
    ],
    normal: [
      '다음 주 판교 테크밸리 고객사 미팅 일정 조율 완료',
      'B2B 제안서 덱 템플릿 최신 TFLOPS 스펙으로 업데이트함',
      '영업은 결국 진정성과 네트워크다',
      '전시회에서 받아온 명함 100장 CRM 시스템에 등록 완료'
    ]
  },

  // 잡부 인턴 (청년내일채움)
  intern: {
    highBurnout: [
      '인턴이라 쓰고 잡부라 읽는다... 오늘은 서버실 먼지 청소 3시간',
      '선배님들 다 바빠서 사수도 없고 혼자 스택오버플로우 헤매는 중',
      '청년내일채움 채우려다 내 멘탈이 먼저 채워져서 터지겠다',
      '사무실 분리수거랑 택배 박스 까느라 손톱 다 부러짐...'
    ],
    highMorale: [
      '사수님이 오늘 작성한 쉘 스크립트 코드 리뷰에서 "잘 짰다"고 해주심! ㅠㅠ',
      '정직원 전환 제안 들어왔다! 나도 이제 어엿한 스타트업 정규직 엔지니어!',
      '대표님이 인턴인데도 사내 세미나 발표 기회 주셔서 열심히 준비 중!',
      '팀원들이 간식 사다 주면서 잘하고 있다고 격려해 주심!'
    ],
    lowCash: [
      '인턴 월급날인데 통장에 안 들어왔음... 혹시 대표님 깜빡하신 걸까...?',
      '점심 식대 지원 끊기면 삼각김밥 먹어야 하는데... 회사 살려주세요',
      '비품실 A4 용지 아껴 쓰라는 경고 쪽지 붙어있어서 메모장에 적는 중'
    ],
    normal: [
      '서버실 간식 창고에 핫브레이크 채워뒀습니다!',
      '회의록 깔끔하게 정리해서 노션에 업로드 완료',
      '열심히 배워서 저도 에이스 엔지니어가 되겠습니다',
      '오늘도 선배님들 어깨너머로 클러스터 운영 노하우 배우는 중'
    ]
  },

  // CFO / 재무이사
  cfo: {
    highBurnout: [
      '시중 은행 지점장한테 대출 연장해달라고 머리 조아리고 옴... 굴욕적이다',
      'IR 피칭 덱 재무 모델링 엑셀 시트 50번째 수정 중... 숫자가 눈앞에서 춤춘다',
      '매달 25일 급여일 다가올 때마다 심장 부정맥 생길 것 같음',
      '주주총회 감사 보고서 만드느라 3일 연속 밤샘... 숫자가 무섭다'
    ],
    highMorale: [
      '시리즈 A 밸류에이션 200억 인정받고 텀시트(LOI) 도장 찍었습니다!',
      '신용보증기금 퍼스트펭귄 보증서 승인 완료! 유동성 든든하게 확보!',
      '스톡옵션 가치 환산해 봤는데... 우리 진짜 돈방석 앉을 수도 있겠는데?',
      '재무 모델 턴어라운드 달성! 이제 월간 순익 흑자 구조로 진입합니다!'
    ],
    lowCash: [
      '런웨이(Runway) 2개월 남았습니다. 지금 당장 비용 절감 안 하면 파산입니다',
      '대표님, 개인 마이너스 통장이라도 뚫어서 법인에 가수금 넣으셔야 합니다',
      '다음 달 법인세랑 4대보험 낼 현금이 통장에 없습니다...',
      '직원 채용 동결하고 비품비 전액 삭감해야 자금 방어 가능합니다'
    ],
    normal: [
      '재무제표 결산 보고서 작성 중. 세무사 사무실과 통화 완료',
      '환율 변동성 체크 중. 엔비디아 GPU 수입 관세 환율 방어 전략 수립',
      '스타트업 생존의 핵심은 현금 흐름이다',
      '다음 분기 투자 유치를 위한 IR 티저 레터 배포 준비 완료'
    ]
  },

  // 사내 공통 (블라인드 라운지 & 익명 피드)
  common: {
    highBurnout: [
      '블라인드에 우리 회사 검색해 보니까 평점 2.1... 역시 사람 느끼는 건 다 똑같네',
      '새벽에 야근하고 첫차 타러 가는데 가로등 불빛이 왜 이리 처량하냐',
      '오늘도 영혼을 갈아 넣었다... 내일 출근하기 싫다',
      '이러다 몸 망가지면 산재 인정은 되려나... 건강이 최고다',
      '판교 방면 버스 타는 사람들 표정이 다 나와 똑같다'
    ],
    highMorale: [
      '우리 팀 분위기 요즘 미쳤음! 서로 으샤으샤해서 위기 다 넘기는 중',
      '스타트업 초기 멤버로 일하는 낭만이 바로 이런 거구나',
      '다음 라운드 투자 유치 성공 기사 떴다! 지인들한테 축하 연락 쏟아짐',
      '우리 회사가 AGI 시대를 선도한다는 자부심이 든다',
      '대표님이 쏜 회식 1차 소고기 2차 볼링장 대만족!'
    ],
    lowCash: [
      '대표님 표정이 요즘 너무 어두운데... 설마 회사 위험한가?',
      '비품실 A4 용지가 줄어들지 않는다... 프린트도 눈치 보여서 못 하는 중',
      '회사 단체 메신저에 "비용 절감 협조 요청" 공지 올라왔다... 긴축 모드 돌입',
      '이번 달 월급날 제때 들어오길 손 모아 기도 중...'
    ],
    normal: [
      '오늘 점심은 구내식당 말고 밖에서 돈까스 먹으러 갈 사람 구함',
      '서버실 에어컨 바람 너무 세서 가디건 필수임',
      '탕비실 얼음 정수기 고쳐주셔서 감사합니다',
      '오늘 날씨 맑아서 사무실 환기 한번 싹 시켰습니다',
      '커피 한 잔 마시고 오후 업무 파이팅합시다!'
    ]
  }
};

// 직군 별칭(alias) 매핑 보정
window.GAME_DATA.STAFF_MURMURS.developer = window.GAME_DATA.STAFF_MURMURS.backend;
window.GAME_DATA.STAFF_MURMURS.hardware_tech = window.GAME_DATA.STAFF_MURMURS.technician;
window.GAME_DATA.STAFF_MURMURS.ai_researcher = window.GAME_DATA.STAFF_MURMURS.ai_research;
window.GAME_DATA.STAFF_MURMURS.infra_ops = window.GAME_DATA.STAFF_MURMURS.devops;

window.GAME_DATA.staffMurmurs = window.GAME_DATA.STAFF_MURMURS;

/**
 * 직원의 현재 상태 및 회사 재정 상황을 분석하여 생생한 혼잣말(블라인드/슬랙)을 반환하는 헬퍼
 * @param {Object} [emp] 직원 객체 ({ jobId, name, burnout, morale })
 * @param {Object} [state] 전역 상태 객체
 * @returns {{ channel: 'blind'|'slack', author: string, text: string, type: 'burnout'|'morale'|'cash'|'normal' }}
 */
window.GAME_DATA.getRandomMurmur = function(emp, state) {
  state = state || window.state || {};
  const murmurs = window.GAME_DATA.STAFF_MURMURS;

  let jobId = (emp && emp.jobId) || 'common';
  let pool = murmurs[jobId] || murmurs.common;

  // 조건 판정: 1) 번아웃 심각(>70) 2) 사기 충만(>80) 3) 현금 위기(<1000만 또는 적자심각) 4) 일반
  const empBurnout = emp ? (emp.burnout || 0) : (state.burnout || 0);
  const empMorale = emp ? (emp.morale || 70) : (state.morale || 70);
  const money = typeof state.money === 'number' ? state.money : 50000000;
  const isLoss = typeof state.monthlyProfit === 'number' && state.monthlyProfit < 0;

  let category = 'normal';
  if (empBurnout >= 70) {
    category = 'highBurnout';
  } else if (empMorale >= 80) {
    category = 'highMorale';
  } else if (money < 10000000 || (money < 25000000 && isLoss)) {
    category = 'lowCash';
  }

  let candidates = pool[category] || pool.normal || murmurs.common.normal;
  if (!candidates || candidates.length === 0) {
    candidates = murmurs.common.normal;
  }

  const text = candidates[Math.floor(Math.random() * candidates.length)];
  const isBlind = category === 'highBurnout' || category === 'lowCash' || Math.random() < 0.35;
  const channel = isBlind ? 'blind' : 'slack';

  // 발언자 레이블 생성
  const jobsList = window.GAME_DATA.jobs || [];
  const jobInfo = jobsList.find(j => j.id === jobId);
  const jobTitle = jobInfo ? jobInfo.name.split(' ')[0] : '직원';

  let author = '';
  if (isBlind) {
    author = `[블라인드] 익명의 ${jobTitle}`;
  } else {
    const empName = (emp && emp.name) || '팀원';
    author = `[슬랙 #잡담] ${empName} (${jobTitle})`;
  }

  return {
    channel,
    author,
    text,
    type: category === 'highBurnout' ? 'burnout' : (category === 'highMorale' ? 'morale' : (category === 'lowCash' ? 'cash' : 'normal'))
  };
};

window.getRandomMurmur = window.GAME_DATA.getRandomMurmur;

