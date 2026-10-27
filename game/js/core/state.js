/**
 * game/js/core/state.js
 * CONVENTIONS.md 및 AGENTS.md 표준 스키마를 준수하는 단일 GameState 클래스 및 Modifier 계산기
 */

class GameState {
  constructor() {
    this.corpName = 'GPU 파운더스 (주)';
    this.money = 7000000;          // 초기 자금 700만 원
    this.creditScore = 780;        // 0 ~ 1000
    this.creditTier = 'A';
    this.reputation = 50;          // 0 ~ 100
    this.ceoStress = 10;           // 0 ~ 100
    this.ceoHealth = 100;          // 0 ~ 100
    this.ceoEquity = 100;          // 대표 지분 100%
    this.lieMeter = 0;             // 피칭 블러핑 누적

    // 시간 및 계절 체계 (2025년 3월 시작, 1개월 = 60초, 최대 84개월)
    this.month = 0;
    this.year = 2025;
    this.calendarMonth = 3;
    this.dayProgress = 0;          // 0 ~ 60초
    this.speed = 1;                // 0(일시정지), 1, 2, 4
    this.gameEnded = false;
    this.endingTriggered = null;

    // 직원 및 조직 상태
    this.employees = [];
    this.empUidCounter = 1;
    this.morale = 80;              // 직원 평균 사기
    this.burnout = 10;             // 직원 평균 번아웃
    this.welfare = {
      lunch: false,
      remote: false,
      macbook: false,
      work45: false,
      stockPool: false
    };

    // 보유 사업장
    this.offices = [
      {
        uid: 1,
        presetId: 'room_sinrim',
        customName: '신림동 자취방 원룸 (1호점)',
        gpus: [
          {
            uid: 101,
            model: 'gtx1060',
            health: 100,
            efficiency: 1.0,
            clockMul: 1.0,
            tempOffset: 0,
            wearMul: 1.0,
            miningMul: 1.0,
            mods: [],
            warranty: 12,
            isMining: false,
            isBroken: false
          }
        ],
        coolingTier: 'T1',
        powerTier: 'P1',
        upsCount: 0,
        hasSolar: false,
        hasDieselGen: false,
        extraCooling: 0,
        extraPower: 0,
        temp: 28.0,
        pue: 1.45,
        isTripped: false,
        tripTimer: 0,
        landlordAnger: 0
      }
    ];
    this.officeUidCounter = 2;
    this.gpuUidCounter = 102;

    // 크립토 및 거래소
    this.coinBalance = 0.0;
    this.coinPrice = 4250000;
    this.coinPriceHistory = [4200000, 4220000, 4250000];
    this.coinSellCount = 0;

    // 워크로드 배분율 (%)
    this.workloadAlloc = {
      crypto: 30,
      cloud: 70,
      saas: 0,
      corp: 0
    };
    this.saasUsers = 0;

    // 금융 / 대출 / 리스 / 지원사업 / VC
    this.loans = [];
    this.leases = []; // { id, model, monthly, remainingMonths }
    this.grantsState = {}; // id -> 'available' | 'applied' | 'approved' | 'rejected'
    this.vcState = {};     // id -> 'available' | 'approved'

    // 당근마켓 매물
    this.currentDeals = [];
    this.usedRefreshTimer = 15;

    // 읽기 전용 및 엔딩 판정용 누적 지표
    this.totalTflops = 4;
    this.monthlyProfit = 0;
    this.totalProfit = 0;
    this.totalEarnedAllTime = 0;
    this.valuation = 50000000;
    this.pue = 1.45;
    this.cashNegativeMonths = 0;
    this.electricUnpaidMonths = 0;
    this.miningAllocMonths = 0;
    this.auditCaughtCount = 0;

    // 플래그
    this.flags = {
      bizRegistered: false,
      listed: false,
      govBanned: false,
      govBanMonths: 0,
      grantFraud: false,
      auditCaught: false,
      hasGrant: false,
      hasAdminStaff: false,
      hadEmployees: false,
      landlordMaxed: false,
      acceptedMnA: false,
      hasChuncheonDC: false,
      greenDcCertified: false,
      fireProofed: false
    };

    // 기간형 효과 Modifiers: { id, name, stat, mul, add, months }
    this.modifiers = [];

    // 이벤트 쿨다운 맵: eventId -> lastTriggeredMonth
    this.eventCooldowns = {};
    this.eventHistory = [];
  }
}

window.GameState = GameState;
window.state = new GameState();

/**
 * 특정 stat에 대한 현재 유효 배율(mul)과 합산치(add)를 반환
 */
function getStatModifier(statName) {
  let mul = 1.0;
  let add = 0;
  if (window.state && Array.isArray(window.state.modifiers)) {
    window.state.modifiers.forEach(m => {
      if (m.stat === statName) {
        if (typeof m.mul === 'number') mul *= m.mul;
        if (typeof m.add === 'number') add += m.add;
      }
    });
  }
  return { mul, add };
}

function addModifier(mod) {
  if (!window.state) return;
  const existingIdx = window.state.modifiers.findIndex(m => m.id && m.id === mod.id);
  if (existingIdx !== -1) {
    window.state.modifiers[existingIdx] = Object.assign({}, mod);
  } else {
    window.state.modifiers.push(Object.assign({ months: 1 }, mod));
  }
}

function tickModifiersMonthly() {
  if (!window.state || !Array.isArray(window.state.modifiers)) return;
  window.state.modifiers.forEach(m => {
    m.months -= 1;
  });
  window.state.modifiers = window.state.modifiers.filter(m => m.months > 0);
}

window.getStatModifier = getStatModifier;
window.addModifier = addModifier;
window.tickModifiersMonthly = tickModifiersMonthly;
