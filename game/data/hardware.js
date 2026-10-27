/**
 * game/data/hardware.js
 * GPU 개별 하드웨어 튜닝/개조 데이터, 사업장 쿨링 테크트리(11티어), 전력 인프라 테크트리(6단계 + 보조설비 3종)
 * 기준 문서: docs/design/04_hardware_tuning_techtree.md
 */
window.GAME_DATA = window.GAME_DATA || {};

window.GAME_DATA.gpuMods = [
  {
    id: 'undervolt',
    name: '언더볼팅 (MSI Afterburner)',
    icon: '🔋',
    cost: 0,
    durationSec: 0,
    successRate: 0.90,
    success: 0.90,
    desc: '전력 소모 -15%, 연산력 -3% (실패 시 클럭 불안정·내구도 소폭 하락)',
    onSuccess: { power: -0.15, tflops: -0.03 },
    onFail: { instability: true, health: -3 },
    on: { power: -0.15, tflops: -0.03 },
    fail: { instability: true, health: -3 }
  },
  {
    id: 'overclock',
    name: '코어/메모리 오버클럭',
    icon: '⚡',
    cost: 0,
    durationSec: 0,
    successRate: 0.75,
    success: 0.75,
    desc: '연산력 +12%, 소비전력 +20% (실패 시 화면 아티팩트 발생, 내구도 -10)',
    onSuccess: { tflops: 0.12, power: 0.20 },
    onFail: { health: -10 },
    on: { tflops: 0.12, power: 0.20 },
    fail: { health: -10 }
  },
  {
    id: 'paste',
    name: '서멀구리스 재도포 (MX-6)',
    icon: '🧴',
    cost: 20000,
    durationSec: 10,
    successRate: 0.95,
    success: 0.95,
    desc: 'GPU 코어 온도 -6°C (실패 시 방열판 나사 마모, 내구도 -5)',
    onSuccess: { temp: -6 },
    onFail: { health: -5 },
    on: { temp: -6 },
    fail: { health: -5 }
  },
  {
    id: 'pad',
    name: '서멀패드 교체 (겔리드 익스트림)',
    icon: '🩹',
    cost: 80000,
    durationSec: 20,
    successRate: 0.85,
    success: 0.85,
    desc: 'VRAM 온도 -12°C, 고온 마모율 -30% (실패 시 두께 미스로 코어 접촉 불량, 온도 +10°C)',
    onSuccess: { temp: -12, wear: -0.30 },
    onFail: { temp: 10, health: -5 },
    on: { temp: -12, wear: -0.30 },
    fail: { temp: 10, health: -5 }
  },
  {
    id: 'fan',
    name: '베어링 쿨링팬 교체',
    icon: '🌀',
    cost: 50000,
    durationSec: 10,
    successRate: 0.95,
    success: 0.95,
    desc: '채굴에디션 쇳소리 제거 및 고온 마모율 -20%',
    onSuccess: { wear: -0.20, clearMiningNoise: true },
    onFail: { health: -2 },
    on: { wear: -0.20 },
    fail: { health: -2 }
  },
  {
    id: 'heatsink',
    name: '구리 방열판 / 백플레이트 보강',
    icon: '🧱',
    cost: 150000,
    durationSec: 30,
    successRate: 0.80,
    success: 0.80,
    desc: '작동 온도 -8°C (실패 시 5% 확률로 기판 쇼트 영구 고장)',
    onSuccess: { temp: -8 },
    onFail: { dead: 0.05, health: -8 },
    on: { temp: -8 },
    fail: { dead: 0.05, health: -8 }
  },
  {
    id: 'vbios',
    name: '커스텀 VBIOS 롬플래싱',
    icon: '💾',
    cost: 0,
    durationSec: 15,
    successRate: 0.65,
    success: 0.65,
    desc: '전력제한 해제 → 연산력 +18%, 전력 +25% (실패 시 25% 벽돌화, 테크니션 복구 가능)',
    onSuccess: { tflops: 0.18, power: 0.25 },
    onFail: { brick: 0.25, health: -10 },
    on: { tflops: 0.18, power: 0.25 },
    fail: { brick: 0.25, health: -10 }
  },
  {
    id: 'memstrap',
    name: '메모리 타이밍 스트랩 (채굴 특화)',
    icon: '🧪',
    cost: 0,
    durationSec: 0,
    successRate: 0.70,
    success: 0.70,
    desc: '크립토 채굴 효율 +25% (AI 연산 효과 없음, 실패 시 메모리 에러·내구도 -15)',
    onSuccess: { mining: 0.25 },
    onFail: { health: -15 },
    on: { mining: 0.25 },
    fail: { health: -15 }
  },
  {
    id: 'waterblock',
    name: '개별 커스텀 수랭 워터블록',
    icon: '💧',
    cost: 350000,
    durationSec: 60,
    successRate: 0.75,
    success: 0.75,
    desc: '온도 -25°C, 오버클럭 성공률 +20%p (실패 시 10% 확률로 피팅 누수 → 인접 GPU 2대 피해)',
    onSuccess: { temp: -25, ocBonus: 0.20 },
    onFail: { leak: 0.10, health: -15 },
    on: { temp: -25, ocBonus: 0.20 },
    fail: { leak: 0.10, health: -15 }
  },
  {
    id: 'reball',
    name: '리볼링 (VRAM/코어 재납땜 외주)',
    icon: '🔁',
    cost: 400000,
    durationSec: 6,
    successRate: 0.60,
    success: 0.60,
    desc: '고장/벽돌 GPU 부활 및 내구도 60 회복 (실패 시 기판 손상으로 영구 사망)',
    onSuccess: { revive: 60 },
    onFail: { dead: 1.0, permDead: true },
    on: { revive: 60 },
    fail: { dead: 1.0, permDead: true }
  }
];

window.GAME_DATA.coolingTech = [
  {
    id: 'T1',
    tierNum: 1,
    name: 'T1 창문 개방 + 공업용 선풍기',
    cost: 30000,
    coolRate: 3,
    efficiencyBonus: 0,
    winterCoolRate: 4,
    summerCoolRate: 2,
    powerW: 50,
    noise: '낮음',
    reqOffice: null,
    desc: '방충망 열고 업소용 선풍기로 열기를 밀어냅니다.'
  },
  {
    id: 'T2',
    tierNum: 2,
    name: 'T2 에어서큘레이터 + 이동식 에어컨',
    cost: 600000,
    coolRate: 8,
    efficiencyBonus: 0,
    winterCoolRate: 8,
    summerCoolRate: 8,
    powerW: 900,
    noise: '중간',
    reqOffice: null,
    desc: '자바라 배기 호스를 창문에 연결한 이동식 냉방 시스템입니다.'
  },
  {
    id: 'T3',
    tierNum: 3,
    name: 'T3 인버터 벽걸이 에어컨',
    cost: 1200000,
    coolRate: 15,
    efficiencyBonus: 0,
    winterCoolRate: 15,
    summerCoolRate: 15,
    powerW: 1500,
    noise: '낮음',
    reqOffice: null,
    desc: '원룸에 설치 시 집주인 허락이 필요한 고효율 인버터 에어컨입니다.'
  },
  {
    id: 'T4',
    tierNum: 4,
    name: 'T4 핫/콜드 아일(Aisle) 컨테인먼트 분리',
    cost: 3000000,
    coolRate: 22,
    efficiencyBonus: 0.30,
    winterCoolRate: 22,
    summerCoolRate: 22,
    powerW: 0,
    noise: '없음',
    reqOffice: ['guro_jisan', 'gangnam_wework', 'pangyo_idc', 'chuncheon_dc'],
    desc: '차폐 커튼과 공기 통로 분리로 냉각 효율을 +30% 향상시킵니다 (추가 전력 0W).'
  },
  {
    id: 'T5',
    tierNum: 5,
    name: 'T5 산업용 항온항습기 (CRAC)',
    cost: 15000000,
    coolRate: 45,
    efficiencyBonus: 0,
    winterCoolRate: 45,
    summerCoolRate: 45,
    powerW: 6000,
    noise: '높음',
    reqOffice: ['guro_jisan', 'gangnam_wework', 'pangyo_idc', 'chuncheon_dc'],
    desc: '지식산업센터 이상 사업장에 설치 가능한 서버룸 전용 정밀 항온항습기입니다.'
  },
  {
    id: 'T5b',
    tierNum: 5.5,
    name: 'T5b 외기 냉방 (프리쿨링 공조기)',
    cost: 20000000,
    coolRate: 35,
    efficiencyBonus: 0,
    winterCoolRate: 60,
    summerCoolRate: 10,
    powerW: 1000,
    noise: '중간',
    reqOffice: ['guro_jisan', 'pangyo_idc', 'chuncheon_dc'],
    desc: '계절 연동형 공조기. 겨울 한파 시 냉각력 60(PUE 대폭 개선), 여름 폭염 시 냉각력 10.'
  },
  {
    id: 'T6',
    tierNum: 6,
    name: 'T6 리어도어 열교환기 (RDHx)',
    cost: 40000000,
    coolRate: 90,
    efficiencyBonus: 0.10,
    winterCoolRate: 95,
    summerCoolRate: 85,
    powerW: 4000,
    noise: '낮음',
    reqOffice: ['guro_jisan', 'pangyo_idc', 'chuncheon_dc'],
    desc: '서버 랙 후면 도어에 냉수 코일을 장착하여 배출 열기를 즉시 흡수합니다.'
  },
  {
    id: 'T7',
    tierNum: 7,
    name: 'T7 다이렉트 칩 수랭 (DLC)',
    cost: 120000000,
    coolRate: 200,
    efficiencyBonus: 0.15,
    winterCoolRate: 210,
    summerCoolRate: 195,
    powerW: 8000,
    noise: '낮음',
    reqOffice: ['pangyo_idc', 'chuncheon_dc'],
    desc: 'A100/H100급 고밀도 서버 칩셋에 냉각수를 직접 순환시키는 데이터센터 수랭 설비입니다.'
  },
  {
    id: 'T8',
    tierNum: 8,
    name: 'T8 단상 액침냉각 (비전도성 오일 탱크)',
    cost: 300000000,
    coolRate: 450,
    efficiencyBonus: 0.25,
    winterCoolRate: 460,
    summerCoolRate: 440,
    powerW: 10000,
    noise: '매우 낮음',
    reqOffice: ['pangyo_idc', 'chuncheon_dc'],
    desc: '비전도성 윤활유 수조에 GPU 서버를 통째로 담가 열과 소음을 완벽히 제어합니다.'
  },
  {
    id: 'T9',
    tierNum: 9,
    name: 'T9 2상 액침냉각 (특수 불화액 기화식)',
    cost: 800000000,
    coolRate: 1200,
    efficiencyBonus: 0.35,
    winterCoolRate: 1250,
    summerCoolRate: 1180,
    powerW: 12000,
    noise: '매우 낮음',
    reqOffice: ['pangyo_idc', 'chuncheon_dc'],
    desc: '불화액의 상변화(기화-응축) 잠열을 이용해 초고밀도 클러스터를 식히는 궁극의 냉각 기술입니다.'
  },
  {
    id: 'T_SOYANG',
    tierNum: 10,
    name: '★ 소양강 심층 냉수 친환경 냉각',
    cost: 1500000000,
    coolRate: 3000,
    efficiencyBonus: 0.50,
    winterCoolRate: 3400,
    summerCoolRate: 2800,
    powerW: 5000,
    noise: '없음',
    reqOffice: ['chuncheon_dc'],
    desc: '춘천 하이퍼스케일 DC 전용. 연중 4~7°C를 유지하는 소양강 심층수로 PUE 1.08 이하를 달성합니다.'
  }
];

window.GAME_DATA.powerTech = [
  {
    id: 'P1',
    type: 'main',
    tierNum: 1,
    name: 'P1 가정용 단상 전력 (누진제)',
    capacityW: 3000,
    cost: 0,
    desc: '기본 3kW. 사용량이 많으면 주택용 누진세 폭탄이 부과됩니다.'
  },
  {
    id: 'P2',
    type: 'main',
    tierNum: 2,
    name: 'P2 전용 차단기 회로 분기 공사',
    capacityW: 6000,
    cost: 500000,
    desc: '용량 6kW. 두꺼비집에서 에어컨·서버 전용 회로를 분리합니다.'
  },
  {
    id: 'P3',
    type: 'main',
    tierNum: 3,
    name: 'P3 한전 일반용(갑) 저압 증설',
    capacityW: 20000,
    cost: 4000000,
    desc: '용량 20kW. 가정용 누진제에서 벗어나 상업용 단가를 적용받습니다.'
  },
  {
    id: 'P4',
    type: 'main',
    tierNum: 4,
    name: 'P4 산업용(을) 고압 수전 설비',
    capacityW: 100000,
    cost: 30000000,
    desc: '용량 100kW. 자체 수변전실과 전기안전관리자 선임이 포함된 고압 전력망입니다.'
  },
  {
    id: 'P5',
    type: 'main',
    tierNum: 5,
    name: 'P5 특고압 22.9kV 전용선 수전',
    capacityW: 1000000,
    cost: 300000000,
    desc: '용량 1MW(1,000kW). 한전 계통 연계 심사를 거친 대형 데이터센터급 수전 설비입니다.'
  },
  {
    id: 'P6',
    type: 'main',
    tierNum: 6,
    name: 'P6 154kV 전용 변전소 직결',
    capacityW: 20000000,
    cost: 5000000000,
    desc: '용량 20MW(20,000kW). 하이퍼스케일 AI 클러스터를 위한 자체 변전소입니다.'
  },
  {
    id: 'ups',
    type: 'aux',
    tierNum: 0,
    name: '보조: UPS 무정전 전원 공급장치',
    capacityW: 2000,
    cost: 5000000,
    desc: '차단기 트립·순간 정전 시 데이터 손실 및 SLA 위약금을 방지하고 예비 전력(+2kW)을 보조합니다.'
  },
  {
    id: 'solar',
    type: 'aux',
    tierNum: 0,
    name: '보조: 옥상 태양광 발전 패널',
    capacityW: 5000,
    cost: 20000000,
    electricDiscount: 0.10,
    desc: '자체 재생에너지 발전으로 월 전기요금 -10% 감면 및 친환경 전력(+5kW)을 공급합니다.'
  },
  {
    id: 'diesel',
    type: 'aux',
    tierNum: 0,
    name: '보조: 비상용 디젤 발전기',
    capacityW: 15000,
    cost: 50000000,
    desc: '한전 광역 정전 이벤트를 완벽히 무효화하며 비상 피크 전력(+15kW)을 지탱합니다.'
  }
];
