/**
 * game/data/economy.js
 * 수치의 단일 기준 (Source of Truth): GPU 카탈로그, 사업장 프리셋, 정부지원사업, 대출, VC, 당근 스토리, 뉴스 티커
 */
window.GAME_DATA = window.GAME_DATA || {};

window.GAME_DATA.gpus = {
  gtx1060: { id: 'gtx1060', name: 'GTX 1060 6GB', tflops: 4, power: 120, heat: 1.5, newPrice: 280000, scrapVal: 60000, warrantyMonths: 12, tier: 1 },
  rtx3060: { id: 'rtx3060', name: 'RTX 3060 12GB', tflops: 13, power: 170, heat: 2.8, newPrice: 420000, scrapVal: 180000, warrantyMonths: 24, tier: 2 },
  rtx4090: { id: 'rtx4090', name: 'RTX 4090 24GB', tflops: 83, power: 450, heat: 8.0, newPrice: 2800000, scrapVal: 1500000, warrantyMonths: 36, tier: 3 },
  a100:    { id: 'a100',    name: 'A100 80GB SXM4', tflops: 312, power: 400, heat: 6.5, newPrice: 16000000, scrapVal: 9000000, warrantyMonths: 36, tier: 4 },
  h100:    { id: 'h100',    name: 'H100 80GB PCIe', tflops: 1000, power: 700, heat: 13.0, newPrice: 48000000, scrapVal: 32000000, warrantyMonths: 36, tier: 5 },
  b200:    { id: 'b200',    name: 'B200 NVL72 랙', tflops: 12000, power: 3000, heat: 35.0, newPrice: 420000000, scrapVal: 280000000, warrantyMonths: 48, tier: 6 }
};

window.GAME_DATA.offices = [
  {
    id: 'room_sinrim',
    name: '신림동 자취방 원룸 (1호점)',
    deposit: 5000000,
    monthlyRent: 450000,
    maintenanceFee: 120000, // 상가 공용 관리비 (청소/정화조)
    maxPower: 3000, // P1 가정용 단상 3kW
    coolingRate: 3.0, // T1 창문+선풍기
    slots: 6,
    minCoolingTier: 1,
    maxCoolingTier: 3,
    desc: '가정용 전력이라 누진세와 집주인 아줌마의 불시 방문 항의가 두렵습니다.',
    landlordNotice: true
  },
  {
    id: 'guro_jisan',
    name: '구로디지털단지 지식산업센터 402호',
    deposit: 15000000,
    monthlyRent: 1300000,
    maintenanceFee: 480000, // 엘리베이터/공용전기/보안
    maxPower: 20000, // 20kW
    coolingRate: 15.0,
    slots: 24,
    minCoolingTier: 2,
    maxCoolingTier: 6,
    desc: '산업용 전력 인입 완료. 초기 테크 스타트업들의 성지!',
    landlordNotice: false
  },
  {
    id: 'gangnam_wework',
    name: '테헤란로 공유오피스 엔지니어링 랩',
    deposit: 10000000,
    monthlyRent: 3800000,
    maintenanceFee: 850000, // 테헤란로 프라임 관리비
    maxPower: 12000,
    coolingRate: 25.0,
    slots: 16,
    minCoolingTier: 2,
    maxCoolingTier: 5,
    desc: 'VC 및 고객사 미팅용 럭셔리 주소지. 직원 사기 보너스 제공.',
    landlordNotice: false
  },
  {
    id: 'pangyo_idc',
    name: '판교 테크노밸리 코로케이션 IDC 랙',
    deposit: 40000000,
    monthlyRent: 11000000,
    maintenanceFee: 2600000, // 24시간 관제/항온항습 유지비
    maxPower: 100000, // 100kW
    coolingRate: 80.0,
    slots: 80,
    minCoolingTier: 4,
    maxCoolingTier: 9,
    desc: '24시간 무정전 전원 공급 장치(UPS) 및 항온항습 설비 완비.',
    landlordNotice: false
  },
  {
    id: 'chuncheon_dc',
    name: '춘천 소수력 발전 연계 하이퍼스케일 부지',
    deposit: 200000000,
    monthlyRent: 35000000,
    maintenanceFee: 7500000, // 소양강 수냉각 플랜트 종합 관리비
    maxPower: 1000000, // 1MW
    coolingRate: 300.0,
    slots: 300,
    minCoolingTier: 5,
    maxCoolingTier: 10,
    desc: '차가운 소양강 물과 찬 공기를 활용한 초대형 친환경 데이터센터.',
    landlordNotice: false
  }
];

window.GAME_DATA.leaseOptions = [
  { id: 'lease_a100', model: 'a100', count: 4, name: 'A100 80GB 4-GPU 서버 랙 리스', deposit: 10000000, monthly: 1500000, tflops: 1248 },
  { id: 'lease_h100', model: 'h100', count: 4, name: 'H100 80GB 4-GPU 클러스터 리스', deposit: 40000000, monthly: 5800000, tflops: 4000 }
];

window.GAME_DATA.loans = [
  {
    id: 'shinbo_youth',
    name: '신용보증기금(신보) 청년창업특례보증',
    principal: 30000000,
    interestRate: 0.035,
    minCreditScore: 650,
    minCredit: 'B',
    desc: '청년 창업가 대상 저금리 특례보증 대출 (연 3.5%)'
  },
  {
    id: 'kibo_venture',
    name: '기술보증기금(기보) AI 딥테크 혁신 대출',
    principal: 150000000,
    interestRate: 0.048,
    minCreditScore: 750,
    minCredit: 'A',
    desc: '자체 AI 기술력 및 GPU 인프라 보유 기업 대상 (연 4.8%)'
  },
  {
    id: 'ceo_minus_bank',
    name: '대표이사 개인 비상 마이너스 통장',
    principal: 50000000,
    interestRate: 0.085,
    minCreditScore: 500,
    minCredit: 'C',
    desc: '급전·월급 메꾸기용 고금리 비상 마통 (연 8.5%)'
  }
];

window.GAME_DATA.danggeunStories = [
  { text: '급전 필요해서 아끼던 글카 눈물을 머금고 처분합니다.', risk: 0.0, discount: 0.35, isMining: false },
  { text: '롤밖에 안 했습니다. 실사용 3개월 깨끗합니다.', risk: 0.05, discount: 0.25, isMining: false },
  { text: '사무실 정리로 여러 대 일괄 처분합니다. (먼지 약간 있음)', risk: 0.20, discount: 0.45, isMining: true },
  { text: '화면이 가끔 깜빡이는데 드라이버 문제 같아요. 반품 불가.', risk: 0.65, discount: 0.70, isMining: false, isBroken: true },
  { text: '채굴장에서 잘 관리되던 양품입니다. 써멀 작업 완료.', risk: 0.25, discount: 0.50, isMining: true },
  { text: '와이프한테 걸려서 오늘 밤 10시 전까지 무조건 팝니다.', risk: 0.0, discount: 0.40, isMining: false }
];

window.GAME_DATA.newsTicker = [
  '📢 [속보] 중기부, 하반기 AI 바우처 추경 예산 500억 편성 발표!',
  '⚡ [한전 공지] 7~8월 여름철 전력 피크시간대 일반용 전기요금 할증 적용.',
  '🚨 [당근마켓 경보] 최근 그래픽카드 택배 벽돌 사기 사건 급증, 직거래 권장.',
  '💼 [투자업계] "스타트업 투자 혹한기 지속... 런웨이 최소 18개월 확보해야"',
  '📈 [코인 데스크] 이더리움 네트워크 활성도 급증! 채굴 풀 보상 일시 증가.',
  '🏢 [부동산] 구로·가산 지식산업센터 공실률 상승으로 렌트프리 혜택 증가.',
  '🤖 [글로벌] 엔비디아 차세대 AI 칩셋 전 세계 품귀 현상, H100 리셀가 폭등.',
  '🎓 [학계] 6월·12월 대학원 기말 논문 시즌 도래, 스팟 GPU 렌탈 수요 폭증!'
];
