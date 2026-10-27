/**
 * GPU Cloud Tycoon - Korean Tech Startup Edition
 * Pure Vanilla JavaScript Game Engine
 */

// --- Web Audio Synthesizer ---
class SoundController {
  constructor() {
    this.enabled = true;
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
  }

  playBeep(freq = 600, duration = 0.05, type = 'sine') {
    if (!this.enabled || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch(e) {}
  }

  playCash() {
    if (!this.enabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1046.50, now); // C6
      osc.frequency.setValueAtTime(1318.51, now + 0.07); // E6
      osc.frequency.setValueAtTime(1567.98, now + 0.14); // G6
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(now + 0.35);
    } catch(e) {}
  }

  playAlarm() {
    if (!this.enabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.3);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.3);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(now + 0.3);
    } catch(e) {}
  }
}

const sound = new SoundController();

// --- Hardware Master Specs ---
const GPU_CATALOG = {
  gtx1060: { name: 'GTX 1060 6GB', tflops: 4, power: 120, heat: 1.5, newPrice: 280000, scrapVal: 60000 },
  rtx3060: { name: 'RTX 3060 12GB', tflops: 13, power: 170, heat: 2.8, newPrice: 420000, scrapVal: 180000 },
  rtx4090: { name: 'RTX 4090 24GB', tflops: 83, power: 450, heat: 8.0, newPrice: 2800000, scrapVal: 1500000 },
  a100:    { name: 'A100 80GB SXM4', tflops: 312, power: 400, heat: 6.5, newPrice: 16000000, scrapVal: 9000000 },
  h100:    { name: 'H100 80GB PCIe', tflops: 1000, power: 700, heat: 13.0, newPrice: 48000000, scrapVal: 32000000 },
  b200:    { name: 'B200 NVL72 랙', tflops: 12000, power: 3000, heat: 35.0, newPrice: 420000000, scrapVal: 280000000 }
};

// --- Available Offices for Lease ---
const OFFICE_PRESETS = [
  {
    id: 'room_sinrim',
    name: '신림동 자취방 원룸 (1호점)',
    deposit: 5000000,
    monthlyRent: 450000,
    maxPower: 2500, // 2.5kW
    coolingRate: 3.0, // Natural fan
    slots: 6,
    desc: '가정용 전력이라 누진세와 집주인 아줌마의 불시 방문 항의가 두렵습니다.',
    landlordNotice: true
  },
  {
    id: 'guro_jisan',
    name: '구로디지털단지 지식산업센터 402호',
    deposit: 15000000,
    monthlyRent: 1300000,
    maxPower: 18000, // 18kW Industrial
    coolingRate: 15.0,
    slots: 24,
    desc: '산업용 고압 전력 인입 완료. 렌트프리 1개월 혜택 제공!',
    landlordNotice: false
  },
  {
    id: 'gangnam_wework',
    name: '테헤란로 공유오피스 엔지니어링 랩',
    deposit: 10000000,
    monthlyRent: 3800000,
    maxPower: 12000,
    coolingRate: 25.0,
    slots: 16,
    desc: 'VC 및 고객사 미팅용 럭셔리 주소지. 커피 무제한 제공.',
    landlordNotice: false
  },
  {
    id: 'pangyo_idc',
    name: '판교 테크노밸리 코로케이션 IDC 랙 4개',
    deposit: 40000000,
    monthlyRent: 11000000,
    maxPower: 75000, // 75kW
    coolingRate: 80.0,
    slots: 80,
    desc: '24시간 무정전 전원 공급 장치(UPS) 및 항온항습 설비 완비.',
    landlordNotice: false
  },
  {
    id: 'chuncheon_dc',
    name: '춘천 소수력 발전 연계 하이퍼스케일 부지',
    deposit: 200000000,
    monthlyRent: 35000000,
    maxPower: 400000, // 400kW
    coolingRate: 300.0,
    slots: 300,
    desc: '차가운 소양강 물과 찬 공기를 활용한 초대형 친환경 데이터센터.',
    landlordNotice: false
  }
];

// --- Korean Government Grants & Programs ---
const GOV_GRANTS = [
  {
    id: 'yechangpae',
    name: '중소벤처기업부 예비창업패키지',
    reward: 50000000, // 5000만
    chance: 0.9,
    cooldown: 0,
    status: 'available', // available, applied, approved, rejected
    desc: '대표자 인건비는 0원이지만, GPU 및 클라우드 장비 구입비 5천만원 무상 지원!'
  },
  {
    id: 'chocangpae',
    name: '창업진흥원 초기창업패키지',
    reward: 100000000, // 1억
    chance: 0.7,
    cooldown: 0,
    status: 'available',
    desc: '창업 3년 이내 기업 대상. 시제품 검증 및 AI 연산 클러스터 설비비 지원.'
  },
  {
    id: 'aivoucher',
    name: 'NIPA AI 바우처 공급기업 지원금',
    reward: 180000000, // 1.8억
    chance: 0.6,
    cooldown: 0,
    status: 'available',
    desc: '수요기업에게 우리 GPU 클라우드를 쓰게 하고 정부가 대신 대금을 입금해 줍니다.'
  },
  {
    id: 'tips',
    name: 'TIPS (민관공동창업자발굴육성) R&D',
    reward: 500000000, // 5억
    chance: 0.45,
    cooldown: 0,
    status: 'available',
    desc: '운영사 투자 연계 정부 매칭 5억원! 실패 시 제재 처분의 지옥.'
  }
];

// --- Bank Loans & VC ---
const LOAN_OPTIONS = [
  {
    id: 'shinbo_youth',
    name: '신용보증기금(신보) 청년창업특례보증',
    principal: 30000000, // 3000만
    interestRate: 0.035, // 3.5% annual
    minCredit: 'B'
  },
  {
    id: 'kibo_venture',
    name: '기술보증기금(기보) AI 딥테크 혁신 대출',
    principal: 150000000, // 1.5억
    interestRate: 0.048,
    minCredit: 'A'
  },
  {
    id: 'ceo_minus_bank',
    name: '대표이사 개인 비상 마이너스 통장',
    principal: 50000000,
    interestRate: 0.085, // 8.5%
    minCredit: 'C'
  }
];

const VC_ROUNDS = [
  {
    id: 'seed_round',
    name: '시드(Seed) 라운드 투자 유치',
    funding: 300000000, // 3억
    equityGiven: 12, // 12% equity
    reqTflops: 80,
    status: 'available',
    desc: '본엔젤스, 패스트벤처스 등 초기 스타트업 전문 투자사로부터 시드머니 확보.'
  },
  {
    id: 'series_a',
    name: '시리즈 A(Series A) 대규모 투자 유치',
    funding: 2500000000, // 25억
    equityGiven: 18,
    reqTflops: 600,
    status: 'available',
    desc: '혹한기 속에서도 폭풍 성장하는 GPU 인프라 기업으로 인정받아 대규모 실탄 확보.'
  }
];

// --- Danggeun Random Deal Generator ---
const DANGGEUN_STORIES = [
  { text: '급전 필요해서 아끼던 글카 눈물을 머금고 처분합니다.', risk: 0.0, discount: 0.35, isMining: false },
  { text: '롤밖에 안 했습니다. 실사용 3개월 깨끗합니다.', risk: 0.05, discount: 0.25, isMining: false },
  { text: '사무실 정리로 여러 대 일괄 처분합니다. (먼지 약간 있음)', risk: 0.20, discount: 0.45, isMining: true },
  { text: '화면이 가끔 깜빡이는데 드라이버 문제 같아요. 반품 불가.', risk: 0.65, discount: 0.70, isMining: false, isBroken: true },
  { text: '채굴장에서 잘 관리되던 양품입니다. 써멀 작업 완료.', risk: 0.25, discount: 0.50, isMining: true },
  { text: '와이프한테 걸려서 오늘 밤 10시 전까지 무조건 팝니다.', risk: 0.0, discount: 0.40, isMining: false }
];

// --- Korean Startup Reality News ---
const KOREAN_STARTUP_EVENTS = [
  '📢 [속보] 중기부, 하반기 AI 바우처 추경 예산 500억 편성 발표!',
  '⚡ [한전 공지] 7~8월 여름철 전력 피크시간대 일반용 전기요금 할증 적용.',
  '🚨 [당근마켓 경보] 최근 그래픽카드 택배 벽돌 사기 사건 급증, 직거래 권장.',
  '💼 [투자업계] "스타트업 투자 혹한기 지속... 런웨이 최소 18개월 확보해야"',
  '📈 [코인 데스크] 이더리움 가스비 폭등! 채굴 풀 보상 일시 증가.',
  '🏢 [부동산] 구로·가산 지식산업센터 공실률 상승으로 렌트프리 혜택 증가.',
  '🤖 [글로벌] 엔비디아 차세대 AI 칩셋 전 세계 품귀 현상, H100 리셀가 폭등.'
];

// --- Main Game State ---
class GameState {
  constructor() {
    this.corpName = 'GPU 파운더스 (주)';
    this.money = 7000000; // Starting 700만 원 (개인 쌈짓돈)
    this.creditScore = 780; // Credit score (0 ~ 1000)
    this.creditTier = 'A';

    // Offices owned
    this.offices = [
      {
        uid: 1,
        presetId: 'room_sinrim',
        customName: '신림동 자취방 원룸 (1호점)',
        gpus: [
          { uid: 101, model: 'gtx1060', isMiningEdition: false, isBroken: false }
        ],
        extraCooling: 0,
        extraPower: 0,
        temp: 32.0,
        isTripped: false,
        tripTimer: 0,
        landlordAnger: 0 // Anger from 0 to 100
      }
    ];
    this.officeUidCounter = 2;
    this.gpuUidCounter = 102;

    // Crypto & Wallet
    this.coinBalance = 0.0;
    this.coinPrice = 4250000; // ₩4,250,000 / ETH
    this.coinPriceHistory = [4200000, 4220000, 4250000];

    // Business Workload Allocation (Percentage 0 ~ 100)
    this.workloadAlloc = {
      crypto: 30, // 30% mining
      cloud: 70,  // 70% cloud rental
      saas: 0,
      corp: 0
    };

    // SaaS users
    this.saasUsers = 0;

    // Loans & Debts
    this.loans = []; // { id, name, principal, balance, monthlyInterest }
    this.totalEquityLost = 0;

    // Grants & VC Status
    this.grants = JSON.parse(JSON.stringify(GOV_GRANTS));
    this.vcRounds = JSON.parse(JSON.stringify(VC_ROUNDS));

    // Used Deals Currently in Danggeun
    this.currentDeals = [];
    this.usedRefreshTimer = 15;

    // Stats
    this.totalEarnedAllTime = 0;
  }
}

let state = new GameState();

// --- Helper Functions ---
function getCreditTier(score) {
  if (score >= 850) return 'AAA';
  if (score >= 750) return 'A';
  if (score >= 650) return 'B';
  if (score >= 550) return 'C';
  return 'D';
}

function formatKRW(val) {
  val = Math.floor(val);
  if (Math.abs(val) >= 100000000) {
    const eok = (val / 100000000).toFixed(2);
    return `${eok}억 원`;
  }
  if (Math.abs(val) >= 10000) {
    const man = Math.floor(val / 10000).toLocaleString();
    return `${man}만 원`;
  }
  return `${val.toLocaleString()}원`;
}

// --- Specification Calculations ---
function calculateGlobalSpecs() {
  let totalTflops = 0;
  let totalPowerUsage = 0;
  let totalRentMonthly = 0;
  let totalGpuCount = 0;

  state.offices.forEach(office => {
    const preset = OFFICE_PRESETS.find(p => p.id === office.presetId) || OFFICE_PRESETS[0];
    totalRentMonthly += preset.monthlyRent;

    office.gpus.forEach(gpu => {
      totalGpuCount++;
      if (!gpu.isBroken && !office.isTripped) {
        const spec = GPU_CATALOG[gpu.model];
        if (spec) {
          totalTflops += spec.tflops;
          totalPowerUsage += spec.power;
        }
      }
    });
  });

  // Calculate Loan Monthly Interests
  let monthlyLoanInterest = 0;
  state.loans.forEach(loan => {
    monthlyLoanInterest += Math.floor(loan.balance * (loan.interestRate / 12));
  });

  const totalMonthlyFixedCost = totalRentMonthly + monthlyLoanInterest;
  // Convert monthly cost to per second cost (assuming 1 month = 60 seconds in game time)
  const fixedCostPerSec = totalMonthlyFixedCost / 60;

  // Workload Revenue Calculations
  const alloc = state.workloadAlloc;
  const cryptoTflops = totalTflops * (alloc.crypto / 100);
  const cloudTflops = totalTflops * (alloc.cloud / 100);
  const saasTflops = totalTflops * (alloc.saas / 100);
  const corpTflops = totalTflops * (alloc.corp / 100);

  // 1 TFLOPS of mining produces approx 0.000008 ETH/sec
  const ethPerSec = cryptoTflops * 0.000008;

  // Cloud Spot Rental: ₩350/sec per 10 TFLOPS
  const cloudIncomePerSec = (cloudTflops / 10) * 350;

  // SaaS Income: Subscribers generate ₩50/sec each, but requires at least 0.1 TFLOPS per 50 users
  const supportedUsers = Math.floor(saasTflops * 50);
  const activeSaaSUsers = Math.min(state.saasUsers, Math.max(10, supportedUsers));
  const saasIncomePerSec = activeSaaSUsers * 3.5;

  // Enterprise Bigtech: Only unlocks if >= 800 TFLOPS allocated
  let corpIncomePerSec = 0;
  if (corpTflops >= 800) {
    corpIncomePerSec = (corpTflops / 100) * 8500;
  }

  const grossCashPerSec = cloudIncomePerSec + saasIncomePerSec + corpIncomePerSec;
  const netCashPerSec = grossCashPerSec - fixedCostPerSec;

  return {
    totalTflops: Math.round(totalTflops),
    totalPowerUsage,
    totalRentMonthly,
    monthlyLoanInterest,
    totalMonthlyFixedCost,
    fixedCostPerSec,
    totalGpuCount,
    cryptoTflops: Math.round(cryptoTflops),
    cloudTflops: Math.round(cloudTflops),
    saasTflops: Math.round(saasTflops),
    corpTflops: Math.round(corpTflops),
    ethPerSec,
    cloudIncomePerSec,
    saasIncomePerSec,
    corpIncomePerSec,
    grossCashPerSec,
    netCashPerSec
  };
}

// --- Danggeun Used Deal Generator ---
function refreshDanggeunDeals() {
  const models = ['gtx1060', 'gtx1060', 'rtx3060', 'rtx3060', 'rtx4090', 'a100'];
  const newDeals = [];

  for (let i = 0; i < 4; i++) {
    const modelKey = models[Math.floor(Math.random() * models.length)];
    const spec = GPU_CATALOG[modelKey];
    const story = DANGGEUN_STORIES[Math.floor(Math.random() * DANGGEUN_STORIES.length)];
    const price = Math.round(spec.newPrice * (1 - story.discount));
    const manner = (36.5 + (Math.random() * 25 - 5)).toFixed(1);

    newDeals.push({
      id: Math.random().toString(36).substring(7),
      model: modelKey,
      name: spec.name,
      price: price,
      originalPrice: spec.newPrice,
      mannerTemp: manner,
      story: story.text,
      isMining: story.isMining,
      isBroken: story.isBroken || false,
      negoDone: false
    });
  }

  state.currentDeals = newDeals;
  renderDanggeunDeals();
}

// --- Rendering Functions ---
function renderUI() {
  const specs = calculateSpecsGlobalSafe();

  // Header Bar
  document.getElementById('stat-money').textContent = formatKRW(state.money);
  const netEl = document.getElementById('stat-net-income');
  if (specs.netCashPerSec >= 0) {
    netEl.textContent = `+${formatKRW(specs.netCashPerSec)}/초 (순이익)`;
    netEl.className = 'stat-sub net-profit text-green font-mono';
  } else {
    netEl.textContent = `-${formatKRW(Math.abs(specs.netCashPerSec))}/초 (적자 지출)`;
    netEl.className = 'stat-sub net-profit text-red font-mono';
  }

  document.getElementById('stat-coin').textContent = `${state.coinBalance.toFixed(4)} ETH`;
  const coinVal = Math.floor(state.coinBalance * state.coinPrice);
  document.getElementById('stat-coin-value').textContent = `≈ ${formatKRW(coinVal)} (시세: ${formatKRW(state.coinPrice)})`;

  document.getElementById('stat-total-tflops').textContent = `${specs.totalTflops.toLocaleString()} TFLOPS`;
  document.getElementById('stat-gpu-summary').textContent = `총 보유 ${specs.totalGpuCount}대 (${state.offices.length}개 사업장)`;

  document.getElementById('stat-fixed-costs').textContent = `-${formatKRW(specs.totalMonthlyFixedCost)}/월`;
  const totalLoanBalance = state.loans.reduce((acc, l) => acc + l.balance, 0);
  document.getElementById('stat-loan-balance').textContent = `대출 잔액: ${formatKRW(totalLoanBalance)}`;

  // Credit Badge
  state.creditTier = getCreditTier(state.creditScore);
  const creditEl = document.getElementById('stat-credit-score');
  creditEl.textContent = `신용등급: ${state.creditTier} (${state.creditScore}점)`;

  // Office Count Badge
  document.getElementById('office-count-badge').textContent = state.offices.length;

  // Workload UI
  renderWorkloadUI(specs);

  // Market & Exchange
  document.getElementById('current-coin-price').textContent = formatKRW(state.coinPrice);
  document.getElementById('market-wallet-eth').textContent = `${state.coinBalance.toFixed(4)} ETH`;
  document.getElementById('market-wallet-krw').textContent = formatKRW(coinVal);

  // Render Offices
  renderOfficesList();
}

function calculateSpecsGlobalSafe() {
  try {
    return calculateGlobalSpecs();
  } catch(e) {
    return {
      totalTflops: 0,
      totalPowerUsage: 0,
      totalRentMonthly: 0,
      monthlyLoanInterest: 0,
      totalMonthlyFixedCost: 0,
      fixedCostPerSec: 0,
      totalGpuCount: 0,
      cryptoTflops: 0,
      cloudTflops: 0,
      saasTflops: 0,
      corpTflops: 0,
      ethPerSec: 0,
      cloudIncomePerSec: 0,
      saasIncomePerSec: 0,
      corpIncomePerSec: 0,
      grossCashPerSec: 0,
      netCashPerSec: 0
    };
  }
}

function renderOfficesList() {
  const container = document.getElementById('offices-list');
  container.innerHTML = state.offices.map((office, idx) => {
    const preset = OFFICE_PRESETS.find(p => p.id === office.presetId) || OFFICE_PRESETS[0];
    const maxPower = preset.maxPower + (office.extraPower || 0);
    const maxSlots = preset.slots;
    
    let officePower = 0;
    office.gpus.forEach(gpu => {
      const spec = GPU_CATALOG[gpu.model];
      if (spec && !gpu.isBroken) officePower += spec.power;
    });

    const powerPct = Math.min(100, Math.round((officePower / maxPower) * 100));
    const isPowerOver = officePower > maxPower;

    return `
      <div class="office-card" style="${office.isTripped ? 'border-color: var(--accent-red);' : ''}">
        <div class="office-header">
          <div>
            <div class="office-title">${office.customName}</div>
            <span class="sub-desc">${preset.name}</span>
          </div>
          <div class="office-rent">월세 ${formatKRW(preset.monthlyRent)}</div>
        </div>

        <div class="office-status-bars">
          <!-- Power Bar -->
          <div class="bar-row">
            <div class="bar-labels">
              <span>전력 소비: <b>${officePower.toLocaleString()}W / ${maxPower.toLocaleString()}W</b></span>
              <span class="${isPowerOver ? 'text-red font-mono' : ''}">${isPowerOver ? '⚠️ 과부하' : `${powerPct}%`}</span>
            </div>
            <div class="bar-track">
              <div class="bar-fill ${isPowerOver ? 'danger' : ''}" style="width: ${powerPct}%;"></div>
            </div>
          </div>

          <!-- Temp Bar -->
          <div class="bar-row">
            <div class="bar-labels">
              <span>실내/서버 온도: <b>${office.temp.toFixed(1)}°C</b></span>
              <span class="${office.temp > 80 ? 'text-red font-mono' : ''}">${office.temp > 80 ? '🔥 과열' : '정상'}</span>
            </div>
            <div class="bar-track">
              <div class="bar-fill ${office.temp > 80 ? 'danger' : (office.temp > 60 ? 'warning' : '')}" style="width: ${Math.min(100, (office.temp / 100) * 100)}%;"></div>
            </div>
          </div>

          ${preset.landlordNotice ? `
            <div class="bar-row">
              <div class="bar-labels">
                <span>집주인 눈치/항의 게이지:</span>
                <span class="text-amber font-mono">${office.landlordAnger || 0}%</span>
              </div>
              <div class="bar-track">
                <div class="bar-fill warning" style="width: ${office.landlordAnger || 0}%;"></div>
              </div>
            </div>
          ` : ''}
        </div>

        <!-- GPU Rack Display Inside Office -->
        <div>
          <div class="bar-labels" style="margin-bottom: 6px;">
            <span>장착된 GPU (<b>${office.gpus.length}</b> / ${maxSlots}대)</span>
            ${office.isTripped ? '<span class="text-red font-mono">🚨 차단기 떨어짐 (정전)</span>' : ''}
          </div>
          <div class="office-gpus-grid">
            ${office.gpus.length === 0 ? '<div style="font-size: 0.75rem; color: var(--text-secondary); text-align: center; padding: 20px 0;">장착된 GPU가 없습니다.</div>' : ''}
            ${office.gpus.map(gpu => {
              const spec = GPU_CATALOG[gpu.model];
              return `
                <div class="office-gpu-item">
                  <span>${gpu.isBroken ? '💥 [고장] ' : ''}${spec.name} ${gpu.isMining ? '⛏️' : ''}</span>
                  <div style="display: flex; gap: 6px; align-items: center;">
                    <span class="font-mono text-cyan">${spec.tflops} TF</span>
                    <button class="small-btn text-red" onclick="sellGpuFromOffice(${office.uid}, ${gpu.uid})">매각</button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <div class="office-actions-row">
          <button class="small-btn" onclick="upgradeOfficePower(${office.uid})">⚡ 차단기 증설 (+3kW / ₩50만)</button>
          <button class="small-btn" onclick="upgradeOfficeCooling(${office.uid})">❄️ 에어컨 추가 (+10°C / ₩60만)</button>
          ${idx > 0 ? `<button class="small-btn text-red" onclick="terminateOfficeLease(${office.uid})">임대 해지</button>` : ''}
        </div>
      </div>
    `;
  }).join('');
}

function renderDanggeunDeals() {
  const container = document.getElementById('used-deals-grid');
  container.innerHTML = state.currentDeals.map(deal => {
    return `
      <div class="deal-card">
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span class="danggeun-badge">당근마켓</span>
            <span class="manner-temp">매너온도 ${deal.mannerTemp}°C</span>
          </div>
          <h4 class="deal-title">${deal.name}</h4>
          <p class="deal-seller-story">"${deal.story}"</p>
        </div>

        <div>
          <div style="font-size: 0.72rem; color: var(--text-secondary); text-decoration: line-through;">정가 ${formatKRW(deal.originalPrice)}</div>
          <div class="deal-price">${formatKRW(deal.price)}</div>
        </div>

        <div class="deal-btn-row">
          <button class="nego-btn" ${deal.negoDone ? 'disabled' : ''} onclick="negoDanggeunDeal('${deal.id}')">
            ${deal.negoDone ? '네고 완료' : '💬 네고 찔러보기'}
          </button>
          <button class="buy-now-btn" onclick="buyDanggeunDeal('${deal.id}')">바로 구매 (직거래)</button>
        </div>
      </div>
    `;
  }).join('');
}

function renderNewGpus() {
  const container = document.getElementById('new-gpu-grid');
  container.innerHTML = Object.keys(GPU_CATALOG).map(key => {
    const gpu = GPU_CATALOG[key];
    return `
      <div class="deal-card">
        <div>
          <span class="tag tag-blue">공식 총판 신품 (무상 AS 3년)</span>
          <h4 class="deal-title" style="margin-top: 6px;">${gpu.name}</h4>
          <p class="deal-seller-story">정식 KC 인증 완료. 전자세금계산서 발행 가능.</p>
        </div>
        <div class="spec-pills">
          <span class="spec-pill">연산력: ${gpu.tflops} TFLOPS</span>
          <span class="spec-pill">소비전력: ${gpu.power}W</span>
        </div>
        <div class="deal-price">${formatKRW(gpu.newPrice)}</div>
        <button class="primary-btn" onclick="buyNewGpu('${key}')">신품 발주 구매</button>
      </div>
    `;
  }).join('');
}

function renderLeaseGpus() {
  const container = document.getElementById('lease-gpu-grid');
  const leaseOptions = [
    { model: 'a100', name: 'A100 80GB 4-GPU 서버 랙 리스', deposit: 10000000, monthly: 1500000, tflops: 1248 },
    { model: 'h100', name: 'H100 80GB 8-GPU 슈퍼클러스터 리스', deposit: 40000000, monthly: 5800000, tflops: 8000 }
  ];

  container.innerHTML = leaseOptions.map(l => {
    return `
      <div class="deal-card">
        <div>
          <span class="tag tag-purple">엔터프라이즈 리스/렌탈</span>
          <h4 class="deal-title" style="margin-top: 6px;">${l.name}</h4>
          <p class="deal-seller-story">보증금 지급 후 월 리스료로 즉시 투입 가능 (약정 3개월)</p>
        </div>
        <div class="spec-pills">
          <span class="spec-pill">연산력: ${l.tflops} TFLOPS</span>
        </div>
        <div>
          <div style="font-size: 0.8rem; color: var(--text-secondary);">보증금: ${formatKRW(l.deposit)}</div>
          <div class="deal-price" style="font-size: 1rem; color: var(--accent-purple);">월 ${formatKRW(l.monthly)}/월</div>
        </div>
        <button class="primary-btn" onclick="leaseGpuServer('${l.model}', ${l.deposit}, ${l.monthly})">리스 계약 체결</button>
      </div>
    `;
  }).join('');
}

function renderWorkloadUI(specs) {
  const alloc = state.workloadAlloc;
  const totalAlloc = alloc.crypto + alloc.cloud + alloc.saas + alloc.corp;
  
  document.getElementById('alloc-total-pct').textContent = `${totalAlloc}%`;
  const statusEl = document.getElementById('alloc-status-text');
  if (totalAlloc > 100) {
    statusEl.textContent = '⚠️ 배분율 100% 초과! 조정 필요';
    statusEl.style.color = 'var(--accent-red)';
  } else if (totalAlloc === 100) {
    statusEl.textContent = '✅ 연산력 100% 최적 가동 중';
    statusEl.style.color = 'var(--accent-green)';
  } else {
    statusEl.textContent = `여유 연산력 ${100 - totalAlloc}% 대기 중`;
    statusEl.style.color = 'var(--text-secondary)';
  }

  // Workload values
  document.getElementById('wl-crypto-tflops').textContent = `${specs.cryptoTflops} TFLOPS`;
  document.getElementById('wl-crypto-rate').textContent = `+${specs.ethPerSec.toFixed(5)} ETH/초`;

  document.getElementById('wl-cloud-tflops').textContent = `${specs.cloudTflops} TFLOPS`;
  document.getElementById('wl-cloud-rate').textContent = `+${formatKRW(specs.cloudIncomePerSec)}/초`;

  document.getElementById('saas-users').textContent = `${state.saasUsers.toLocaleString()}명`;
  document.getElementById('wl-saas-rate').textContent = `+${formatKRW(specs.saasIncomePerSec)}/초`;

  document.getElementById('wl-corp-tflops').textContent = `${specs.corpTflops} TFLOPS`;
  document.getElementById('wl-corp-rate').textContent = specs.corpIncomePerSec > 0 ? `+${formatKRW(specs.corpIncomePerSec)}/초` : '연산력 800 TF 미달 (계약 대기)';
}

function renderFinanceUI() {
  // Grants
  const grantsEl = document.getElementById('grants-list');
  grantsEl.innerHTML = state.grants.map(grant => {
    return `
      <div class="finance-item-card">
        <div>
          <span class="tag tag-green">무상 국고보조금</span>
          <h4 style="font-size: 0.95rem; margin-top: 4px;">${grant.name}</h4>
          <p class="deal-seller-story" style="margin-top: 6px;">${grant.desc}</p>
        </div>
        <div class="grant-reward">${formatKRW(grant.reward)}</div>
        <button class="primary-btn" ${grant.status !== 'available' ? 'disabled' : ''} onclick="applyGovernmentGrant('${grant.id}')">
          ${grant.status === 'applied' ? '심사 평가 진행 중...' : (grant.status === 'approved' ? '수혜 완료' : '사업계획서 제출 (신청)')}
        </button>
      </div>
    `;
  }).join('');

  // Loans
  const loansEl = document.getElementById('loans-list');
  loansEl.innerHTML = LOAN_OPTIONS.map(opt => {
    const isAlreadyTaken = state.loans.some(l => l.id === opt.id);
    return `
      <div class="finance-item-card">
        <div>
          <span class="tag tag-blue">정책 금융 대출</span>
          <h4 style="font-size: 0.95rem; margin-top: 4px;">${opt.name}</h4>
          <p class="deal-seller-story" style="margin-top: 6px;">한도: ${formatKRW(opt.principal)} | 연 금리: ${(opt.interestRate * 100).toFixed(1)}%</p>
        </div>
        <div class="grant-reward" style="color: var(--accent-cyan);">${formatKRW(opt.principal)}</div>
        <button class="primary-btn" ${isAlreadyTaken ? 'disabled' : ''} onclick="takeBankLoan('${opt.id}')">
          ${isAlreadyTaken ? '대출 이용 중' : '대출 심사 및 실행'}
        </button>
      </div>
    `;
  }).join('');

  // VC
  const vcEl = document.getElementById('vc-rounds-list');
  vcEl.innerHTML = state.vcRounds.map(vc => {
    const specs = calculateSpecsGlobalSafe();
    const canPitch = specs.totalTflops >= vc.reqTflops;
    return `
      <div class="finance-item-card">
        <div>
          <span class="tag tag-purple">지분 투자 유치</span>
          <h4 style="font-size: 0.95rem; margin-top: 4px;">${vc.name}</h4>
          <p class="deal-seller-story" style="margin-top: 6px;">${vc.desc} (요구 연산력: ${vc.reqTflops} TF)</p>
        </div>
        <div>
          <div class="grant-reward" style="color: var(--accent-purple);">${formatKRW(vc.funding)}</div>
          <span class="sub-desc">지분 ${vc.equityGiven}% 희석</span>
        </div>
        <button class="primary-btn" ${(!canPitch || vc.status === 'approved') ? 'disabled' : ''} onclick="pitchToVC('${vc.id}')">
          ${vc.status === 'approved' ? '투자 유치 완료' : (canPitch ? 'IR 피칭 데모데이 참가' : '연산력 지표 부족')}
        </button>
      </div>
    `;
  }).join('');
}

// --- Player Interactions ---

// Find first office with available slot
function getOfficeWithAvailableSlot() {
  for (const office of state.offices) {
    const preset = OFFICE_PRESETS.find(p => p.id === office.presetId) || OFFICE_PRESETS[0];
    if (office.gpus.length < preset.slots) {
      return office;
    }
  }
  return null;
}

function buyDanggeunDeal(dealId) {
  sound.init();
  const deal = state.currentDeals.find(d => d.id === dealId);
  if (!deal) return;

  const targetOffice = getOfficeWithAvailableSlot();
  if (!targetOffice) {
    showToast('❌ 모든 사업장의 랙 슬롯이 가득 찼습니다! 새 사무실을 임대하세요.');
    return;
  }

  if (state.money < deal.price) {
    showToast('❌ 현금이 부족합니다!');
    return;
  }

  state.money -= deal.price;
  sound.playCash();

  // Probability of being broken (danggeun scam or brick)
  const isActuallyBroken = deal.isBroken || (Math.random() < 0.05);

  targetOffice.gpus.push({
    uid: state.gpuUidCounter++,
    model: deal.model,
    isMining: deal.isMining,
    isBroken: isActuallyBroken
  });

  // Remove from deals
  state.currentDeals = state.currentDeals.filter(d => d.id !== dealId);

  if (isActuallyBroken) {
    sound.playAlarm();
    showToast('🚨 헉! 택배를 열어보니 고장난 냉납 에디션/벽돌이 들어있었습니다! (경찰서 고소 필요)');
  } else {
    showToast(`🥕 당근마켓 직거래 성공! ${deal.name} 장착 완료.`);
  }

  renderUI();
  renderDanggeunDeals();
}

function negoDanggeunDeal(dealId) {
  sound.init();
  const deal = state.currentDeals.find(d => d.id === dealId);
  if (!deal || deal.negoDone) return;

  deal.negoDone = true;
  // 60% chance to accept nego
  if (Math.random() < 0.6) {
    const discount = Math.round(deal.price * 0.15);
    deal.price -= discount;
    sound.playBeep(880, 0.1);
    showToast(`🎉 네고 성공! "학생이라 봐드립니다." (-${formatKRW(discount)})`);
  } else {
    sound.playBeep(300, 0.15, 'sawtooth');
    showToast('😤 판매자: "죄송하지만 네고 사절입니다. 차단할게요."');
  }
  renderDanggeunDeals();
}

function buyNewGpu(modelKey) {
  sound.init();
  const spec = GPU_CATALOG[modelKey];
  const targetOffice = getOfficeWithAvailableSlot();
  if (!targetOffice) {
    showToast('❌ 모든 사업장의 슬롯이 가득 찼습니다! 사무실을 추가하세요.');
    return;
  }

  if (state.money < spec.newPrice) {
    showToast('❌ 잔고가 부족합니다. 대출이나 지원사업을 알아보세요!');
    return;
  }

  state.money -= spec.newPrice;
  targetOffice.gpus.push({
    uid: state.gpuUidCounter++,
    model: modelKey,
    isMining: false,
    isBroken: false
  });

  sound.playCash();
  showToast(`📦 공식 총판에서 ${spec.name} 신품이 입고되어 랙에 장착되었습니다.`);
  renderUI();
}

function leaseGpuServer(modelKey, deposit, monthly) {
  sound.init();
  const targetOffice = getOfficeWithAvailableSlot();
  if (!targetOffice) {
    showToast('❌ 슬롯이 부족합니다!');
    return;
  }

  if (state.money < deposit) {
    showToast(`❌ 보증금 ${formatKRW(deposit)}이 부족합니다!`);
    return;
  }

  state.money -= deposit;
  sound.playCash();

  // Add 4 GPUs
  for (let i = 0; i < 4; i++) {
    targetOffice.gpus.push({
      uid: state.gpuUidCounter++,
      model: modelKey,
      isMining: false,
      isBroken: false
    });
  }

  showToast(`🤝 리스 계약 체결! 고성능 랙이 ${targetOffice.customName}에 배치되었습니다.`);
  renderUI();
}

function sellGpuFromOffice(officeUid, gpuUid) {
  sound.init();
  const office = state.offices.find(o => o.uid === officeUid);
  if (!office) return;

  const idx = office.gpus.findIndex(g => g.uid === gpuUid);
  if (idx !== -1) {
    const gpu = office.gpus[idx];
    const spec = GPU_CATALOG[gpu.model];
    const refund = gpu.isBroken ? Math.round(spec.scrapVal * 0.3) : spec.scrapVal;
    state.money += refund;
    office.gpus.splice(idx, 1);
    sound.playCash();
    showToast(`💰 ${spec.name} 매각 완료 (+${formatKRW(refund)})`);
    renderUI();
  }
}

function upgradeOfficePower(officeUid) {
  sound.init();
  const cost = 500000;
  if (state.money < cost) {
    showToast('❌ 공사비 50만원이 부족합니다.');
    return;
  }
  const office = state.offices.find(o => o.uid === officeUid);
  if (office) {
    state.money -= cost;
    office.extraPower = (office.extraPower || 0) + 3000; // +3kW
    sound.playCash();
    showToast(`⚡ ${office.customName} 전기 배선 및 차단기 증설 완료! (+3,000W)`);
    renderUI();
  }
}

function upgradeOfficeCooling(officeUid) {
  sound.init();
  const cost = 600000;
  if (state.money < cost) {
    showToast('❌ 에어컨 설치비 60만원이 부족합니다.');
    return;
  }
  const office = state.offices.find(o => o.uid === officeUid);
  if (office) {
    state.money -= cost;
    office.extraCooling = (office.extraCooling || 0) + 12.0;
    sound.playCash();
    showToast(`❄️ ${office.customName} 고출력 인버터 에어컨 설치 완료!`);
    renderUI();
  }
}

function terminateOfficeLease(officeUid) {
  if (state.offices.length <= 1) {
    showToast('❌ 본사 역할을 하는 마지막 사업장은 해지할 수 없습니다.');
    return;
  }
  const office = state.offices.find(o => o.uid === officeUid);
  if (office.gpus.length > 0) {
    showToast('⚠️ 사업장 내의 GPU를 모두 먼저 다른 곳으로 옮기거나 매각해야 합니다!');
    return;
  }

  const preset = OFFICE_PRESETS.find(p => p.id === office.presetId);
  state.money += preset.deposit; // Return deposit
  state.offices = state.offices.filter(o => o.uid !== officeUid);
  showToast(`🏢 ${office.customName} 임대차 계약 해지 및 보증금 ${formatKRW(preset.deposit)}을 반환받았습니다.`);
  renderUI();
}

// Government Grants Application
function applyGovernmentGrant(grantId) {
  sound.init();
  const grant = state.grants.find(g => g.id === grantId);
  if (!grant || grant.status !== 'available') return;

  grant.status = 'applied';
  renderFinanceUI();
  showToast(`📑 [${grant.name}] e나라도움 시스템에 사업계획서 접수 완료! 심사 평가가 시작됩니다.`);

  // 4 seconds evaluation
  setTimeout(() => {
    if (Math.random() < grant.chance) {
      grant.status = 'approved';
      state.money += grant.reward;
      sound.playCash();
      showToast(`🎉 [최종 합격] ${grant.name} 선정! 무상 지원금 ${formatKRW(grant.reward)}이 전용 가상계좌로 입금되었습니다!`);
    } else {
      grant.status = 'available'; // can reapply later
      sound.playAlarm();
      showToast(`😢 [탈락] ${grant.name} 서면 평가 탈락... "시장성 및 기술 독창성 보완 필요"`);
    }
    renderUI();
    renderFinanceUI();
  }, 4000);
}

// Bank Loans
function takeBankLoan(loanId) {
  sound.init();
  const opt = LOAN_OPTIONS.find(l => l.id === loanId);
  if (!opt) return;

  state.money += opt.principal;
  state.loans.push({
    id: opt.id,
    name: opt.name,
    principal: opt.principal,
    balance: opt.principal,
    interestRate: opt.interestRate
  });

  sound.playCash();
  showToast(`🏦 [대출 실행] ${opt.name} 보증서 승인 완료! ${formatKRW(opt.principal)} 입금되었습니다.`);
  renderUI();
  renderFinanceUI();
}

// VC Pitching
function pitchToVC(roundId) {
  sound.init();
  const vc = state.vcRounds.find(v => v.id === roundId);
  if (!vc || vc.status === 'approved') return;

  showToast(`🎤 [IR 데모데이] VC 심사역들 앞에서 피칭 진행 중... "GPU 가동률과 유닛 이코노믹스는?"`);
  
  setTimeout(() => {
    vc.status = 'approved';
    state.money += vc.funding;
    state.totalEquityLost += vc.equityGiven;
    state.creditScore = Math.min(1000, state.creditScore + 50);
    sound.playCash();
    showToast(`🦄 [투자 유치 성공!] ${vc.name} 완료! ${formatKRW(vc.funding)} 펀딩 입금! (지분 ${vc.equityGiven}% 양도)`);
    renderUI();
    renderFinanceUI();
  }, 3500);
}

// Lease Modal
function openOfficeModal() {
  const modal = document.getElementById('office-modal');
  const container = document.getElementById('available-offices-list');

  container.innerHTML = OFFICE_PRESETS.map(preset => {
    const isAffordable = state.money >= preset.deposit;
    return `
      <div class="finance-item-card">
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <h4 style="font-size: 1rem; font-weight: 800;">${preset.name}</h4>
            <span class="text-amber font-mono" style="font-size: 0.85rem;">월세 ${formatKRW(preset.monthlyRent)}</span>
          </div>
          <p class="deal-seller-story" style="margin-top: 6px;">${preset.desc}</p>
        </div>
        <div class="spec-pills">
          <span class="spec-pill">기본 전력: ${(preset.maxPower / 1000).toFixed(1)}kW</span>
          <span class="spec-pill">최대 랙 슬롯: ${preset.slots}대</span>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
          <div>보증금: <b class="text-green font-mono">${formatKRW(preset.deposit)}</b></div>
          <button class="primary-btn" ${isAffordable ? '' : 'disabled'} onclick="leaseNewOffice('${preset.id}')">
            임대차 계약 체결
          </button>
        </div>
      </div>
    `;
  }).join('');

  modal.classList.add('show');
}

function leaseNewOffice(presetId) {
  sound.init();
  const preset = OFFICE_PRESETS.find(p => p.id === presetId);
  if (!preset) return;

  if (state.money < preset.deposit) {
    showToast('❌ 보증금이 부족합니다.');
    return;
  }

  state.money -= preset.deposit;
  state.offices.push({
    uid: state.officeUidCounter++,
    presetId: presetId,
    customName: `${preset.name} (${state.offices.length + 1}호점)`,
    gpus: [],
    extraCooling: 0,
    extraPower: 0,
    temp: 26.0,
    isTripped: false,
    tripTimer: 0,
    landlordAnger: 0
  });

  sound.playCash();
  document.getElementById('office-modal').classList.remove('show');
  showToast(`🏢 축하합니다! [${preset.name}] 임대 계약 체결 완료.`);
  renderUI();
}

// Crypto Chart Canvas Drawing
function drawCryptoChart() {
  const canvas = document.getElementById('crypto-chart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;

  ctx.clearRect(0, 0, w, h);

  const history = state.coinPriceHistory;
  if (history.length < 2) return;

  const min = Math.min(...history) * 0.98;
  const max = Math.max(...history) * 1.02;

  ctx.strokeStyle = '#06b6d4';
  ctx.lineWidth = 2.5;
  ctx.beginPath();

  for (let i = 0; i < history.length; i++) {
    const x = (i / (history.length - 1)) * (w - 20) + 10;
    const y = h - ((history[i] - min) / (max - min)) * (h - 30) - 15;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // Draw gradient under line
  ctx.lineTo(w - 10, h);
  ctx.lineTo(10, h);
  ctx.closePath();
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, 'rgba(6, 182, 212, 0.25)');
  grad.addColorStop(1, 'rgba(6, 182, 212, 0.0)');
  ctx.fillStyle = grad;
  ctx.fill();
}

function sellAllCoins() {
  sound.init();
  if (state.coinBalance <= 0.0001) {
    showToast('⚠️ 매도할 코인이 지갑에 없습니다!');
    return;
  }

  const earn = Math.floor(state.coinBalance * state.coinPrice);
  state.money += earn;
  sound.playCash();
  showToast(`📈 시장가 전액 매도 체결! ${state.coinBalance.toFixed(4)} ETH 환전 완료 (+${formatKRW(earn)})`);
  state.coinBalance = 0.0;
  renderUI();
}

// --- Main Simulation Loop ---
let lastTick = Date.now();
let newsTimer = 0;

function gameLoop() {
  const now = Date.now();
  const dt = (now - lastTick) / 1000;
  lastTick = now;

  const specs = calculateSpecsGlobalSafe();

  // Accumulate Money & Crypto
  state.money += specs.netCashPerSec * dt;
  state.coinBalance += specs.ethPerSec * dt;

  // Crypto Price Jitter (Random Walk)
  if (Math.random() < 0.2 * dt) {
    const changePct = (Math.random() * 0.04) - 0.019; // -1.9% ~ +2.1%
    state.coinPrice = Math.max(1500000, Math.floor(state.coinPrice * (1 + changePct)));
    state.coinPriceHistory.push(state.coinPrice);
    if (state.coinPriceHistory.length > 25) state.coinPriceHistory.shift();
    drawCryptoChart();
  }

  // Danggeun Refresh Timer
  state.usedRefreshTimer -= dt;
  if (state.usedRefreshTimer <= 0) {
    state.usedRefreshTimer = 18;
    refreshDanggeunDeals();
  }
  const timerEl = document.getElementById('used-refresh-timer');
  if (timerEl) timerEl.textContent = `${Math.ceil(state.usedRefreshTimer)}s`;

  // Simulate Each Office Environment (Heat, Power, Landlord)
  state.offices.forEach(office => {
    const preset = OFFICE_PRESETS.find(p => p.id === office.presetId) || OFFICE_PRESETS[0];
    const maxPower = preset.maxPower + (office.extraPower || 0);
    const coolingRate = preset.coolingRate + (office.extraCooling || 0);

    let officePower = 0;
    let officeHeatGen = 0;

    office.gpus.forEach(gpu => {
      const spec = GPU_CATALOG[gpu.model];
      if (spec && !gpu.isBroken) {
        officePower += spec.power;
        officeHeatGen += spec.heat;
      }
    });

    // Breaker trip logic
    if (!office.isTripped && officePower > maxPower) {
      if (Math.random() < 0.25 * dt) {
        office.isTripped = true;
        office.tripTimer = 8.0;
        sound.playAlarm();
        showToast(`🚨 [${office.customName}] 두꺼비집 트립! 전력 초과로 정전되었습니다!`);
      }
    }

    if (office.isTripped) {
      office.tripTimer -= dt;
      office.temp = Math.max(24.0, office.temp - 8.0 * dt);
      if (office.tripTimer <= 0) {
        office.isTripped = false;
        showToast(`🔌 [${office.customName}] 차단기를 올렸습니다. 전력 복구!`);
      }
    } else {
      // Heat balance
      const netHeat = (officeHeatGen - coolingRate) * 0.3 * dt;
      office.temp = Math.max(24.0, office.temp + netHeat);

      // Landlord anger check (only for apartments/studios)
      if (preset.landlordNotice) {
        if (officePower > 1200 || office.temp > 45) {
          office.landlordAnger = Math.min(100, (office.landlordAnger || 0) + 1.5 * dt);
          if (office.landlordAnger >= 100) {
            office.landlordAnger = 50;
            sound.playAlarm();
            showToast('🚪 쾅쾅쾅! 집주인 아줌마: "총각! 방에서 뭔 소리가 나고 계량기가 미쳤어! 당장 컴퓨터 꺼!"');
          }
        } else {
          office.landlordAnger = Math.max(0, (office.landlordAnger || 0) - 1.0 * dt);
        }
      }
    }
  });

  // Random Startup News Ticker
  newsTimer += dt;
  if (newsTimer > 20) {
    newsTimer = 0;
    const ev = KOREAN_STARTUP_EVENTS[Math.floor(Math.random() * KOREAN_STARTUP_EVENTS.length)];
    const tickerEl = document.getElementById('news-ticker');
    if (tickerEl) tickerEl.textContent = ev;
  }

  renderUI();
  requestAnimationFrame(gameLoop);
}

// --- Save & Load ---
function saveGame() {
  localStorage.setItem('GPU_STARTUP_TYCOON_KOREA', JSON.stringify(state));
  showToast('💾 게임 데이터가 브라우저에 안전하게 저장되었습니다.');
}

function loadGame() {
  const data = localStorage.getItem('GPU_STARTUP_TYCOON_KOREA');
  if (data) {
    try {
      const parsed = JSON.parse(data);
      Object.assign(state, parsed);
      showToast('📂 이전 스타트업 창업 데이터를 불러왔습니다.');
    } catch(e) {
      console.error(e);
    }
  }
}

function resetGame() {
  if (confirm('정말로 폐업 신고하고 초기 자본금으로 재창업하시겠습니까?')) {
    localStorage.removeItem('GPU_STARTUP_TYCOON_KOREA');
    state = new GameState();
    refreshDanggeunDeals();
    renderUI();
    renderNewGpus();
    renderLeaseGpus();
    renderFinanceUI();
    showToast('🔄 재창업 완료! 새로운 도전이 시작됩니다.');
  }
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 2800);
}

// --- DOM Event Listeners ---
window.addEventListener('DOMContentLoaded', () => {
  // Main Nav Tabs
  const navTabs = document.querySelectorAll('.nav-tab-btn');
  navTabs.forEach(btn => {
    btn.addEventListener('click', () => {
      navTabs.forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-page').forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const target = document.getElementById(btn.dataset.tab);
      if (target) target.classList.add('active');
    });
  });

  // Procure Subtabs
  const subTabs = document.querySelectorAll('.sub-tab-btn');
  subTabs.forEach(btn => {
    btn.addEventListener('click', () => {
      subTabs.forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.procure-content').forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const target = document.getElementById(btn.dataset.sub);
      if (target) target.classList.add('active');
    });
  });

  // Workload Sliders
  const setupSlider = (sliderId, valId, key) => {
    const slider = document.getElementById(sliderId);
    const valEl = document.getElementById(valId);
    slider.value = state.workloadAlloc[key];
    valEl.textContent = `${slider.value}%`;

    slider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      state.workloadAlloc[key] = val;
      valEl.textContent = `${val}%`;
      renderUI();
    });
  };

  setupSlider('slider-crypto', 'val-crypto', 'crypto');
  setupSlider('slider-cloud', 'val-cloud', 'cloud');
  setupSlider('slider-saas', 'val-saas', 'saas');
  setupSlider('slider-corp', 'val-corp', 'corp');

  // SaaS Marketing Button
  document.getElementById('saas-marketing-btn').addEventListener('click', () => {
    sound.init();
    const cost = 1000000;
    if (state.money >= cost) {
      state.money -= cost;
      state.saasUsers += 500;
      sound.playCash();
      showToast('📢 인스타그램/유튜브 AI 광고 집행 완료! 구독자 +500명 유입!');
      renderUI();
    } else {
      showToast('❌ 마케팅비 100만원이 부족합니다.');
    }
  });

  // Office Modal Triggers
  document.getElementById('open-lease-modal-btn').addEventListener('click', openOfficeModal);
  document.getElementById('close-office-modal').addEventListener('click', () => {
    document.getElementById('office-modal').classList.remove('show');
  });

  // Exchange Action
  document.getElementById('sell-all-coin-btn').addEventListener('click', sellAllCoins);

  // Danggeun Force Refresh
  document.getElementById('force-refresh-market-btn').addEventListener('click', () => {
    sound.init();
    if (state.money >= 50000) {
      state.money -= 50000;
      refreshDanggeunDeals();
      showToast('🥕 퀵비 5만원 지불하고 당근 꿀매물을 즉시 새로고침했습니다.');
    } else {
      showToast('❌ 잔고가 부족합니다.');
    }
  });

  // Controls
  document.getElementById('save-btn').addEventListener('click', saveGame);
  document.getElementById('reset-btn').addEventListener('click', resetGame);
  const soundBtn = document.getElementById('sound-btn');
  soundBtn.addEventListener('click', () => {
    sound.enabled = !sound.enabled;
    soundBtn.textContent = sound.enabled ? '🔊' : '🔇';
    showToast(sound.enabled ? '소리 켜짐' : '소리 꺼짐');
  });

  // Load Initial View Data
  loadGame();
  refreshDanggeunDeals();
  renderNewGpus();
  renderLeaseGpus();
  renderFinanceUI();
  drawCryptoChart();

  // Auto-save every 30s
  setInterval(saveGame, 30000);

  // Run Game Engine
  requestAnimationFrame(gameLoop);
});
