/**
 * game/js/systems/hardware.js
 * GPU 개별 스펙/발열/전력 연산, 10종 튜닝·개조 적용, 사업장 쿨링/전력 테크트리 업그레이드, 고온 마모 및 PUE 계산
 * 기준 문서: docs/design/04_hardware_tuning_techtree.md
 */
window.Systems = window.Systems || {};

(function () {
  /**
   * 하드웨어 테크니션(또는 DC 엔지니어) 재직 여부 확인
   * 보유 시: 모든 개조 성공률 +15%p, VBIOS 벽돌 복구 가능, GPU 고온 마모율 -50%
   */
  function hasHardwareTechnician() {
    const st = window.state;
    if (!st || !Array.isArray(st.employees)) return false;
    if (typeof window.getActiveHrEffects === 'function') {
      const hr = window.getActiveHrEffects();
      if (hr && (hr.hasTechnician || hr.modSuccessBonus > 0)) return true;
    }
    return st.employees.some(emp => {
      if (!emp || emp.isFake) return false;
      return (
        emp.jobId === 'hw_tech' ||
        emp.jobId === 'technician' ||
        emp.jobId === 'dc_engineer' ||
        emp.jobId === 'infra_eng'
      );
    });
  }

  /**
   * 개별 GPU의 실효 TFLOPS, 실효 소비전력(W), 발열량(heat)을 계산
   * 공식 (04_hardware_tuning_techtree.md):
   *   실효 TFLOPS = 기본TF * clockMul * (health < 30 ? 0.7 : 1.0)
   *   실효 전력   = 기본W * (clockMul * clockMul) / efficiency
   *   발열        = 실효 전력 * 0.012
   */
  function getGpuEffectiveSpecs(gpu, officeTemp) {
    const ambient = typeof officeTemp === 'number' ? officeTemp : 28.0;
    if (!gpu || gpu.isBroken || gpu.isBricked || gpu.health <= 0) {
      return {
        tflops: 0,
        power: 0,
        powerW: 0,
        heat: 0,
        effectiveTemp: ambient,
        miningMul: 0,
        resalePenalty: gpu && Array.isArray(gpu.mods) && gpu.mods.length > 0 ? 0.30 : 0
      };
    }

    const catalog = (window.GAME_DATA && window.GAME_DATA.gpus) || {};
    const baseSpec = catalog[gpu.model] || { tflops: 4, power: 120, heat: 1.5 };

    const clockMul = typeof gpu.clockMul === 'number' && gpu.clockMul > 0 ? gpu.clockMul : 1.0;
    const efficiency = typeof gpu.efficiency === 'number' && gpu.efficiency > 0 ? gpu.efficiency : 1.0;
    const health = typeof gpu.health === 'number' ? gpu.health : 100;
    const tempOffset = typeof gpu.tempOffset === 'number' ? gpu.tempOffset : 0;
    const miningMul = typeof gpu.miningMul === 'number' ? gpu.miningMul : 1.0;

    // 계약 A: 전역 Modifier는 office.js/main.js에서 총합에 1회 적용하므로 여기서는 GPU 자체 물리만 계산
    const effectiveTemp = Math.max(15, ambient + tempOffset);
    const throttled = effectiveTemp > 83;
    const throttleFactor = throttled ? Math.max(0.4, 1.0 - (effectiveTemp - 83) * 0.04) : 1.0;

    const healthFactor = health < 30 ? 0.7 : 1.0;
    const effectiveTflops = Math.max(0, baseSpec.tflops * clockMul * healthFactor * throttleFactor);
    const effectivePowerW = Math.max(10, (baseSpec.power * (clockMul * clockMul)) / efficiency);

    // 온도 강하 개조(서멀구리스, 패드, 방열판, 수랭블록) 시 발열 부하도 일부 완화
    const tempHeatFactor = tempOffset < 0 ? Math.max(0.45, 1 + tempOffset * 0.015) : (1 + tempOffset * 0.015);
    const effectiveHeat = Math.max(0.1, effectivePowerW * 0.012 * tempHeatFactor);

    return {
      tflops: Number(effectiveTflops.toFixed(2)),
      power: Number(effectivePowerW.toFixed(1)),
      powerW: Number(effectivePowerW.toFixed(1)),
      heat: Number(effectiveHeat.toFixed(3)),
      effectiveTemp: Number(effectiveTemp.toFixed(1)),
      throttled: throttled,
      miningMul: Number(miningMul.toFixed(2)),
      resalePenalty: Array.isArray(gpu.mods) && gpu.mods.length > 0 ? 0.30 : 0
    };
  }

  /**
   * 사업장 및 GPU 탐색 헬퍼
   */
  function findOfficeAndGpu(officeUid, gpuUid) {
    const st = window.state;
    if (!st || !Array.isArray(st.offices)) return { office: null, gpu: null, gpuIndex: -1 };

    let office = st.offices.find(o => o.uid === Number(officeUid) || o.presetId === officeUid);
    if (!office && gpuUid !== undefined) {
      office = st.offices.find(o => Array.isArray(o.gpus) && o.gpus.some(g => g.uid === Number(gpuUid)));
    }
    if (!office) office = st.offices[0] || null;
    if (!office || !Array.isArray(office.gpus)) return { office, gpu: null, gpuIndex: -1 };

    const targetGpuUid = gpuUid !== undefined ? Number(gpuUid) : Number(officeUid);
    const gpuIndex = office.gpus.findIndex(g => g.uid === targetGpuUid);
    const gpu = gpuIndex !== -1 ? office.gpus[gpuIndex] : null;
    return { office, gpu, gpuIndex };
  }

  /**
   * GPU 개별 튜닝 / 개조 적용
   * - 개조 즉시 무상 AS(warranty) = 0 소멸
   * - 하드웨어 테크니션 보유 시 성공률 +15%p, 벽돌 즉시 복구
   * - 수랭블록(waterblock) 장착 GPU는 오버클럭 성공률 +20%p
   * - 수랭블록 누수(10%) 시 인접 GPU 최대 2대 동반 피해
   * - 리볼링(reball) 성공 시 고장 GPU 부활(health 60), 실패 시 영구 사망(permDead)
   */
  function applyGpuMod(officeUid, gpuUid, modId) {
    const st = window.state;
    if (!st) return { ok: false, message: '게임 상태가 초기화되지 않았습니다.' };

    const { office, gpu, gpuIndex } = findOfficeAndGpu(officeUid, gpuUid);
    if (!office || !gpu) {
      return { ok: false, message: '대상 GPU를 찾을 수 없습니다.' };
    }

    const modsCatalog = (window.GAME_DATA && window.GAME_DATA.gpuMods) || [];
    const mod = modsCatalog.find(m => m.id === modId);
    if (!mod) {
      return { ok: false, message: '존재하지 않는 튜닝/개조 작업입니다.' };
    }

    gpu.mods = Array.isArray(gpu.mods) ? gpu.mods : [];

    // 영구 사망 GPU 체크
    if (gpu.permDead) {
      const msg = '기판이 완전히 소손되어 리볼링으로도 복구할 수 없는 GPU입니다.';
      if (typeof window.showToast === 'function') window.showToast(`❌ ${msg}`);
      return { ok: false, message: msg };
    }

    // 리볼링은 고장난 GPU 전용 (또는 내구도 40 이하 중증 손상 GPU)
    if (mod.id === 'reball') {
      if (!gpu.isBroken && !gpu.isBricked && gpu.health > 50) {
        const msg = '리볼링은 고장났거나 내구도가 심각하게 저하된(50 이하) GPU에만 시술할 수 있습니다.';
        if (typeof window.showToast === 'function') window.showToast(`⚠️ ${msg}`);
        return { ok: false, message: msg };
      }
    } else {
      // 일반 개조는 고장 상태가 아닐 때만 가능
      if (gpu.isBroken || gpu.isBricked || gpu.health <= 0) {
        const msg = '고장난 GPU입니다. 먼저 리볼링(🔁) 외주 수리로 부활시켜야 합니다.';
        if (typeof window.showToast === 'function') window.showToast(`⚠️ ${msg}`);
        return { ok: false, message: msg };
      }
      // 동일 부품 개조 중복 방지
      const repeatableMods = ['overclock', 'paste', 'reball'];
      if (!repeatableMods.includes(mod.id) && gpu.mods.includes(mod.id)) {
        const msg = `이미 [${mod.name}] 개조가 적용된 GPU입니다.`;
        if (typeof window.showToast === 'function') window.showToast(`⚠️ ${msg}`);
        return { ok: false, message: msg };
      }
    }

    // 비용 확인 및 차감
    const cost = Number(mod.cost || 0);
    if (st.money < cost) {
      const msg = `튜닝 비용이 부족합니다. (필요: ${typeof window.formatKRW === 'function' ? window.formatKRW(cost) : cost + '원'})`;
      if (typeof window.showToast === 'function') window.showToast(`💸 ${msg}`);
      return { ok: false, message: msg };
    }
    st.money -= cost;

    // 개조 시 신품 무상 AS 즉시 소멸
    gpu.warranty = 0;

    // 성공률 계산
    const hasTech = hasHardwareTechnician();
    let finalSuccessRate = typeof mod.successRate === 'number' ? mod.successRate : 0.75;
    if (hasTech) finalSuccessRate += 0.15;
    if (mod.id === 'overclock' && typeof gpu.ocBonus === 'number') {
      finalSuccessRate += gpu.ocBonus;
    }
    finalSuccessRate = Math.max(0.05, Math.min(0.99, finalSuccessRate));

    const roll = Math.random();
    const isSuccess = roll < finalSuccessRate;
    let resultMessage = '';

    if (isSuccess) {
      const on = mod.onSuccess || mod.on || {};
      if (!gpu.mods.includes(mod.id)) {
        gpu.mods.push(mod.id);
      }

      const oldClock = typeof gpu.clockMul === 'number' ? gpu.clockMul : 1.0;
      const oldEff = typeof gpu.efficiency === 'number' ? gpu.efficiency : 1.0;

      // 연산력(clockMul) 및 전력(efficiency) 동시 보정
      if (typeof on.tflops === 'number' || typeof on.power === 'number') {
        const tfDelta = typeof on.tflops === 'number' ? on.tflops : 0;
        const pwDelta = typeof on.power === 'number' ? on.power : 0;
        const newClock = Number((oldClock * (1 + tfDelta)).toFixed(4));
        gpu.clockMul = newClock;

        // 실효 전력 = 기본W * clockMul^2 / efficiency 공식을 유지하면서 목표 전력 증감률(pwDelta) 달성
        const clockRatioSq = Math.pow(newClock / oldClock, 2);
        const targetPowerRatio = Math.max(0.3, 1 + pwDelta);
        gpu.efficiency = Number(((oldEff * clockRatioSq) / targetPowerRatio).toFixed(4));
      }

      if (typeof on.temp === 'number') {
        gpu.tempOffset = Number(((gpu.tempOffset || 0) + on.temp).toFixed(1));
      }
      if (typeof on.wear === 'number') {
        gpu.wearMul = Math.max(0.20, Number(((gpu.wearMul || 1.0) * (1 + on.wear)).toFixed(3)));
      }
      if (on.clearMiningNoise) {
        gpu.isMining = false;
      }
      if (typeof on.mining === 'number') {
        gpu.miningMul = Number(((gpu.miningMul || 1.0) * (1 + on.mining)).toFixed(3));
      }
      if (typeof on.ocBonus === 'number') {
        gpu.ocBonus = Number(((gpu.ocBonus || 0) + on.ocBonus).toFixed(2));
      }
      if (typeof on.revive === 'number') {
        gpu.isBroken = false;
        gpu.isBricked = false;
        gpu.health = on.revive;
      }

      gpu.instability = false;
      resultMessage = `✅ [${mod.name}] 튜닝 성공! (${mod.desc.split('(')[0].trim()})`;
      if (window.SoundFX && typeof window.SoundFX.success === 'function') window.SoundFX.success();
    } else {
      const fail = mod.onFail || mod.fail || {};
      const details = [];

      if (typeof fail.health === 'number') {
        gpu.health = Math.max(0, Number(((gpu.health || 100) + fail.health).toFixed(1)));
        details.push(`내구도 ${fail.health}`);
      }
      if (typeof fail.temp === 'number') {
        gpu.tempOffset = Number(((gpu.tempOffset || 0) + fail.temp).toFixed(1));
        details.push(`온도 +${fail.temp}°C 상승`);
      }
      if (fail.instability) {
        gpu.instability = true;
        gpu.clockMul = Math.max(0.80, Number(((gpu.clockMul || 1.0) * 0.94).toFixed(3)));
        details.push('클럭 불안정으로 연산력 저하');
      }

      // 쇼트/영구 고장 판정 (구리 방열판 쇼트 5%, 리볼링 실패 100%)
      if (typeof fail.dead === 'number' && Math.random() < fail.dead) {
        gpu.health = 0;
        gpu.isBroken = true;
        if (fail.permDead) {
          gpu.permDead = true;
          details.push('기판 영구 사망(복구 불가)');
        } else {
          details.push('기판 쇼트로 GPU 고장!');
        }
      }

      // VBIOS 벽돌화 25% 판정
      if (typeof fail.brick === 'number' && Math.random() < fail.brick) {
        if (hasTech) {
          gpu.health = Math.max(10, (gpu.health || 50) - 5);
          details.push('롬플래싱 벽돌 발생 → 하드웨어 테크니션이 듀얼 바이오스로 즉시 복구!');
        } else {
          gpu.health = 0;
          gpu.isBricked = true;
          gpu.isBroken = true;
          details.push('VBIOS 벽돌화! (테크니션 채용 또는 리볼링 필요)');
        }
      }

      // 수랭 블록 누수 10% → 인접 GPU 2대 동반 피해
      if (typeof fail.leak === 'number' && Math.random() < fail.leak) {
        gpu.health = Math.max(0, (gpu.health || 50) - 35);
        if (gpu.health <= 0) gpu.isBroken = true;

        const neighbors = [];
        if (gpuIndex > 0 && office.gpus[gpuIndex - 1]) neighbors.push(office.gpus[gpuIndex - 1]);
        if (gpuIndex + 1 < office.gpus.length && office.gpus[gpuIndex + 1]) neighbors.push(office.gpus[gpuIndex + 1]);
        if (neighbors.length < 2 && gpuIndex + 2 < office.gpus.length && office.gpus[gpuIndex + 2]) {
          neighbors.push(office.gpus[gpuIndex + 2]);
        }

        let damagedCount = 0;
        neighbors.slice(0, 2).forEach(adj => {
          adj.health = Math.max(0, (adj.health || 100) - 40);
          if (adj.health <= 0) adj.isBroken = true;
          damagedCount++;
        });
        details.push(`냉각수 누수 발생! 인접 GPU ${damagedCount}대 침수 피해`);
      }

      if (gpu.health <= 0) {
        gpu.health = 0;
        gpu.isBroken = true;
      }

      resultMessage = `❌ [${mod.name}] 실패: ${details.length > 0 ? details.join(', ') : '튜닝 적용 불발'}`;
      if (window.SoundFX && typeof window.SoundFX.error === 'function') window.SoundFX.error();
    }

    if (typeof window.showToast === 'function') window.showToast(resultMessage);
    if (typeof window.addLog === 'function') window.addLog(resultMessage);
    if (typeof window.renderAll === 'function') window.renderAll();

    return {
      ok: true,
      success: isSuccess,
      mod,
      gpu,
      office,
      message: resultMessage
    };
  }

  /**
   * 하드웨어 테크니션을 통한 벽돌(VBIOS) GPU 무상 복구
   */
  function recoverBrickedGpu(officeUid, gpuUid) {
    const { office, gpu } = findOfficeAndGpu(officeUid, gpuUid);
    if (!office || !gpu) return { ok: false, message: '대상 GPU를 찾을 수 없습니다.' };
    if (!gpu.isBricked) return { ok: false, message: 'VBIOS 벽돌 상태인 GPU가 아닙니다.' };
    if (!hasHardwareTechnician()) {
      return { ok: false, message: '하드웨어 테크니션 직원이 재직 중이어야 ROM 라이터로 벽돌을 복구할 수 있습니다.' };
    }
    gpu.isBricked = false;
    gpu.isBroken = false;
    gpu.health = Math.max(50, gpu.health || 50);
    const msg = '🔧 하드웨어 테크니션이 CH341A 롬라이터로 벽돌 GPU를 성공적으로 복구했습니다!';
    if (typeof window.showToast === 'function') window.showToast(msg);
    return { ok: true, gpu, message: msg };
  }

  /**
   * 사업장 현재 쿨링 설비 스펙 조회 (계절 연동 및 효율 보너스 포함)
   */
  function getOfficeCoolingSpec(office) {
    const coolingList = (window.GAME_DATA && window.GAME_DATA.coolingTech) || [];
    const tierId = (office && office.coolingTier) || 'T1';
    const tier = coolingList.find(t => t.id === tierId) || coolingList[0] || {
      id: 'T1',
      tierNum: 1,
      name: 'T1 창문+선풍기',
      coolRate: 3,
      efficiencyBonus: 0,
      winterCoolRate: 4,
      summerCoolRate: 2,
      powerW: 50
    };

    const calMonth = (window.state && window.state.calendarMonth) || 3;
    const isWinter = calMonth === 12 || calMonth === 1 || calMonth === 2;
    const isSummer = calMonth === 7 || calMonth === 8;

    let baseCool = tier.coolRate;
    if (isWinter && typeof tier.winterCoolRate === 'number') {
      baseCool = tier.winterCoolRate;
    } else if (isSummer && typeof tier.summerCoolRate === 'number') {
      baseCool = tier.summerCoolRate;
    }

    // 계절 외기냉방 보정 (T5b는 이미 winterCoolRate/summerCoolRate가 반영되어 있으므로 일반 티어만 약하게 보정)
    if (tier.id !== 'T5b' && typeof window.getSeasonInfo === 'function') {
      const season = window.getSeasonInfo(calMonth);
      if (season && season.id === 'winter') baseCool *= 1.15;
      if (season && season.id === 'summer') baseCool *= 0.90;
    }

    const effMultiplier = 1 + (tier.efficiencyBonus || 0);
    const extraCool = (office && typeof office.extraCooling === 'number') ? office.extraCooling : 0;
    const totalCoolRate = Number(((baseCool * effMultiplier) + extraCool).toFixed(2));

    return {
      tier,
      coolRate: totalCoolRate,
      powerW: tier.powerW || 0,
      efficiencyBonus: tier.efficiencyBonus || 0
    };
  }

  /**
   * 사업장 총 가용 전력 용량(W) 계산
   */
  function getOfficeMaxPower(office) {
    if (!office) return 3000;
    const powerList = (window.GAME_DATA && window.GAME_DATA.powerTech) || [];
    const pTier = powerList.find(p => p.id === office.powerTier && p.type === 'main');
    const baseCap = pTier ? pTier.capacityW : (office.maxPower || 3000);
    const extraCap = typeof office.extraPower === 'number' ? office.extraPower : 0;
    return baseCap + extraCap;
  }

  /**
   * 사업장 PUE (전력효율지수) 계산
   * 공식: PUE = (itPowerW + coolingPowerW) / Math.max(100, itPowerW)
   * PUE <= 1.2 달성 시 그린 데이터센터 인증 플래그(state.flags.greenDcCertified) 해금
   */
  function calculateOfficePUE(office) {
    if (!office) return 1.45;
    const gpus = Array.isArray(office.gpus) ? office.gpus : [];

    let itPowerW = 0;
    if (!office.isTripped) {
      gpus.forEach(gpu => {
        const specs = getGpuEffectiveSpecs(gpu, office.temp);
        itPowerW += specs.powerW;
      });
    }

    const coolSpec = getOfficeCoolingSpec(office);
    const tier = coolSpec.tier;
    const rawCoolingW = coolSpec.powerW;

    // 인버터 및 상위 냉각 설비는 IT 부하에 비례하여 펌프/컴프레서 전력을 모듈레이션함
    let coolingPowerW = rawCoolingW;
    if (itPowerW > 0) {
      const tierNum = tier.tierNum || 1;
      const targetOverheadRatio = Math.max(0.07, 0.46 - tierNum * 0.038);
      coolingPowerW = Math.min(rawCoolingW, Math.max(25, itPowerW * targetOverheadRatio));
    } else {
      coolingPowerW = Math.min(rawCoolingW, 45);
    }

    // 겨울철 외기냉방(T5b) 또는 소양강 수랭(T_SOYANG) 가동 시 냉각 전력 추가 절감
    const calMonth = (window.state && window.state.calendarMonth) || 3;
    if ((calMonth === 12 || calMonth === 1 || calMonth === 2) && (tier.id === 'T5b' || tier.id === 'T_SOYANG')) {
      coolingPowerW *= 0.65;
    }

    let pue = (itPowerW + coolingPowerW) / Math.max(100, itPowerW);
    if (office.hasSolar) {
      pue -= 0.03;
    }

    pue = Number(Math.max(1.05, Math.min(2.50, pue)).toFixed(2));
    office.pue = pue;

    // 그린 데이터센터 인증 체크 (PUE <= 1.20)
    if (window.state && window.state.flags && itPowerW >= 100 && pue <= 1.20) {
      if (!window.state.flags.greenDcCertified) {
        window.state.flags.greenDcCertified = true;
        if (typeof window.showToast === 'function') {
          window.showToast('🌱 [그린 데이터센터 인증 획득] PUE 1.2 이하 달성! 전기요금 10% 감면 및 ESG 투자 해금');
        }
      }
    }

    return pue;
  }

  /**
   * 사업장 쿨링 테크트리 업그레이드 (T1 ~ T_SOYANG)
   */
  function upgradeOfficeCoolingTier(officeUid, tierId) {
    const st = window.state;
    if (!st || !Array.isArray(st.offices)) return { ok: false, message: '게임 상태 오류' };

    // 인자가 1개(tierId만 전달)인 경우 첫 번째 사업장 대상
    let targetOfficeUid = officeUid;
    let targetTierId = tierId;
    if (tierId === undefined && typeof officeUid === 'string') {
      targetTierId = officeUid;
      targetOfficeUid = st.offices[0] ? st.offices[0].uid : 1;
    }

    const office = st.offices.find(o => o.uid === Number(targetOfficeUid) || o.presetId === targetOfficeUid) || st.offices[0];
    if (!office) return { ok: false, message: '대상 사업장을 찾을 수 없습니다.' };

    const coolingList = (window.GAME_DATA && window.GAME_DATA.coolingTech) || [];
    const tier = coolingList.find(t => t.id === targetTierId);
    if (!tier) return { ok: false, message: '존재하지 않는 쿨링 티어입니다.' };

    if (office.coolingTier === tier.id) {
      const msg = `이미 [${tier.name}] 설비가 설치되어 있습니다.`;
      if (typeof window.showToast === 'function') window.showToast(`⚠️ ${msg}`);
      return { ok: false, message: msg };
    }

    // 소양강 냉수 냉각(T_SOYANG) 등 사업장 제한 검증
    if (tier.id === 'T_SOYANG' && office.presetId !== 'chuncheon_dc') {
      const msg = '소양강 심층 냉수 냉각(★)은 춘천 하이퍼스케일 DC 전용 설비입니다.';
      if (typeof window.showToast === 'function') window.showToast(`🚫 ${msg}`);
      return { ok: false, message: msg };
    }

    if (Array.isArray(tier.reqOffice) && !tier.reqOffice.includes(office.presetId)) {
      const msg = `[${tier.name}] 설비는 현재 사업장(${office.customName || office.presetId}) 규모에 설치할 수 없습니다.`;
      if (typeof window.showToast === 'function') window.showToast(`🚫 ${msg}`);
      return { ok: false, message: msg };
    }

    // 원룸에서 T3 벽걸이 에어컨 타공 시 집주인 눈치 소폭 상승
    if (office.presetId === 'room_sinrim' && tier.id === 'T3') {
      office.landlordAnger = Math.min(95, (office.landlordAnger || 0) + 10);
    }

    if (st.money < tier.cost) {
      const msg = `쿨링 설비 자금이 부족합니다. (필요: ${typeof window.formatKRW === 'function' ? window.formatKRW(tier.cost) : tier.cost + '원'})`;
      if (typeof window.showToast === 'function') window.showToast(`💸 ${msg}`);
      return { ok: false, message: msg };
    }

    st.money -= tier.cost;
    office.coolingTier = tier.id;
    const newPue = calculateOfficePUE(office);

    // 전체 평균 PUE 갱신
    const avgPue = st.offices.reduce((acc, o) => acc + calculateOfficePUE(o), 0) / st.offices.length;
    st.pue = Number(avgPue.toFixed(2));

    const msg = `❄️ [${tier.name}] 설치 완료! (냉각력 ${tier.coolRate}, 현재 PUE ${newPue})`;
    if (window.SoundFX && typeof window.SoundFX.buy === 'function') window.SoundFX.buy();
    if (typeof window.showToast === 'function') window.showToast(msg);
    if (typeof window.addLog === 'function') window.addLog(msg);
    if (typeof window.renderAll === 'function') window.renderAll();

    return { ok: true, tier, office, pue: newPue, message: msg };
  }

  /**
   * 사업장 전력 인프라 업그레이드 (P1~P6 및 보조설비 ups, solar, diesel)
   */
  function upgradeOfficePowerTier(officeUid, powerId) {
    const st = window.state;
    if (!st || !Array.isArray(st.offices)) return { ok: false, message: '게임 상태 오류' };

    let targetOfficeUid = officeUid;
    let targetPowerId = powerId;
    if (powerId === undefined && typeof officeUid === 'string') {
      targetPowerId = officeUid;
      targetOfficeUid = st.offices[0] ? st.offices[0].uid : 1;
    }

    const office = st.offices.find(o => o.uid === Number(targetOfficeUid) || o.presetId === targetOfficeUid) || st.offices[0];
    if (!office) return { ok: false, message: '대상 사업장을 찾을 수 없습니다.' };

    const powerList = (window.GAME_DATA && window.GAME_DATA.powerTech) || [];
    const pTech = powerList.find(p => p.id === targetPowerId);
    if (!pTech) return { ok: false, message: '존재하지 않는 전력 설비입니다.' };

    if (st.money < pTech.cost) {
      const msg = `전력 증설 비용이 부족합니다. (필요: ${typeof window.formatKRW === 'function' ? window.formatKRW(pTech.cost) : pTech.cost + '원'})`;
      if (typeof window.showToast === 'function') window.showToast(`💸 ${msg}`);
      return { ok: false, message: msg };
    }

    if (pTech.type === 'aux' || ['ups', 'solar', 'diesel'].includes(pTech.id)) {
      if (pTech.id === 'solar' && office.hasSolar) {
        const msg = '이미 옥상 태양광 발전 설비가 설치되어 있습니다.';
        if (typeof window.showToast === 'function') window.showToast(`⚠️ ${msg}`);
        return { ok: false, message: msg };
      }
      if (pTech.id === 'diesel' && office.hasDieselGen) {
        const msg = '이미 비상용 디젤 발전기가 설치되어 있습니다.';
        if (typeof window.showToast === 'function') window.showToast(`⚠️ ${msg}`);
        return { ok: false, message: msg };
      }

      st.money -= pTech.cost;
      office.extraPower = (office.extraPower || 0) + (pTech.capacityW || 0);

      if (pTech.id === 'ups') {
        office.upsCount = (office.upsCount || 0) + 1;
      } else if (pTech.id === 'solar') {
        office.hasSolar = true;
      } else if (pTech.id === 'diesel') {
        office.hasDieselGen = true;
      }
    } else {
      if (office.powerTier === pTech.id) {
        const msg = `이미 [${pTech.name}] 전력망을 사용 중입니다.`;
        if (typeof window.showToast === 'function') window.showToast(`⚠️ ${msg}`);
        return { ok: false, message: msg };
      }
      // 원룸에는 특고압(P4 이상) 설치 불가
      if (office.presetId === 'room_sinrim' && pTech.tierNum >= 4) {
        const msg = '신림동 원룸 건물에는 고압 수전 설비(P4 이상)를 들일 수 없습니다. 지식산업센터나 IDC로 확장하세요!';
        if (typeof window.showToast === 'function') window.showToast(`🚫 ${msg}`);
        return { ok: false, message: msg };
      }

      st.money -= pTech.cost;
      office.powerTier = pTech.id;
      office.maxPower = pTech.capacityW;
    }

    // 차단기 트립 상태 해제
    if (office.isTripped) {
      office.isTripped = false;
      office.tripTimer = 0;
    }

    calculateOfficePUE(office);
    const totalCapKW = (getOfficeMaxPower(office) / 1000).toFixed(1);
    const msg = `⚡ [${pTech.name}] 증설 완료! (총 가용 전력: ${totalCapKW}kW)`;

    if (window.SoundFX && typeof window.SoundFX.buy === 'function') window.SoundFX.buy();
    if (typeof window.showToast === 'function') window.showToast(msg);
    if (typeof window.addLog === 'function') window.addLog(msg);
    if (typeof window.renderAll === 'function') window.renderAll();

    return { ok: true, powerTech: pTech, office, maxPowerW: getOfficeMaxPower(office), message: msg };
  }

  /**
   * 실시간 고온 GPU 내구도 마모 (tickHardwareWear)
   * 공식 (04_hardware_tuning_techtree.md):
   *   health 감소 = (온도 - 65)+ * 0.02 * dt * (isMining ? 1.5 : 1.0) * wearMul
   *   하드웨어 테크니션 보유 시 마모/고장률 -50%
   *   health <= 0 도달 시 gpu.isBroken = true
   */
  function tickHardwareWear(dt) {
    const st = window.state;
    if (!st || !Array.isArray(st.offices) || dt <= 0) return;

    const hasTech = hasHardwareTechnician();
    let hrFailMul = hasTech ? 0.5 : 1.0;
    if (typeof window.getActiveHrEffects === 'function') {
      const hr = window.getActiveHrEffects();
      if (hr && typeof hr.gpuFailRateMul === 'number') {
        hrFailMul = Math.min(hrFailMul, hr.gpuFailRateMul);
      }
    }

    st.offices.forEach(office => {
      if (!office || !Array.isArray(office.gpus) || office.isTripped || office.thermalShutdown) return;

      const officeTemp = typeof office.temp === 'number' ? office.temp : 28.0;
      office.gpus.forEach(gpu => {
        if (!gpu || gpu.isBroken || gpu.isBricked) return;
        if (gpu.health <= 0) {
          gpu.health = 0;
          gpu.isBroken = true;
          return;
        }

        // 개별 GPU 온도 = 사업장 실내 온도 + 개별 온도 튜닝 오프셋(서멀/패드/수랭 등)
        const effectiveGpuTemp = Math.max(officeTemp > 80 ? officeTemp + (gpu.tempOffset || 0) : 0, officeTemp + (gpu.tempOffset || 0));
        const refTemp = Math.max(officeTemp, effectiveGpuTemp);

        const miningMul = gpu.isMining ? 1.5 : 1.0;
        const wearMul = typeof gpu.wearMul === 'number' ? gpu.wearMul : 1.0;
        let wearLoss = 0;

        // 계약 B: 80도 초과 시에만 고온 마모 진행
        if (refTemp > 80) {
          const tempAbove80 = Math.max(0, effectiveGpuTemp > 80 ? effectiveGpuTemp - 80 : (officeTemp - 80) * 0.5);
          if (tempAbove80 > 0) {
            wearLoss += tempAbove80 * 0.01 * dt * miningMul * wearMul * hrFailMul;
          }
        }

        // 채굴 에디션은 상시 미세 마모 (자연 노화)
        if (gpu.isMining) {
          wearLoss += 0.0005 * dt * wearMul * hrFailMul;
        }

        if (wearLoss > 0) {
          gpu.health = Math.max(0, Number((gpu.health - wearLoss).toFixed(3)));
          if (gpu.health < 30 && !gpu._warnedLowHealth) {
            gpu._warnedLowHealth = true;
            const catalog = (window.GAME_DATA && window.GAME_DATA.gpus) || {};
            const modelName = (catalog[gpu.model] && catalog[gpu.model].name) || gpu.model;
            const warnMsg = `⚠️ [${modelName} #${gpu.uid}] 내구도가 30% 미만으로 떨어졌습니다! 성능이 30% 저하됩니다.`;
            if (typeof window.showToast === 'function') window.showToast(warnMsg);
            if (typeof window.addLog === 'function') window.addLog(warnMsg);
          }

          if (gpu.health <= 0) {
            gpu.health = 0;
            gpu.isBroken = true;
            const catalog = (window.GAME_DATA && window.GAME_DATA.gpus) || {};
            const modelName = (catalog[gpu.model] && catalog[gpu.model].name) || gpu.model;
            const msg = `🔥 고온 가동으로 [${modelName} #${gpu.uid}] 내구도가 소진되어 고장났습니다!`;
            if (typeof window.showToast === 'function') window.showToast(msg);
            if (typeof window.addLog === 'function') window.addLog(msg);
          }
        }
      });

      calculateOfficePUE(office);
    });
  }

  const hardwareSystem = {
    hasHardwareTechnician,
    getGpuEffectiveSpecs,
    applyGpuMod,
    recoverBrickedGpu,
    getOfficeCoolingSpec,
    getOfficeMaxPower,
    calculateOfficePUE,
    upgradeOfficeCoolingTier,
    upgradeOfficePowerTier,
    tickHardwareWear
  };

  window.Systems.hardware = hardwareSystem;
  window.hasHardwareTechnician = hasHardwareTechnician;
  window.getGpuEffectiveSpecs = getGpuEffectiveSpecs;
  window.applyGpuMod = applyGpuMod;
  window.recoverBrickedGpu = recoverBrickedGpu;
  window.getOfficeCoolingSpec = getOfficeCoolingSpec;
  window.getOfficeMaxPower = getOfficeMaxPower;
  window.calculateOfficePUE = calculateOfficePUE;
  window.upgradeOfficeCoolingTier = upgradeOfficeCoolingTier;
  window.upgradeOfficePowerTier = upgradeOfficePowerTier;
  window.tickHardwareWear = tickHardwareWear;
})();
