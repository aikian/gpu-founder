/**
 * game/js/systems/events.js
 * 랜덤 딜레마 이벤트 평가, 트리거, 선택지 결과 반영 및 특수 훅 처리 시스템
 * AGENTS.md 및 docs/CONVENTIONS.md 준수 (순수 Vanilla JS, 전역 네임스페이스)
 */

window.Systems = window.Systems || {};

(function () {
  let _activeEvent = null;
  let _prevSpeedBeforeModal = 1;
  let _qteTimerInterval = null;
  let _qteTimeRemaining = 0;
  let _qteTotalTime = 8;

  /**
   * QTE 카운트다운 타이머 정지 및 관련 UI 정리
   */
  function clearQteTimer() {
    if (_qteTimerInterval) {
      clearInterval(_qteTimerInterval);
      _qteTimerInterval = null;
    }
    _qteTimeRemaining = 0;
    if (typeof document !== 'undefined') {
      const qteEl = document.getElementById('qte-active-bar-wrap');
      if (qteEl) qteEl.remove();
    }
  }

  /**
   * 긴급 위기 8초 QTE 타이머 가동 및 모달 내 카운트다운 게이지 주입
   * @param {Object} ev
   */
  function startQteCountdown(ev) {
    clearQteTimer();
    _qteTotalTime = (typeof ev.timeoutSeconds === 'number' && ev.timeoutSeconds > 0) ? ev.timeoutSeconds : 8;
    _qteTimeRemaining = _qteTotalTime;

    if (typeof document === 'undefined') return;

    const modalBody = document.getElementById('event-modal-body') || document.querySelector('.event-modal-body');
    if (!modalBody) return;

    const qteEl = document.createElement('div');
    qteEl.id = 'qte-active-bar-wrap';
    qteEl.style.cssText = `
      background: linear-gradient(135deg, rgba(220, 38, 38, 0.25) 0%, rgba(153, 27, 27, 0.45) 100%);
      border: 2px solid #ef4444;
      border-radius: 8px;
      padding: 10px 14px;
      margin-bottom: 14px;
      box-shadow: 0 0 16px rgba(239, 68, 68, 0.4);
    `;

    qteEl.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 6px;">
        <span style="font-weight:900; font-size:0.95rem; color:#fca5a5; display:flex; align-items:center; gap:6px;">
          <span style="font-size:1.15rem;">🚨</span>
          <span>[긴급 위기 QTE 대응] 8초 내 올바른 조치를 결정하십시오!</span>
        </span>
        <span id="qte-countdown-badge" style="font-family:monospace; font-size:1.25rem; font-weight:900; color:#fff; background:#dc2626; padding:2px 8px; border-radius:6px; min-width:62px; text-align:center;">
          ${_qteTimeRemaining.toFixed(1)}s
        </span>
      </div>
      <div style="width: 100%; height: 9px; background: rgba(0,0,0,0.5); border-radius: 4px; overflow: hidden; border: 1px solid rgba(239, 68, 68, 0.4);">
        <div id="qte-countdown-bar" style="width: 100%; height: 100%; background: linear-gradient(90deg, #22c55e 0%, #eab308 60%, #ef4444 100%); transition: width 0.1s linear;"></div>
      </div>
    `;

    modalBody.insertBefore(qteEl, modalBody.firstChild);

    // 타임아웃 선택지 버튼 스타일 차별화 (경고 테두리 적용)
    if (typeof ev.timeoutChoiceIdx === 'number') {
      const choiceButtons = modalBody.querySelectorAll('.event-choice-btn');
      if (choiceButtons && choiceButtons[ev.timeoutChoiceIdx]) {
        const timeoutBtn = choiceButtons[ev.timeoutChoiceIdx];
        timeoutBtn.style.border = '1px dashed #ef4444';
        timeoutBtn.style.background = 'rgba(239, 68, 68, 0.12)';
        timeoutBtn.style.opacity = '0.85';
      }
    }

    const stepMs = 100;
    _qteTimerInterval = setInterval(() => {
      _qteTimeRemaining = Math.max(0, _qteTimeRemaining - (stepMs / 1000));

      const badgeEl = document.getElementById('qte-countdown-badge');
      const barEl = document.getElementById('qte-countdown-bar');

      if (badgeEl) {
        badgeEl.textContent = `${_qteTimeRemaining.toFixed(1)}s`;
        if (_qteTimeRemaining <= 3.0) {
          badgeEl.style.background = '#991b1b';
          badgeEl.style.color = '#fee2e2';
        }
      }

      if (barEl) {
        const pct = Math.max(0, (_qteTimeRemaining / _qteTotalTime) * 100);
        barEl.style.width = `${pct}%`;
        if (pct < 35) {
          barEl.style.background = '#ef4444';
        }
      }

      // 사운드 틱 (남은 3초 이하 긴박한 비프음)
      if (_qteTimeRemaining <= 3.0 && _qteTimeRemaining > 0 && window.sound && typeof window.sound.playBeep === 'function') {
        if (Math.round(_qteTimeRemaining * 10) % 5 === 0) {
          window.sound.playBeep(880, 0.04, 'sawtooth');
        }
      }

      // 타임아웃 도달
      if (_qteTimeRemaining <= 0.001) {
        handleQteTimeout(ev);
      }
    }, stepMs);
  }

  /**
   * 8초 타임아웃 만료 시 강제 파멸 선택지 집행
   * @param {Object} ev
   */
  function handleQteTimeout(ev) {
    clearQteTimer();
    const targetEv = ev || _activeEvent;
    if (!targetEv) return;

    const timeoutIdx = (typeof targetEv.timeoutChoiceIdx === 'number')
      ? targetEv.timeoutChoiceIdx
      : (targetEv.choices.length - 1);

    if (window.sound && typeof window.sound.playAlarm === 'function') {
      window.sound.playAlarm();
    }

    if (typeof window.showToast === 'function') {
      window.showToast('⏱️ [시간 초과!] 제한시간 8초가 지나 긴급 재난이 발생했습니다!');
    }

    if (typeof window.handleSelectEventChoice === 'function') {
      window.handleSelectEventChoice(targetEv.id, timeoutIdx);
    } else {
      resolveEventChoice(targetEv.id, timeoutIdx);
    }
  }

  /**
   * 1. 조건식 문자열 또는 함수를 window.state 기준으로 안전하게 평가
   * @param {string|function|boolean} reqStr
   * @returns {boolean}
   */
  function evaluateRequirement(reqStr) {
    if (!reqStr) return true;
    const state = window.state;
    if (!state) return false;

    if (typeof reqStr === 'function') {
      try {
        return Boolean(reqStr(state));
      } catch (e) {
        return false;
      }
    }

    if (typeof reqStr !== 'string') {
      return Boolean(reqStr);
    }

    const trimmed = reqStr.trim();
    if (!trimmed || trimmed === 'true') return true;
    if (trimmed === 'false') return false;

    try {
      // CONVENTIONS.md: require 표현식이 "state.flags.hasGrant" 또는 "flags.hasGrant" 형태 모두 동작하도록 지원
      const fn = new Function(
        'state',
        'flags',
        'employees',
        'offices',
        'workloadAlloc',
        'loans',
        `"use strict"; return Boolean(${trimmed});`
      );
      return Boolean(
        fn(
          state,
          state.flags || {},
          state.employees || [],
          state.offices || [],
          state.workloadAlloc || {},
          state.loans || []
        )
      );
    } catch (err) {
      return false;
    }
  }

  /**
   * 특수 효과 훅(special) 안전 실행
   */
  function executeSpecialEffect(specialKey) {
    const state = window.state;
    if (!state || !specialKey) return;

    switch (specialKey) {
      case 'mna_exit': {
        state.flags.acceptedMnA = true;
        if (window.Systems && window.Systems.endings && typeof window.Systems.endings.checkEndings === 'function') {
          window.Systems.endings.checkEndings();
        } else if (typeof window.triggerEnding === 'function') {
          window.triggerEnding('G3');
        }
        break;
      }

      case 'increase_sinrim_rent': {
        if (window.GAME_DATA && Array.isArray(window.GAME_DATA.offices)) {
          const sinrimPreset = window.GAME_DATA.offices.find(o => o.id === 'room_sinrim');
          if (sinrimPreset) {
            sinrimPreset.monthlyRent = (sinrimPreset.monthlyRent || 450000) + 200000;
          }
        }
        if (Array.isArray(state.offices)) {
          const sinrimOffice = state.offices.find(o => o.presetId === 'room_sinrim');
          if (sinrimOffice) {
            sinrimOffice.extraRent = (sinrimOffice.extraRent || 0) + 200000;
            sinrimOffice.landlordAnger = 0;
          }
        }
        break;
      }

      case 'force_move_guro': {
        if (Array.isArray(state.offices)) {
          const sinrimIdx = state.offices.findIndex(o => o.presetId === 'room_sinrim');
          if (sinrimIdx !== -1) {
            const oldOffice = state.offices[sinrimIdx];
            oldOffice.presetId = 'guro_jisan';
            oldOffice.customName = '구로디지털단지 지식산업센터 402호';
            oldOffice.coolingTier = oldOffice.coolingTier === 'T1' ? 'T2' : oldOffice.coolingTier;
            oldOffice.powerTier = oldOffice.powerTier === 'P1' ? 'P2' : oldOffice.powerTier;
            oldOffice.isTripped = false;
            oldOffice.landlordAnger = 0;
          }
        }
        break;
      }

      case 'buy_mining_3060x30': {
        // 사무실 여유 슬롯에 채굴 에디션 RTX 3060 추가 + 초과분은 연산력 보너스 Modifier로 반영
        let remainingToInsert = 30;
        if (Array.isArray(state.offices)) {
          state.offices.forEach(office => {
            const preset =
              window.GAME_DATA && Array.isArray(window.GAME_DATA.offices)
                ? window.GAME_DATA.offices.find(p => p.id === office.presetId)
                : null;
            const maxSlots = preset ? preset.slots : 24;
            while (remainingToInsert > 0 && office.gpus.length < maxSlots) {
              office.gpus.push({
                uid: state.gpuUidCounter++,
                model: 'rtx3060',
                health: 65,
                efficiency: 0.95,
                clockMul: 1.0,
                tempOffset: 4,
                wearMul: 1.4,
                miningMul: 1.0,
                mods: [],
                warranty: 0,
                isMining: true,
                isBroken: false
              });
              remainingToInsert--;
            }
          });
        }
        // 슬롯 한계로 다 꽂지 못한 대수만큼 추가 연산력 보너스 부여 (+390 TF 보장)
        if (remainingToInsert > 0 && typeof window.addModifier === 'function') {
          window.addModifier({
            id: 'mod_mining_3060x30_tflops',
            name: `외부 위탁 채굴장 3060 클러스터 (${remainingToInsert}대)`,
            stat: 'tflops',
            add: remainingToInsert * 13,
            months: 36
          });
        }
        state.totalTflops = (state.totalTflops || 0) + 390;
        break;
      }

      case 'buy_yongsan_h100_bundle': {
        if (Array.isArray(state.offices) && state.offices.length > 0) {
          const targetOffice = state.offices[state.offices.length - 1];
          for (let i = 0; i < 4; i++) {
            targetOffice.gpus.push({
              uid: state.gpuUidCounter++,
              model: 'h100',
              health: 100,
              efficiency: 1.0,
              clockMul: 1.0,
              tempOffset: 0,
              wearMul: 1.0,
              miningMul: 1.0,
              mods: [],
              warranty: 36,
              isMining: false,
              isBroken: false
            });
          }
        }
        state.totalTflops = (state.totalTflops || 0) + 4000;
        break;
      }

      case 'kill_one_gpu': {
        if (Array.isArray(state.offices)) {
          for (let i = 0; i < state.offices.length; i++) {
            const workingGpus = state.offices[i].gpus.filter(g => !g.isBroken);
            if (workingGpus.length > 0) {
              // 가장 고티어/마지막 GPU 1대 고장 처리 (단, 최소 1대만 남았을 때는 체력만 대폭 깎아 진행불가 방지)
              const victim = workingGpus[workingGpus.length - 1];
              if (workingGpus.length > 1) {
                victim.isBroken = true;
                victim.health = 0;
              } else {
                victim.health = Math.max(15, (victim.health || 100) - 50);
              }
              break;
            }
          }
        }
        break;
      }

      case 'dump_all_coin': {
        if (state.coinBalance > 0) {
          const cashFromCoin = Math.floor(state.coinBalance * (state.coinPrice || 4000000) * 0.85);
          state.money += cashFromCoin;
          state.coinBalance = 0;
          state.coinSellCount = (state.coinSellCount || 0) + 1;
        }
        if (Array.isArray(state.loans) && state.loans.length > 0) {
          const minusIdx = state.loans.findIndex(l => l.id === 'ceo_minus_bank');
          if (minusIdx !== -1) {
            state.loans.splice(minusIdx, 1);
          }
        }
        break;
      }

      case 'shift_crypto_to_cloud': {
        if (state.workloadAlloc) {
          const cryptoShare = state.workloadAlloc.crypto || 0;
          state.workloadAlloc.crypto = 0;
          state.workloadAlloc.cloud = Math.min(100, (state.workloadAlloc.cloud || 0) + cryptoShare);
        }
        break;
      }

      case 'quit_one_senior': {
        if (Array.isArray(state.employees) && state.employees.length > 0) {
          // 가장 숙련도가 높은 직원 1명 퇴사
          let maxIdx = 0;
          for (let i = 1; i < state.employees.length; i++) {
            if ((state.employees[i].skill || 0) > (state.employees[maxIdx].skill || 0)) {
              maxIdx = i;
            }
          }
          state.employees.splice(maxIdx, 1);
        }
        break;
      }

      case 'raise_ace_salary_30': {
        if (Array.isArray(state.employees) && state.employees.length > 0) {
          const ace = state.employees.find(e => e.skill >= 70) || state.employees[0];
          ace.salary = Math.round((ace.salary || 5000000) * 1.3);
          ace.loyalty = Math.min(100, (ace.loyalty || 50) + 25);
          ace.morale = Math.min(100, (ace.morale || 70) + 20);
        }
        break;
      }

      case 'grant_ace_stock_3': {
        if (Array.isArray(state.employees) && state.employees.length > 0) {
          const ace = state.employees.find(e => e.skill >= 70) || state.employees[0];
          ace.stockOption = (ace.stockOption || 0) + 3;
          ace.loyalty = Math.min(100, (ace.loyalty || 50) + 30);
        }
        break;
      }

      case 'clear_high_burnout': {
        if (Array.isArray(state.employees)) {
          state.employees.forEach(e => {
            e.burnout = Math.max(0, (e.burnout || 0) - 45);
            e.morale = Math.min(100, (e.morale || 70) + 12);
          });
        }
        break;
      }

      case 'convert_intern_regular': {
        if (Array.isArray(state.employees) && state.employees.length > 0) {
          const intern = state.employees.find(e => e.jobId === 'intern') || state.employees[0];
          intern.jobId = 'devops';
          intern.salary = (intern.salary || 2100000) + 1000000;
          intern.skill = Math.min(100, (intern.skill || 40) + 20);
          intern.loyalty = Math.min(100, (intern.loyalty || 50) + 20);
        }
        break;
      }

      case 'dismiss_intern': {
        if (Array.isArray(state.employees)) {
          const idx = state.employees.findIndex(e => e.jobId === 'intern');
          if (idx !== -1) {
            state.employees.splice(idx, 1);
          }
        }
        break;
      }

      default:
        break;
    }
  }

  /**
   * 2. 단일 effects 객체를 state에 반영
   * @param {Object} effects
   */
  function applyEventEffects(effects) {
    const state = window.state;
    if (!state || !effects) return;

    const clampFn = typeof window.clamp === 'function'
      ? window.clamp
      : (v, min, max) => Math.max(min, Math.min(max, v));

    Object.keys(effects).forEach(key => {
      const val = effects[key];

      if (key === 'money' && typeof val === 'number') {
        state.money += val;
      } else if (key === 'creditScore' && typeof val === 'number') {
        state.creditScore = clampFn(state.creditScore + val, 0, 1000);
        if (typeof window.getCreditTier === 'function') {
          state.creditTier = window.getCreditTier(state.creditScore);
        }
      } else if (key === 'reputation' && typeof val === 'number') {
        state.reputation = clampFn(state.reputation + val, 0, 100);
      } else if (key === 'ceoStress' && typeof val === 'number') {
        state.ceoStress = clampFn(state.ceoStress + val, 0, 100);
      } else if (key === 'ceoHealth' && typeof val === 'number') {
        state.ceoHealth = clampFn(state.ceoHealth + val, 0, 100);
      } else if (key === 'ceoEquity' && typeof val === 'number') {
        state.ceoEquity = clampFn(state.ceoEquity + val, 0, 100);
      } else if (key === 'lieMeter' && typeof val === 'number') {
        state.lieMeter = Math.max(0, (state.lieMeter || 0) + val);
      } else if (key === 'morale' && typeof val === 'number') {
        state.morale = clampFn(state.morale + val, 0, 100);
        if (Array.isArray(state.employees)) {
          state.employees.forEach(emp => {
            emp.morale = clampFn((emp.morale || 70) + val, 0, 100);
          });
        }
      } else if (key === 'burnout' && typeof val === 'number') {
        state.burnout = clampFn(state.burnout + val, 0, 100);
        if (Array.isArray(state.employees)) {
          state.employees.forEach(emp => {
            emp.burnout = clampFn((emp.burnout || 10) + val, 0, 100);
          });
        }
      } else if (key.startsWith('flags.')) {
        const flagName = key.slice('flags.'.length);
        state.flags = state.flags || {};
        state.flags[flagName] = val;
        if (flagName === 'govBanned' && val === true) {
          state.flags.govBanMonths = Math.max(state.flags.govBanMonths || 0, 24);
        }
        if (flagName === 'auditCaught' && val === true) {
          state.auditCaughtCount = (state.auditCaughtCount || 0) + 1;
        }
      } else if (key === 'addGpus' && val && typeof val === 'object') {
        // 계약 C: 실물 GPU를 사업장 여유 슬롯에 추가
        const model = val.model || 'rtx3060';
        const count = typeof val.count === 'number' ? val.count : 1;
        const isMining = Boolean(val.isMining);
        let added = 0;
        if (Array.isArray(state.offices)) {
          state.offices.forEach(office => {
            const preset = (window.GAME_DATA && window.GAME_DATA.offices && window.GAME_DATA.offices.find(p => p.id === office.presetId)) || {};
            const maxSlots = preset.slots || 6;
            while (office.gpus.length < maxSlots && added < count) {
              const gpuInst = (typeof window.createGpuInstance === 'function')
                ? window.createGpuInstance(model, isMining, false)
                : { uid: state.gpuUidCounter++, model, isMining, isBroken: false, health: isMining ? 70 : 100 };
              office.gpus.push(gpuInst);
              added++;
            }
          });
        }
      } else if (key === 'breakRandomGpu' && typeof val === 'number') {
        // 랜덤 GPU N대 고장
        let toBreak = val;
        if (Array.isArray(state.offices)) {
          const alive = [];
          state.offices.forEach(o => {
            if (Array.isArray(o.gpus)) {
              o.gpus.forEach(g => { if (!g.isBroken) alive.push(g); });
            }
          });
          while (toBreak > 0 && alive.length > 0) {
            const rIdx = Math.floor(Math.random() * alive.length);
            alive[rIdx].isBroken = true;
            alive[rIdx].health = 0;
            alive.splice(rIdx, 1);
            toBreak--;
          }
        }
      } else if (key === 'damageRandomGpu' && val && typeof val === 'object') {
        // 랜덤 GPU N대에 내구도 피해
        const count = typeof val.count === 'number' ? val.count : 1;
        const dmg = typeof val.damage === 'number' ? val.damage : 40;
        if (Array.isArray(state.offices)) {
          const alive = [];
          state.offices.forEach(o => {
            if (Array.isArray(o.gpus)) {
              o.gpus.forEach(g => { if (!g.isBroken) alive.push(g); });
            }
          });
          for (let i = 0; i < count && alive.length > 0; i++) {
            const rIdx = Math.floor(Math.random() * alive.length);
            const target = alive[rIdx];
            target.health = Math.max(1, (target.health || 100) - dmg);
            alive.splice(rIdx, 1);
          }
        }
      } else if (key === 'chainEvent' && val && typeof val === 'object') {
        // 체인 이벤트 예약 (delayMonths 후 강제 대기열 등록)
        state.scheduledEvents = state.scheduledEvents || [];
        state.scheduledEvents.push({
          id: val.id,
          fireAtMonth: (state.month || 0) + (val.delayMonths || 1)
        });
      } else if (key === 'modifier' && val && typeof val === 'object') {
        // 계약 C: modifier는 반드시 months 명시 (최대 12개월 클램프)
        const durMonths = Math.min(12, Math.max(1, typeof val.months === 'number' ? val.months : 1));
        const modObj = Object.assign(
          {
            id: val.id || `evt_mod_${Date.now()}`,
            name: val.name || '이벤트 효과',
            months: durMonths
          },
          val,
          { months: durMonths }
        );
        if (typeof window.addModifier === 'function') {
          window.addModifier(modObj);
        } else if (Array.isArray(state.modifiers)) {
          state.modifiers.push(modObj);
        }
      } else if (key === 'special' && typeof val === 'string') {
        executeSpecialEffect(val);
      }
    });
  }

  /**
   * 3. 이벤트 ID로 딜레마 이벤트를 강제 또는 정상 발동
   * @param {string} eventId
   * @returns {Object|null}
   */
  function triggerEventById(eventId) {
    const state = window.state;
    const allEvents = (window.GAME_DATA && window.GAME_DATA.events) || [];
    const ev = allEvents.find(e => e.id === eventId);
    if (!ev) return null;

    clearQteTimer();
    _activeEvent = ev;
    if (state) {
      state.eventCooldowns = state.eventCooldowns || {};
      state.eventCooldowns[ev.id] = state.month || 0;
    }

    // 브라우저 UI가 있을 경우 게임 일시정지 후 모달 오픈
    if (typeof document !== 'undefined') {
      if (state && state.speed > 0) {
        _prevSpeedBeforeModal = state.speed;
        state.speed = 0;
      }

      if (window.UI && typeof window.UI.openEventModal === 'function') {
        window.UI.openEventModal(ev);
      } else if (typeof window.openEventModal === 'function') {
        window.openEventModal(ev);
      } else {
        renderFallbackEventModal(ev);
      }

      if (ev.isQte) {
        startQteCountdown(ev);
      }
    }

    if (window.Sound && typeof window.Sound.playEventAlert === 'function') {
      window.Sound.playEventAlert();
    } else if (window.sound) {
      if (ev.isQte && typeof window.sound.playAlarm === 'function') {
        window.sound.playAlarm();
      } else if (typeof window.sound.playBeep === 'function') {
        window.sound.playBeep(440, 0.15, 'sawtooth');
      }
    }

    return ev;
  }

  /**
   * UI 모듈이 로드되기 전이거나 단독 테스트 시에도 동작하는 기본 모달 바인딩 헬퍼
   */
  function renderFallbackEventModal(ev) {
    if (typeof document === 'undefined') return;
    const modal = document.getElementById('event-modal') || document.getElementById('modal-event');
    if (!modal) return;

    const titleEl = modal.querySelector('.event-title, #event-modal-title');
    const textEl = modal.querySelector('.event-text, #event-modal-text');
    const choicesEl = modal.querySelector('.event-choices, #event-modal-choices');

    if (titleEl) titleEl.textContent = `[#${ev.num || '돌발'}] ${ev.title}`;
    if (textEl) textEl.textContent = ev.text;

    if (choicesEl && Array.isArray(ev.choices)) {
      choicesEl.innerHTML = '';
      ev.choices.forEach((c, idx) => {
        const btn = document.createElement('button');
        btn.className = 'btn event-choice-btn';
        btn.innerHTML = `<strong>${c.label}</strong><br><small>${c.desc || ''}</small>`;
        btn.onclick = function () {
          resolveEventChoice(ev.id, idx);
        };
        choicesEl.appendChild(btn);
      });
    }

    modal.classList.add('active', 'open', 'show');
    modal.style.display = 'flex';
  }

  /**
   * 4. 매 게임월(1개월=60초)마다 호출되어 조건을 만족하는 이벤트 중 최대 1개를 발동
   * @returns {Object|null} 발동된 이벤트 객체 (없으면 null)
   */
  function checkMonthlyEvents() {
    const state = window.state;
    if (!state || state.gameEnded) return null;

    // 이미 열려있는 딜레마 이벤트가 있으면 중복 팝업 방지
    if (_activeEvent && typeof document !== 'undefined') {
      return null;
    }

    const allEvents = (window.GAME_DATA && window.GAME_DATA.events) || [];
    if (!allEvents.length) return null;

    state.eventCooldowns = state.eventCooldowns || {};
    const currentMonth = state.month || 0;

    // 예약된 체인 이벤트 우선 발동 체크
    if (Array.isArray(state.scheduledEvents) && state.scheduledEvents.length > 0) {
      const dueIdx = state.scheduledEvents.findIndex(se => se.fireAtMonth <= currentMonth);
      if (dueIdx !== -1) {
        const due = state.scheduledEvents.splice(dueIdx, 1)[0];
        const chainEv = allEvents.find(e => e.id === due.id);
        if (chainEv) {
          return triggerEventById(chainEv.id);
        }
      }
    }

    // 1단계: 발생 가능 조건(minMonth, cooldownMonths, require) 필터링
    const calendarEvents = [];
    const randomPool = [];

    allEvents.forEach(ev => {
      const trig = ev.trigger || {};
      const minMonth = typeof trig.minMonth === 'number' ? trig.minMonth : 0;
      if (currentMonth < minMonth) return;

      const lastMonth = state.eventCooldowns[ev.id];
      const cooldown = typeof trig.cooldownMonths === 'number' ? trig.cooldownMonths : 12;
      if (typeof lastMonth === 'number' && currentMonth - lastMonth < cooldown) {
        return;
      }

      if (!evaluateRequirement(trig.require)) {
        return;
      }

      // 캘린더 월 고정 이벤트 판정
      if (trig.calendarMonth !== undefined) {
        const cal = trig.calendarMonth;
        const isMatch = Array.isArray(cal) ? cal.includes(state.calendarMonth) : cal === state.calendarMonth;
        if (isMatch) {
          calendarEvents.push(ev);
          return;
        }
      }

      randomPool.push(ev);
    });

    // 캘린더 고정 이벤트가 있으면 최우선으로 1개 발동
    if (calendarEvents.length > 0) {
      const pick = calendarEvents[Math.floor(Math.random() * calendarEvents.length)];
      return triggerEventById(pick.id);
    }

    if (randomPool.length === 0) return null;

    // 계약 C: 월간 일반 이벤트는 기본 35% 확률 게이트 통과 시에만 가중치 추첨 발동
    if (Math.random() >= 0.35) return null;

    // chancePerMonth를 가중치로 삼아 1개 추첨
    let totalWeight = 0;
    randomPool.forEach(ev => {
      const w = (ev.trigger && typeof ev.trigger.chancePerMonth === 'number') ? ev.trigger.chancePerMonth : 0.10;
      totalWeight += w;
    });

    let rnd = Math.random() * totalWeight;
    for (let i = 0; i < randomPool.length; i++) {
      const ev = randomPool[i];
      const w = (ev.trigger && typeof ev.trigger.chancePerMonth === 'number') ? ev.trigger.chancePerMonth : 0.10;
      rnd -= w;
      if (rnd <= 0) {
        return triggerEventById(ev.id);
      }
    }

    return triggerEventById(randomPool[0].id);
  }

  /**
   * 5. 플레이어(또는 봇)가 선택한 선택지를 정산 및 적용
   * @param {string} eventId
   * @param {number} choiceIdx
   * @returns {Object|null} { eventId, choiceIdx, resultText, appliedEffects }
   */
  function resolveEventChoice(eventId, choiceIdx) {
    clearQteTimer();
    const state = window.state;
    if (!state) return null;

    const allEvents = (window.GAME_DATA && window.GAME_DATA.events) || [];
    const ev = allEvents.find(e => e.id === eventId) || _activeEvent;
    if (!ev || !Array.isArray(ev.choices)) return null;

    const idx = typeof choiceIdx === 'number' && ev.choices[choiceIdx] ? choiceIdx : 0;
    const choice = ev.choices[idx];
    if (!choice) return null;

    // 1. 선택지 기본 비용(cost) 차감
    if (typeof choice.cost === 'number' && choice.cost !== 0) {
      state.money -= choice.cost;
    }

    let appliedEffects = {};
    let resultText = choice.result || '';

    // 2. 고정 effects가 있으면 적용
    if (choice.effects && typeof choice.effects === 'object') {
      applyEventEffects(choice.effects);
      Object.assign(appliedEffects, choice.effects);
    }

    // 3. 확률형 outcomes가 있으면 주사위 굴림
    if (Array.isArray(choice.outcomes) && choice.outcomes.length > 0) {
      const roll = Math.random();
      let cumulative = 0;
      let chosenOutcome = choice.outcomes[choice.outcomes.length - 1];

      for (let i = 0; i < choice.outcomes.length; i++) {
        const out = choice.outcomes[i];
        cumulative += typeof out.chance === 'number' ? out.chance : 0.5;
        if (roll <= cumulative) {
          chosenOutcome = out;
          break;
        }
      }

      if (chosenOutcome) {
        if (chosenOutcome.effects) {
          applyEventEffects(chosenOutcome.effects);
          Object.assign(appliedEffects, chosenOutcome.effects);
        }
        if (chosenOutcome.result) {
          resultText = chosenOutcome.result;
        }
      }
    }

    // 4. 이벤트 히스토리 기록
    state.eventHistory = state.eventHistory || [];
    state.eventHistory.push({
      month: state.month || 0,
      eventId: ev.id,
      title: ev.title,
      choiceIdx: idx,
      choiceLabel: choice.label,
      result: resultText
    });

    _activeEvent = null;

    // 5. 브라우저 모달 닫기 및 배속 복구, 토스트 표시
    if (typeof document !== 'undefined') {
      const modal = document.getElementById('event-modal') || document.getElementById('modal-event');
      if (modal) {
        modal.classList.remove('active', 'open', 'show');
        modal.style.display = 'none';
      }
      if (state.speed === 0 && !state.gameEnded) {
        state.speed = _prevSpeedBeforeModal || 1;
      }
      if (resultText && typeof window.showToast === 'function') {
        window.showToast(`🎲 ${resultText}`);
      }
      if (window.UI && typeof window.UI.renderAll === 'function') {
        window.UI.renderAll();
      } else if (typeof window.renderAll === 'function') {
        window.renderAll();
      }
    }

    return {
      eventId: ev.id,
      choiceIdx: idx,
      resultText,
      appliedEffects
    };
  }

  function getActiveEvent() {
    return _activeEvent;
  }

  const eventsSystem = {
    evaluateRequirement,
    checkMonthlyEvents,
    triggerEventById,
    resolveEventChoice,
    applyEventEffects,
    executeSpecialEffect,
    getActiveEvent,
    clearQteTimer,
    startQteCountdown,
    handleQteTimeout,
    getQteTimeRemaining: () => _qteTimeRemaining
  };

  window.Systems.events = eventsSystem;
  window.evaluateRequirement = evaluateRequirement;
  window.checkMonthlyEvents = checkMonthlyEvents;
  window.triggerEventById = triggerEventById;
  window.resolveEventChoice = resolveEventChoice;
  window.clearQteTimer = clearQteTimer;
})();
