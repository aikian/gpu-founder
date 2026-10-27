/**
 * game/data/events.js
 * 62종 현실 고증 한국 테크 스타트업 딜레마 이벤트 마스터 데이터
 * AGENTS.md 및 docs/CONVENTIONS.md 스키마 준수
 */
window.GAME_DATA = window.GAME_DATA || {};
window.GAME_DATA.events = [
  {
    "id": "tax_vat_season",
    "category": "tax",
    "title": "1월·7월 부가세(VAT) 납부의 달",
    "text": "\"대표님, 상반기 매출 부가세 10% 예수금 통장에 모아두셨죠? 이번 달 25일까지 확정신고 납부 안 하면 가산세 붙습니다.\" 세무사 사무실에서 긴급 연락이 도착했습니다.",
    "trigger": {
      "calendarMonth": [
        1,
        7
      ],
      "cooldownMonths": 5,
      "require": "month >= 4 && flags.bizRegistered"
    },
    "choices": [
      {
        "label": "[A] 부가세 정액 성실 납부",
        "desc": "모아둔 자금에서 부가세 예수금을 납부합니다.",
        "effects": {
          "money": -3500000,
          "creditScore": 5
        },
        "result": "세무서에 부가세를 기한 내 완납했습니다. 가산세 리스크를 넘겼습니다."
      },
      {
        "label": "[B] 매입세액 영수증 탈탈 털어 절세",
        "desc": "서버 부품, 식대, 비품 영수증을 긁어모아 공제 신청합니다.",
        "effects": {
          "money": -1500000,
          "ceoStress": 10
        },
        "result": "매입세액 공제를 최대한 받아 납부액을 줄였습니다. 밤샘 영수증 풀칠로 피로가 누적되었습니다."
      }
    ]
  },
  {
    "id": "tax_corp_settlement",
    "category": "tax",
    "title": "3월 결산 법인세 고지서",
    "text": "\"작년도 재무제표 결산 결과 순이익에 대한 법인세 과세표준이 확정되었습니다.\" 법인통장에서 세금이 빠져나갈 준비를 해야 합니다.",
    "trigger": {
      "calendarMonth": 3,
      "cooldownMonths": 11,
      "require": "month >= 10 && flags.bizRegistered"
    },
    "choices": [
      {
        "label": "[A] 법인세 일시납",
        "desc": "국세청에 법인세를 전액 일시 납부합니다.",
        "effects": {
          "money": -6000000,
          "reputation": 5
        },
        "result": "성실 납세 기업으로 기록되었습니다. 신용도가 소폭 상승합니다."
      },
      {
        "label": "[B] 2개월 분납 신청",
        "desc": "자금 유동성 방어를 위해 50% 분납을 신청합니다.",
        "effects": {
          "money": -3000000,
          "ceoStress": 5
        },
        "result": "절반만 먼저 납부하고 2개월 뒤 분납하기로 유예했습니다."
      }
    ]
  },
  {
    "id": "tax_audit_raid",
    "category": "tax",
    "title": "국세청 특별 세무조사 착수 통보",
    "text": "\"귀사의 GPU 수입 및 암호화폐 거래 내역과 관련하여 조세 탈루 의혹 조사가 개시되었습니다.\" 등기우편으로 세무조사 사전통지서가 날아왔습니다.",
    "trigger": {
      "minMonth": 14,
      "chancePerMonth": 0.08,
      "cooldownMonths": 18,
      "require": "money >= 30000000"
    },
    "choices": [
      {
        "label": "[A] 대형 세무법인 조사 대응 선임",
        "desc": "착수금 800만원을 주고 전직 국세청 출신 세무사를 선임합니다.",
        "cost": 8000000,
        "outcomes": [
          {
            "chance": 0.8,
            "effects": {
              "money": -3000000,
              "creditScore": 10
            },
            "result": "세무사의 적극적인 소명으로 가산세 300만원 선에서 무사히 종결되었습니다."
          },
          {
            "chance": 0.2,
            "effects": {
              "money": -15000000,
              "creditScore": -20
            },
            "result": "과거 누락된 영수증이 지적되어 추징금 1,500만원이 부과되었습니다."
          }
        ]
      },
      {
        "label": "[B] 대표 본인이 장부 들고 직접 소명",
        "desc": "비용을 아끼기 위해 직접 세무서 조사관을 찾아갑니다.",
        "effects": {
          "money": -7000000,
          "ceoStress": 25,
          "ceoHealth": -10
        },
        "result": "일주일 동안 조사관에게 시달린 끝에 과소신고 가산세를 물고 사건을 마무리했습니다."
      }
    ]
  },
  {
    "id": "four_insurance_arrears",
    "category": "tax",
    "title": "건보공단 4대보험 연체 독촉장",
    "text": "\"직원 4대보험료 및 고용안정기금이 2개월째 미납되었습니다. 기한 내 미납 시 통장 압류 처분이 집행될 수 있습니다.\"",
    "trigger": {
      "minMonth": 8,
      "chancePerMonth": 0.12,
      "cooldownMonths": 8,
      "require": "employees.length >= 1 && money < 5000000"
    },
    "choices": [
      {
        "label": "[A] 연체료 포함 즉시 완납",
        "desc": "더 큰 불이익을 막기 위해 통장에서 즉시 출금합니다.",
        "effects": {
          "money": -2500000,
          "creditScore": -10
        },
        "result": "4대보험 체납을 해소했습니다. 신용점수에 연체 이력이 소폭 남았습니다."
      },
      {
        "label": "[B] 분할납부 약정 체결",
        "desc": "공단에 방문하여 3개월 분할납부 계획서를 제출합니다.",
        "effects": {
          "money": -900000,
          "ceoStress": 10
        },
        "result": "압류는 면했으나 매달 분할 상환해야 합니다."
      }
    ]
  },
  {
    "id": "venture_cert_audit",
    "category": "legal",
    "title": "벤처기업 인증 현장 실사 방문",
    "text": "\"기술보증기금 평가위원이 혁신성장형 벤처기업 인증 갱신을 위해 서버실과 연구개발 일지를 실사하러 방문했습니다.\"",
    "trigger": {
      "minMonth": 9,
      "chancePerMonth": 0.1,
      "cooldownMonths": 12,
      "require": "totalTflops >= 50"
    },
    "choices": [
      {
        "label": "[A] 기술 아키텍처와 자체 GPU 랙 시연",
        "desc": "자체 클러스터와 기술 로드맵을 브리핑합니다.",
        "effects": {
          "reputation": 10,
          "flags.ventureCertified": true
        },
        "result": "벤처기업 인증 획득! 향후 법인세 50% 감면 및 정부과제 가점 혜택을 받습니다."
      },
      {
        "label": "[B] 벤처 인증 패스 (수수료 절감)",
        "desc": "평가 수수료 200만원이 아까워 인증을 포기합니다.",
        "effects": {
          "ceoStress": -5
        },
        "result": "벤처 인증을 갱신하지 않았습니다."
      }
    ]
  },
  {
    "id": "rnd_lab_inspection",
    "category": "legal",
    "title": "기업부설연구소 불시 사후 점검",
    "text": "\"한국산업기술진흥협회(KOITA)에서 연구소 현장 실사를 나왔습니다. 연구원 전담 여부와 독립된 파티션 공간을 확인합니다.\"",
    "trigger": {
      "minMonth": 10,
      "chancePerMonth": 0.09,
      "cooldownMonths": 12,
      "require": "employees.length >= 2"
    },
    "choices": [
      {
        "label": "[A] 완벽한 연구 전담 공간 보여주기",
        "desc": "개발자들을 연구실 파티션 안에 정위치시키고 연구일지를 제출합니다.",
        "effects": {
          "reputation": 5,
          "flags.hasRndLab": true
        },
        "result": "연구소 사후 점검 적격 통과! 연구인력개발비 세액공제(25%) 혜택이 유지됩니다."
      },
      {
        "label": "[B] 행정 미비 지적 및 시정명령",
        "desc": "잡무 병행이 적발되어 보완명령을 받았습니다.",
        "effects": {
          "money": -1000000,
          "ceoStress": 12
        },
        "result": "과태료와 함께 1개월 내 연구일지 전면 재작성 명령을 받았습니다."
      }
    ]
  },
  {
    "id": "personal_info_leak_scare",
    "category": "legal",
    "title": "개인정보보호위원회 보안 점검 공문",
    "text": "\"자체 AI 서비스 회원 DB 암호화 및 접근통제 조치 여부에 대한 실태조사 공문이 접수되었습니다.\"",
    "trigger": {
      "minMonth": 6,
      "chancePerMonth": 0.08,
      "cooldownMonths": 10,
      "require": "saasUsers >= 500"
    },
    "choices": [
      {
        "label": "[A] 개인정보 보안 전문 컨설팅 의뢰",
        "desc": "500만원을 들여 ISMS 수준의 보안 감사를 마칩니다.",
        "cost": 5000000,
        "effects": {
          "reputation": 15,
          "flags.securityCertified": true
        },
        "result": "보안 실태조사 우수 판정을 받았습니다. 엔터프라이즈 고객의 신뢰도가 상승합니다."
      },
      {
        "label": "[B] 오픈소스 자체 보안 점검표 작성",
        "desc": "인터넷 서식을 받아 대충 채워 제출합니다.",
        "outcomes": [
          {
            "chance": 0.6,
            "effects": {
              "ceoStress": 10
            },
            "result": "추가 질문 없이 서면 종결되었습니다."
          },
          {
            "chance": 0.4,
            "effects": {
              "money": -10000000,
              "reputation": -15
            },
            "result": "접근제어 미비로 과태료 1,000만원이 부과되고 언론에 보도되었습니다!"
          }
        ]
      }
    ]
  },
  {
    "id": "gpl_license_warning",
    "category": "legal",
    "title": "오픈소스 GPL 라이선스 위반 경고장",
    "text": "\"귀사의 AI 서빙 엔진에 포함된 코드가 GPL v3 라이선스를 침해했다며 소스코드 전면 공개 또는 손해배상을 요구하는 로펌 내용증명이 도착했습니다.\"",
    "trigger": {
      "minMonth": 8,
      "chancePerMonth": 0.07,
      "cooldownMonths": 12,
      "require": "totalTflops >= 60"
    },
    "choices": [
      {
        "label": "[A] 해당 모듈 전면 재작성 (오픈소스 클린룸)",
        "desc": "개발팀을 갈아 넣어 독자 모듈로 재개발합니다.",
        "effects": {
          "ceoStress": 20,
          "modifier": {
            "stat": "cloudIncome",
            "mul": 0.75,
            "months": 2
          }
        },
        "result": "GPL 코드를 완전히 걷어냈습니다. 라이선스 리스크가 영구 해소되었습니다."
      },
      {
        "label": "[B] 로펌과 합의금 협상",
        "desc": "분쟁을 조기 종결하기 위해 라이선스 구매 합의금을 지급합니다.",
        "effects": {
          "money": -6000000,
          "reputation": -5
        },
        "result": "합의금을 지불하고 기존 코드를 계속 사용하기로 비밀유지계약을 맺었습니다."
      }
    ]
  },
  {
    "id": "grant_audit",
    "category": "grant",
    "title": "e나라도움 정산의 악몽",
    "text": "\"회계감사관이 과거 구입한 H100 서버의 최저가 비교견적서 서식이 누락되었다며 5,000만원 환수 처분을 예고했습니다.\"",
    "trigger": {
      "minMonth": 7,
      "chancePerMonth": 0.1,
      "cooldownMonths": 12,
      "require": "flags.hasGrant"
    },
    "choices": [
      {
        "label": "[A] 눈물의 사비 변제 (행정 종결)",
        "desc": "문제를 키우지 않고 지원금을 토해냅니다.",
        "effects": {
          "money": -50000000,
          "creditScore": 20
        },
        "result": "환수금을 완납했습니다. 향후 정부사업 참여 자격은 보존되었습니다."
      },
      {
        "label": "[B] 국민신문고 이의신청 & 행정심판",
        "desc": "500만원 변호사 착수금을 걸고 맞섭니다.",
        "cost": 5000000,
        "outcomes": [
          {
            "chance": 0.5,
            "effects": {
              "reputation": 10
            },
            "result": "이의신청이 극적으로 인용되어 환수 처분이 취소되었습니다!"
          },
          {
            "chance": 0.5,
            "effects": {
              "money": -50000000,
              "flags.govBanned": true
            },
            "result": "기각되었습니다! 전액 환수와 함께 정부사업 참여제한 2년 처분을 받았습니다."
          }
        ]
      }
    ]
  },
  {
    "id": "gov_grant_season_night",
    "category": "grant",
    "title": "2월 정부지원사업 공고 시즌 밤샘",
    "text": "\"중기부 예창패·초창패와 IITP 공고가 동시에 떴습니다! 이번 주 금요일 오후 6시 마감까지 사업계획서 40페이지를 완성해야 합니다.\"",
    "trigger": {
      "calendarMonth": [
        1,
        2
      ],
      "cooldownMonths": 8,
      "require": "month >= 2"
    },
    "choices": [
      {
        "label": "[A] 전 직원 주말 철야로 올인 작성",
        "desc": "피자를 시켜주고 주말 내내 사업계획서를 다듬습니다.",
        "effects": {
          "burnout": 20,
          "ceoStress": 15,
          "flags.grantReady": true
        },
        "result": "완성도 높은 사업계획서 제출 완료! 서류 평가 합격률이 대폭 상승합니다."
      },
      {
        "label": "[B] 전문 창업지도사 첨삭 컨설팅 (300만원)",
        "desc": "외주 전문가에게 피칭 덱과 사업계획서 윤문을 맡깁니다.",
        "cost": 3000000,
        "effects": {
          "flags.grantReady": true,
          "ceoStress": -5
        },
        "result": "심사위원 눈높이에 맞춘 깔끔한 사업계획서가 납품되었습니다."
      }
    ]
  },
  {
    "id": "gov_midterm_presentation",
    "category": "grant",
    "title": "정부과제 중간점검 현장 발표평가",
    "text": "\"수행 중인 AI 정부지원사업의 6개월차 중간점검일입니다. 진도보고서 마일스톤 미달 시 지원금 분할지급이 중단될 수 있습니다.\"",
    "trigger": {
      "minMonth": 6,
      "chancePerMonth": 0.12,
      "cooldownMonths": 10,
      "require": "flags.hasGrant"
    },
    "choices": [
      {
        "label": "[A] 실제 벤치마크 지표와 가동률 투명 공개",
        "desc": "원리원칙대로 엔지니어링 데이터를 발표합니다.",
        "outcomes": [
          {
            "chance": 0.75,
            "effects": {
              "reputation": 10,
              "money": 20000000
            },
            "result": "중간평가 \"우수\" 판정! 2차 지원금 2,000만원이 조기 입금되었습니다."
          },
          {
            "chance": 0.25,
            "effects": {
              "ceoStress": 10
            },
            "result": "보통 판정으로 시정권고를 받고 2차 지원금이 정상 분할 지급되었습니다."
          }
        ]
      },
      {
        "label": "[B] 블러핑 섞인 화려한 비전 쇼잉",
        "desc": "아직 미완성인 수치를 포장하여 발표합니다.",
        "effects": {
          "lieMeter": 1,
          "money": 20000000
        },
        "result": "심사위원들을 매료시키며 지원금을 수령했으나 거짓말 게이지가 쌓였습니다."
      }
    ]
  },
  {
    "id": "gov_voucher_inspection",
    "category": "grant",
    "title": "정부 AI 바우처 공급기업 현장 실사",
    "text": "\"IITP 평가위원 3명이 우리 사무실을 불시에 방문하여 진짜 자체 GPU 랙을 보유하고 있는지 전수 조사에 들어갔습니다.\"",
    "trigger": {
      "minMonth": 5,
      "chancePerMonth": 0.1,
      "cooldownMonths": 12,
      "require": "totalTflops >= 30"
    },
    "choices": [
      {
        "label": "[A] 커피 대접하고 랙 LED 화려하게 쇼잉",
        "desc": "서버 랙을 화려하게 가동하고 정중히 응대합니다.",
        "effects": {
          "reputation": 5,
          "money": 30000000
        },
        "result": "현장 실사 합격! 바우처 정산금 3,000만원이 전용 계좌로 입금되었습니다."
      },
      {
        "label": "[B] 원리원칙대로 기술 아키텍처만 설명",
        "desc": "형식적인 접대 없이 코드와 인프라만 보여줍니다.",
        "effects": {
          "ceoStress": 10
        },
        "result": "깐깐한 심사로 보완 서류 10종 제출을 요구받아 정산이 2개월 지연되었습니다."
      }
    ]
  },
  {
    "id": "tech_royalty_bill",
    "category": "grant",
    "title": "과제 성공 판정에 따른 기술료 납부 고지",
    "text": "\"축하합니다! 국가 R&D 과제가 최종 성공 판정되었습니다. 규정에 의거 정부지원금의 10%에 해당하는 정액기술료를 국고에 납부해야 합니다.\"",
    "trigger": {
      "minMonth": 16,
      "chancePerMonth": 0.08,
      "cooldownMonths": 16,
      "require": "flags.hasGrant"
    },
    "choices": [
      {
        "label": "[A] 기술료 1,500만원 성실 납부",
        "desc": "국고에 정액기술료를 완납하고 R&D 우수기업 타이틀을 얻습니다.",
        "effects": {
          "money": -15000000,
          "reputation": 20,
          "creditScore": 15
        },
        "result": "국가 R&D 우수 수행기업으로 등록되어 차기 대형 과제 가산점을 확보했습니다."
      },
      {
        "label": "[B] 3년 분할 납부 신청",
        "desc": "자금 부담을 줄이기 위해 분납을 신청합니다.",
        "effects": {
          "money": -5000000
        },
        "result": "1회차 기술료만 우선 납부했습니다."
      }
    ]
  },
  {
    "id": "grant_officer_change",
    "category": "grant",
    "title": "전담기관 간사 교체로 인한 서류 15종 재제출",
    "text": "\"전담기관 담당 간사가 바뀌었습니다. 신임 간사가 이전 승인 내역을 인정하지 못하겠다며 과거 모든 영수증과 비교견적서를 다시 요구합니다.\"",
    "trigger": {
      "minMonth": 8,
      "chancePerMonth": 0.1,
      "cooldownMonths": 10,
      "require": "flags.hasGrant"
    },
    "choices": [
      {
        "label": "[A] 밤새워 모든 서류 재편철 제출",
        "desc": "행정직원과 함께 주말을 반납하고 서류를 다시 만듭니다.",
        "effects": {
          "burnout": 15,
          "ceoStress": 15
        },
        "result": "신임 간사의 승인을 받아내고 정산 통장을 정상화했습니다."
      },
      {
        "label": "[B] 전임 간사의 공식 결재 공문 제시하며 항의",
        "desc": "행정 절차의 부당함을 지적합니다.",
        "outcomes": [
          {
            "chance": 0.5,
            "effects": {
              "reputation": 5
            },
            "result": "팀장이 개입하여 이전 결재를 그대로 인정받았습니다."
          },
          {
            "chance": 0.5,
            "effects": {
              "ceoStress": 20,
              "modifier": {
                "stat": "allIncome",
                "mul": 0.9,
                "months": 1
              }
            },
            "result": "간사의 보복성 정산 보류로 1달간 집행이 동결되었습니다."
          }
        ]
      }
    ]
  },
  {
    "id": "grant_whistleblower",
    "category": "grant",
    "title": "연구개발비 부정사용 투서 특별감사",
    "text": "\"퇴사자가 국민권익위에 귀사가 연구개발비로 법인 비품을 부당 집행했다는 투서를 접수하여 감사가 착수되었습니다.\"",
    "trigger": {
      "minMonth": 12,
      "chancePerMonth": 0.07,
      "cooldownMonths": 14,
      "require": "flags.hadEmployees && flags.hasGrant"
    },
    "choices": [
      {
        "label": "[A] 감사원 전담 회계사 입회 하에 전수 실사",
        "desc": "500만원 감사 수임료를 내고 무결성을 입증합니다.",
        "cost": 5000000,
        "effects": {
          "reputation": 10,
          "ceoStress": 15
        },
        "result": "단순 착오 50만원만 반납하고 무혐의 종결되었습니다."
      },
      {
        "label": "[B] 경고 처분 및 소액 환수 수용",
        "desc": "행정 소모를 줄이기 위해 800만원을 환수당하고 끝냅니다.",
        "effects": {
          "money": -8000000,
          "creditScore": -10
        },
        "result": "경고 처분을 받고 사건이 종결되었습니다."
      }
    ]
  },
  {
    "id": "sanction_hearing_notice",
    "category": "grant",
    "title": "정부과제 제재조치위원회 출석 통보",
    "text": "\"과거 불성실 수행 판정 건에 대해 사업 참여제한 및 환수액 결정을 위한 제재조치위원회 출석 요구서가 발송되었습니다.\"",
    "trigger": {
      "minMonth": 15,
      "chancePerMonth": 0.06,
      "cooldownMonths": 18,
      "require": "flags.auditCaught"
    },
    "choices": [
      {
        "label": "[A] 대표가 직접 눈물로 갱생 의지 호소",
        "desc": "스타트업의 현실적 고충을 읍소하며 선처를 구합니다.",
        "outcomes": [
          {
            "chance": 0.7,
            "effects": {
              "ceoStress": 15,
              "money": -10000000
            },
            "result": "참여제한은 면제되고 환수금 1,000만원 감경 처분으로 선처되었습니다."
          },
          {
            "chance": 0.3,
            "effects": {
              "flags.govBanned": true,
              "money": -25000000
            },
            "result": "참여제한 2년 및 2,500만원 환수가 확정되었습니다."
          }
        ]
      },
      {
        "label": "[B] 행정전문 로펌 동행 출석",
        "desc": "천만원을 들여 전문 변호사와 함께 나갑니다.",
        "cost": 10000000,
        "effects": {
          "flags.govBanned": false
        },
        "result": "절차상 하자를 파고들어 제재 처분을 완전히 기각시켰습니다!"
      }
    ]
  },
  {
    "id": "ceo_minus_loan_maturity",
    "category": "finance",
    "title": "대표이사 마이너스 통장 만기 연장일",
    "text": "\"직원 월급과 서버 부품비 메꾸느라 한도까지 쓴 5,000만원 마통의 1년 만기일입니다. 은행에서 연장 심사를 진행합니다.\"",
    "trigger": {
      "minMonth": 6,
      "chancePerMonth": 0.12,
      "cooldownMonths": 12
    },
    "choices": [
      {
        "label": "[A] 신보 청년창업 대출로 대환 대출",
        "desc": "정책자금으로 마통을 갚고 월 이자를 절감합니다.",
        "effects": {
          "creditScore": 15,
          "ceoStress": -5
        },
        "result": "저금리 정책 대출로 대환 완료! 월 이자 부담이 줄었습니다."
      },
      {
        "label": "[B] 보유 암호화폐 긴급 시장가 매도하여 상환",
        "desc": "코인 지갑을 털어 빚을 청산합니다.",
        "effects": {
          "money": 15000000,
          "creditScore": 25
        },
        "result": "코인을 현금화하여 마통을 전액 완제했습니다. 신용점수가 크게 상승합니다."
      }
    ]
  },
  {
    "id": "vc_lowball",
    "category": "finance",
    "title": "혹한기 VC의 밸류 후려치기",
    "text": "\"대표님 IR 인상 깊었습니다. 당초 50억 밸류 부르셨는데, 요즘 시장 아시죠? 15억 밸류로 3억 투자 들어가겠습니다.\"",
    "trigger": {
      "minMonth": 6,
      "chancePerMonth": 0.1,
      "cooldownMonths": 12,
      "require": "totalTflops >= 60"
    },
    "choices": [
      {
        "label": "[A] 굴욕을 참고 도장 찍기 (런웨이 연장)",
        "desc": "생존을 위해 지분 20%를 넘기고 3억원을 유치합니다.",
        "effects": {
          "money": 300000000,
          "ceoEquity": -20,
          "reputation": 10
        },
        "result": "투자금 3억원이 입금되었습니다! 런웨이가 대폭 연장되었습니다."
      },
      {
        "label": "[B] \"우리 가치를 모르는 곳과는 안 합니다\" 거절",
        "desc": "자립 성장을 고수합니다.",
        "effects": {
          "ceoStress": 10,
          "creditScore": 10
        },
        "result": "투자는 결렬되었으나 대표의 프라이드와 지분을 지켰습니다."
      }
    ]
  },
  {
    "id": "shinbo_guarantee_extension",
    "category": "finance",
    "title": "신용보증기금 보증서 1년 연장 심사",
    "text": "\"신보 지점 담당자가 작년 매출 지표와 GPU 가동 내역을 점검하며 보증 연장 심사를 시작했습니다.\"",
    "trigger": {
      "minMonth": 11,
      "chancePerMonth": 0.1,
      "cooldownMonths": 12,
      "require": "loans.length >= 1"
    },
    "choices": [
      {
        "label": "[A] 성실한 경영 지표 브리핑",
        "desc": "월간 손익계산서와 가동률 지표를 제출합니다.",
        "outcomes": [
          {
            "chance": 0.8,
            "effects": {
              "creditScore": 15
            },
            "result": "보증서 1년 무사고 연장 완료! 금리도 0.3%p 인하되었습니다."
          },
          {
            "chance": 0.2,
            "effects": {
              "money": -5000000,
              "ceoStress": 10
            },
            "result": "매출 부진으로 보증 한도가 500만원 축소되어 일부 상환했습니다."
          }
        ]
      },
      {
        "label": "[B] 보증 대출 전액 조기 상환",
        "desc": "보유 현금으로 대출금을 완제합니다.",
        "effects": {
          "money": -30000000,
          "creditScore": 40
        },
        "result": "신보 보증 대출을 전액 완제했습니다! 기업 신용등급이 수직 상승합니다."
      }
    ]
  },
  {
    "id": "vc_term_sheet_poison",
    "category": "finance",
    "title": "VC 텀싯(Term Sheet)의 독소조항 발견",
    "text": "\"투자사에서 보낸 5억원 투자 계약서에 대표이사 개인 연대보증과 가혹한 위약벌(연 15%) 조항이 숨어 있습니다.\"",
    "trigger": {
      "minMonth": 9,
      "chancePerMonth": 0.09,
      "cooldownMonths": 12,
      "require": "totalTflops >= 80"
    },
    "choices": [
      {
        "label": "[A] 스타트업 전문 변호사 통해 독소조항 삭제 협상",
        "desc": "자문료 200만원을 들여 표준 계약서로 수정을 요구합니다.",
        "cost": 2000000,
        "outcomes": [
          {
            "chance": 0.7,
            "effects": {
              "money": 500000000,
              "ceoEquity": -15
            },
            "result": "협상 성공! 독소조항을 뺀 깔끔한 조건으로 5억원 투자 유치 완료!"
          },
          {
            "chance": 0.3,
            "effects": {
              "ceoStress": 10
            },
            "result": "VC가 수정을 거부하며 투자가 무산되었습니다."
          }
        ]
      },
      {
        "label": "[B] 급전이 필요하니 조건 그대로 날인",
        "desc": "위험을 감수하고 즉시 5억원을 받습니다.",
        "effects": {
          "money": 500000000,
          "ceoEquity": -15,
          "ceoStress": 25,
          "flags.toxicVcSigned": true
        },
        "result": "5억원이 입금되었으나 대표이사 개인에게 무거운 연대보증 족쇄가 채워졌습니다."
      }
    ]
  },
  {
    "id": "safe_investment_offer",
    "category": "finance",
    "title": "실리콘밸리식 SAFE(조건부지분인수계약) 제안",
    "text": "\"선배 창업가가 기업가치 산정을 다음 라운드로 미루고 1억원을 먼저 수혈해 주겠다는 SAFE 투자를 제안했습니다.\"",
    "trigger": {
      "minMonth": 5,
      "chancePerMonth": 0.08,
      "cooldownMonths": 10
    },
    "choices": [
      {
        "label": "[A] SAFE 계약 수락 (1억원 유치)",
        "desc": "지분 희석 없이 빠른 자금을 확보합니다.",
        "effects": {
          "money": 100000000,
          "reputation": 10
        },
        "result": "1억원이 즉시 통장에 꽂혔습니다! 다음 투자 라운드까지 든든합니다."
      },
      {
        "label": "[B] 정중히 거절 (자체 매출로 승부)",
        "desc": "외부 자금 없이 자생합니다.",
        "effects": {
          "ceoStress": -5
        },
        "result": "투자를 고사하고 자체 캐시플로우에 집중하기로 했습니다."
      }
    ]
  },
  {
    "id": "rcps_early_redemption",
    "category": "finance",
    "title": "투자사의 RCPS 상환 청구 압박",
    "text": "\"상환전환우선주(RCPS) 보유 투자사가 경기 침체를 이유로 원금 상환을 요청하며 내용증명을 보내왔습니다.\"",
    "trigger": {
      "minMonth": 18,
      "chancePerMonth": 0.07,
      "cooldownMonths": 14,
      "require": "flags.toxicVcSigned"
    },
    "choices": [
      {
        "label": "[A] 법정 배당가능이익 부존재로 상환 거부",
        "desc": "상법상 배당가능이익이 없으면 상환 의무가 없음을 통보합니다.",
        "effects": {
          "reputation": -10,
          "ceoStress": 15
        },
        "result": "법적으로 상환을 방어했으나 투자사와의 관계가 냉각되었습니다."
      },
      {
        "label": "[B] 일부 자금 합의 상환 및 지분 소각",
        "desc": "분쟁을 막기 위해 5,000만원을 상환합니다.",
        "effects": {
          "money": -50000000,
          "ceoEquity": 5
        },
        "result": "지분을 되사오며 분쟁을 종결했습니다."
      }
    ]
  },
  {
    "id": "angel_investor_drinking",
    "category": "finance",
    "title": "엔젤투자자의 취중 심야 전화 간섭",
    "text": "\"초기에 3,000만원 투자한 개인 엔젤이 만취한 채 새벽 1시에 전화를 걸어 왜 주가가 안 오르냐며 경영 간섭을 합니다.\"",
    "trigger": {
      "minMonth": 4,
      "chancePerMonth": 0.1,
      "cooldownMonths": 8
    },
    "choices": [
      {
        "label": "[A] 1시간 동안 맞장구치며 달래기",
        "desc": "투자자의 자존심을 세워주며 스트레스를 감내합니다.",
        "effects": {
          "ceoStress": 12,
          "reputation": 5
        },
        "result": "엔젤이 만족하며 전화를 끊었습니다. 다음 날 미안하다며 홍삼 세트를 보내왔습니다."
      },
      {
        "label": "[B] 단호하게 업무시간 외 연락 자제 요청",
        "desc": "프로페셔널한 경계를 긋습니다.",
        "outcomes": [
          {
            "chance": 0.6,
            "effects": {
              "ceoStress": -5
            },
            "result": "엔젤이 사과하며 이후 야간 연락이 끊겼습니다."
          },
          {
            "chance": 0.4,
            "effects": {
              "reputation": -5
            },
            "result": "엔젤이 삐져서 업계에 대표가 건방지다는 소문을 냈습니다."
          }
        ]
      }
    ]
  },
  {
    "id": "runway_three_months_panic",
    "category": "finance",
    "title": "런웨이 3개월 미만 진입! 비상경영 선포",
    "text": "\"통장 잔고가 급격히 줄어들어 현재 지출 속도로는 딱 2.5개월 뒤 잔고가 0이 됩니다. 결단이 필요합니다!\"",
    "trigger": {
      "chancePerMonth": 0.2,
      "cooldownMonths": 6,
      "require": "money < 6000000 && month >= 4"
    },
    "choices": [
      {
        "label": "[A] 대표 급여 0원 선언 & 경비 전면 동결",
        "desc": "대표가 솔선수범하여 지출을 극단적으로 줄입니다.",
        "effects": {
          "ceoStress": 15,
          "ceoHealth": -5,
          "money": 3000000
        },
        "result": "비상경영 돌입으로 런웨이를 1개월 더 벌었습니다."
      },
      {
        "label": "[B] 보유 GPU 일부 긴급 당근 매각",
        "desc": "장비를 현금화하여 인건비 통장을 채웁니다.",
        "effects": {
          "money": 8000000,
          "breakRandomGpu": 1
        },
        "result": "장비를 처분해 급한 불을 껐습니다."
      }
    ]
  },
  {
    "id": "senior_dev_escape",
    "category": "hr",
    "title": "시니어 AI 개발자 판교 탈주",
    "text": "\"대표님... 드릴 말씀이 있습니다. 판교 카카오 계열사에서 연봉 2배랑 스톡옵션 준다고 해서 이직하려고 합니다.\"",
    "trigger": {
      "minMonth": 5,
      "chancePerMonth": 0.1,
      "cooldownMonths": 12,
      "require": "employees.length >= 1"
    },
    "choices": [
      {
        "label": "[A] 스톡옵션 5% 쥐어주며 붙잡기",
        "desc": "지분을 떼어주고 핵심 인력을 지킵니다.",
        "effects": {
          "ceoEquity": -5,
          "morale": 10
        },
        "result": "시니어 개발자가 잔류를 결정했습니다! 팀 사기가 오릅니다."
      },
      {
        "label": "[B] 쿨하게 퇴사 승인 및 인수인계",
        "desc": "축하해주며 보내줍니다.",
        "effects": {
          "modifier": {
            "stat": "cloudIncome",
            "mul": 0.7,
            "months": 1
          }
        },
        "result": "1달간 인수인계 공백으로 연산 효율이 일시 저하되었습니다."
      }
    ]
  },
  {
    "id": "labor_52hours_report",
    "category": "hr",
    "title": "근로기준법 52시간제 위반 투서",
    "text": "\"대표님이 주말마다 슬랙으로 서버 확인하라고 시킵니다. 퇴사한 직원이 노동청에 익명 진정서를 제출했습니다.\"",
    "trigger": {
      "minMonth": 6,
      "chancePerMonth": 0.08,
      "cooldownMonths": 12,
      "require": "flags.hadEmployees"
    },
    "choices": [
      {
        "label": "[A] 야근수당 전액 정산 및 합의",
        "desc": "1,200만원을 지급하고 진정을 취하시킵니다.",
        "effects": {
          "money": -12000000,
          "creditScore": 5
        },
        "result": "근로감독관 입회 하에 합의 종결되었습니다."
      },
      {
        "label": "[B] 포괄임금제 계약서로 맞대응",
        "desc": "서명된 계약서를 들고 노동청에 출석합니다.",
        "outcomes": [
          {
            "chance": 0.4,
            "effects": {
              "ceoStress": 15
            },
            "result": "행정지도 처분으로 과태료 없이 종결되었습니다."
          },
          {
            "chance": 0.6,
            "effects": {
              "money": -6000000,
              "creditScore": -20,
              "ceoStress": 20
            },
            "result": "포괄임금 위반 판정으로 벌금 600만원과 시정명령을 받았습니다."
          }
        ]
      }
    ]
  },
  {
    "id": "hr_burnout_sick_leave",
    "category": "hr",
    "title": "핵심 엔지니어 번아웃 응급실행",
    "text": "\"새벽 장애 대응을 전담하던 인프라 엔지니어가 과로와 공황장애로 응급실에 실려갔습니다. 2주 병가를 요청합니다.\"",
    "trigger": {
      "minMonth": 4,
      "chancePerMonth": 0.12,
      "cooldownMonths": 8,
      "require": "employees.length >= 1"
    },
    "choices": [
      {
        "label": "[A] 유급휴가 2주 + 치료비 150만원 지원",
        "desc": "인간적인 대표의 모습을 보여줍니다.",
        "cost": 1500000,
        "effects": {
          "morale": 20,
          "burnout": -30
        },
        "result": "전 직원이 감동했습니다. 팀 사기가 크게 올라 충성도가 단단해집니다."
      },
      {
        "label": "[B] 무급휴가 승인 및 대체 외주 투입",
        "desc": "법정 기준대로 무급 처리합니다.",
        "effects": {
          "morale": -15,
          "burnout": -10
        },
        "result": "직원들의 사기가 저하되고 동요가 일어났습니다."
      }
    ]
  },
  {
    "id": "hr_blind_review_leak",
    "category": "hr",
    "title": "블라인드·잡플래닛 1.2점 폭로글 테러",
    "text": "\"잡플래닛에 \"대표가 조울증이고 야근 강요하는 ㅈ소 스타트업\"이라는 1점짜리 장문의 폭로 리뷰가 올라왔습니다!\"",
    "trigger": {
      "minMonth": 7,
      "chancePerMonth": 0.09,
      "cooldownMonths": 10,
      "require": "flags.hadEmployees"
    },
    "choices": [
      {
        "label": "[A] 사내 간담회 열고 복지 개선 발표",
        "desc": "직원들의 불만을 경청하고 복지 예산을 늘립니다.",
        "cost": 3000000,
        "effects": {
          "morale": 15,
          "reputation": 5
        },
        "result": "솔직한 소통으로 사내 분위기가 반전되었습니다."
      },
      {
        "label": "[B] 잡플래닛에 명예훼손 권리침해 중단 신청",
        "desc": "리뷰 블라인드 처리를 요청합니다.",
        "effects": {
          "ceoStress": 10,
          "reputation": -10
        },
        "result": "게시글은 가려졌으나 블라인드에 \"게시물 삭제나 하는 회사\"라고 2차 박제되었습니다."
      }
    ]
  },
  {
    "id": "cofounder_equity_fight",
    "category": "hr",
    "title": "초기 창업멤버 간의 지분 싸움",
    "text": "\"공동창업자 CTO가 \"내가 아키텍처 다 짰는데 왜 대표님 지분이 70%냐\"며 지분 재조정을 요구하며 출근을 거부했습니다.\"",
    "trigger": {
      "minMonth": 6,
      "chancePerMonth": 0.08,
      "cooldownMonths": 14,
      "require": "ceoEquity >= 50"
    },
    "choices": [
      {
        "label": "[A] 지분 10% 떼어주고 달래기",
        "desc": "회사의 안정을 위해 지분을 양보합니다.",
        "effects": {
          "ceoEquity": -10,
          "morale": 10
        },
        "result": "CTO가 복귀하여 개발이 정상화되었습니다."
      },
      {
        "label": "[B] \"나갈 거면 나가라\" 결별 선언",
        "desc": "지분 방어를 위해 결별합니다.",
        "effects": {
          "money": -15000000,
          "ceoStress": 20
        },
        "result": "CTO가 퇴사하여 소스코드 인계 공백을 메우느라 외주 개발비 1,500만원이 깨졌습니다."
      }
    ]
  },
  {
    "id": "hr_intern_conversion",
    "category": "hr",
    "title": "청년인턴 정규직 전환 평가일",
    "text": "\"정부 인건비 지원을 받던 잡부 인턴의 3개월 수습이 끝났습니다. 정규직 전환을 기대하며 눈망울을 반짝입니다.\"",
    "trigger": {
      "minMonth": 5,
      "chancePerMonth": 0.12,
      "cooldownMonths": 6,
      "require": "employees.length >= 1"
    },
    "choices": [
      {
        "label": "[A] 정규직 전환 및 청년일자리 도약장려금 신청",
        "desc": "정규직으로 채용하고 월 60만원 정부 지원금을 연계합니다.",
        "effects": {
          "morale": 15,
          "reputation": 5
        },
        "result": "열정적인 정규직 주니어 엔지니어가 탄생했습니다!"
      },
      {
        "label": "[B] 계약 만료 후 작별",
        "desc": "인건비 절감을 위해 계약을 종료합니다.",
        "effects": {
          "morale": -5,
          "ceoStress": 5
        },
        "result": "인턴이 섭섭해하며 짐을 쌌습니다."
      }
    ]
  },
  {
    "id": "military_rnd_privilege",
    "category": "hr",
    "title": "병역특례(전문연구요원) 배정 심사",
    "text": "\"병무청에서 2026년도 IT 중소기업 전문연구요원 TO 배정 심사를 개시했습니다. 석사급 엘리트 개발자를 군대 대신 채용할 기회입니다.\"",
    "trigger": {
      "calendarMonth": 10,
      "cooldownMonths": 11,
      "require": "flags.hasRndLab && flags.ventureCertified"
    },
    "choices": [
      {
        "label": "[A] 병특 배정 신청서 및 기술실적서 제출",
        "desc": "행정 서류를 철저히 갖춰 접수합니다.",
        "effects": {
          "reputation": 15,
          "flags.hasMilitaryTo": true
        },
        "result": "전문연구요원 1명 배정 확정! 최고 수준의 AI 석사 인력을 저렴한 연봉으로 확보할 길이 열렸습니다."
      },
      {
        "label": "[B] 신청 포기 (행정 부담)",
        "desc": "복잡한 복무관리 실태조사가 부담스러워 포기합니다.",
        "effects": {
          "ceoStress": -5
        },
        "result": "병역특례 지정을 신청하지 않았습니다."
      }
    ]
  },
  {
    "id": "dev_poaching_competitor",
    "category": "hr",
    "title": "퇴사한 개발자의 경쟁사 이직 및 인력 유출",
    "text": "\"지난달 나간 개발자가 옆 동네 경쟁 클라우드사로 가더니 우리 팀 주니어 2명에게 이직 바람을 넣고 있습니다!\"",
    "trigger": {
      "minMonth": 10,
      "chancePerMonth": 0.08,
      "cooldownMonths": 12,
      "require": "employees.length >= 2"
    },
    "choices": [
      {
        "label": "[A] 전직금지 가처분 내용증명 발송",
        "desc": "입사 시 작성한 경업금지 서약서를 근거로 경고합니다.",
        "cost": 2000000,
        "effects": {
          "reputation": -5,
          "ceoStress": 10
        },
        "result": "경쟁사가 주춤하며 인력 빼가기를 중단했습니다."
      },
      {
        "label": "[B] 전 직원 면담 및 연봉 10% 일괄 인상",
        "desc": "처우 개선으로 직원들의 마음을 잡습니다.",
        "effects": {
          "morale": 25,
          "money": -5000000
        },
        "result": "직원들이 감동하여 회사에 남기로 결의했습니다!"
      }
    ]
  },
  {
    "id": "kepco_summer_peak",
    "category": "infra",
    "title": "한전 여름철 전력 피크 경고",
    "text": "\"8월 폭염경보 발령! 낮 2시~5시 전력 최대부하 피크 요율이 3배 적용된다는 한전 안내장이 날아왔습니다.\"",
    "trigger": {
      "calendarMonth": [
        7,
        8
      ],
      "cooldownMonths": 10
    },
    "choices": [
      {
        "label": "[A] 피크 시간대 GPU 50% 절전 모드",
        "desc": "수익을 일부 포기하고 전기세 폭탄을 방어합니다.",
        "effects": {
          "modifier": {
            "stat": "allIncome",
            "mul": 0.65,
            "months": 1
          }
        },
        "result": "전기요금 폭탄을 무사히 피했습니다."
      },
      {
        "label": "[B] 풀가동 강행 (고객 계약이 우선)",
        "desc": "연산력을 100% 유지합니다.",
        "effects": {
          "money": -8000000,
          "reputation": 10
        },
        "result": "SLA는 지켰으나 이번 달 전기요금 고지서에 800만원이 찍혀 나왔습니다."
      }
    ]
  },
  {
    "id": "ac_water_leak",
    "category": "infra",
    "title": "서버실 에어컨 배관 누수 사고",
    "text": "\"천장형 에어컨 응축수 배관이 터져 랙 상단 GPU 서버 위로 물이 뚝뚝 떨어지고 있습니다!\"",
    "trigger": {
      "minMonth": 3,
      "chancePerMonth": 0.1,
      "cooldownMonths": 8
    },
    "choices": [
      {
        "label": "[A] 즉시 메인 차단기 내리고 분해 건조",
        "desc": "전체 서버를 일시 중지하고 안전을 확보합니다.",
        "effects": {
          "modifier": {
            "stat": "allIncome",
            "mul": 0.8,
            "months": 1
          }
        },
        "result": "하드웨어 사망 0건으로 위기를 방어했습니다."
      },
      {
        "label": "[B] 수건 받치고 가동 유지",
        "desc": "셧다운 없이 버텨봅니다.",
        "outcomes": [
          {
            "chance": 0.5,
            "effects": {
              "reputation": 5
            },
            "result": "천운으로 장비가 젖지 않고 넘어갔습니다."
          },
          {
            "chance": 0.5,
            "effects": {
              "breakRandomGpu": 1,
              "money": -2000000
            },
            "result": "쇼트 발생! GPU 1대가 타버렸습니다!"
          }
        ]
      }
    ]
  },
  {
    "id": "dust_fire_alarm",
    "category": "infra",
    "title": "서버실 분진 화재경보기 오작동",
    "text": "\"서버 배기 열기와 미세먼지로 빌딩 화재감지기가 오작동하여 소방차 3대가 출동하고 건물 전체에 사이렌이 울렸습니다!\"",
    "trigger": {
      "minMonth": 4,
      "chancePerMonth": 0.1,
      "cooldownMonths": 8
    },
    "choices": [
      {
        "label": "[A] 소방관·관리소장에게 정중히 사과 및 청소",
        "desc": "과태료를 물고 원만히 해결합니다.",
        "effects": {
          "money": -1500000,
          "ceoStress": 10
        },
        "result": "빌딩 퇴거 위기를 겨우 모면했습니다."
      },
      {
        "label": "[B] 전문 덕트 및 공조 헤파필터 시공",
        "desc": "근본적인 먼지와 기류 문제를 해결합니다.",
        "cost": 4500000,
        "effects": {
          "reputation": 5
        },
        "result": "서버실 공기질이 완벽해졌습니다. 화재경보 오작동 리스크가 영구 제거되었습니다."
      }
    ]
  },
  {
    "id": "kakao_idc_fire_aftermath",
    "category": "infra",
    "title": "판교 데이터센터 화재 여파 긴급 규제 점검",
    "text": "\"대형 데이터센터 화재 사건으로 과기정통부와 소방청이 민간 클러스터에 대한 리튬 배터리 및 무정전전원(UPS) 긴급 점검을 나왔습니다.\"",
    "trigger": {
      "minMonth": 8,
      "chancePerMonth": 0.08,
      "cooldownMonths": 14
    },
    "choices": [
      {
        "label": "[A] 방화벽 및 자동소화설비 보강 공사",
        "desc": "규제 기준에 맞춰 소방설비를 증설합니다.",
        "cost": 6000000,
        "effects": {
          "reputation": 15,
          "creditScore": 10
        },
        "result": "소방청 우수 안전 사업장 인증을 획득했습니다."
      },
      {
        "label": "[B] 시정권고 기한까지 버티기",
        "desc": "비용을 아끼기 위해 버팁니다.",
        "outcomes": [
          {
            "chance": 0.7,
            "effects": {
              "ceoStress": 10
            },
            "result": "추가 점검 없이 무사히 지나갔습니다."
          },
          {
            "chance": 0.3,
            "effects": {
              "money": -10000000,
              "reputation": -10
            },
            "result": "불시 재점검에 걸려 시정명령 과태료 1,000만원을 맞았습니다."
          }
        ]
      }
    ]
  },
  {
    "id": "kepco_substation_outage",
    "category": "infra",
    "title": "한전 변전소 정기점검 6시간 단전 통보",
    "text": "\"한국전력공사에서 공문을 보냈습니다. 관내 변전소 보수로 인해 이번 주 일요일 새벽 1시부터 7시까지 전면 단전됩니다.\"",
    "trigger": {
      "minMonth": 7,
      "chancePerMonth": 0.08,
      "cooldownMonths": 12
    },
    "choices": [
      {
        "label": "[A] 이동식 비상발전차량 긴급 임차",
        "desc": "300만원을 들여 디젤 발전차량을 대기시킵니다.",
        "cost": 3000000,
        "effects": {
          "reputation": 15
        },
        "result": "단전 중에도 무정전 가동에 성공! 고객들의 찬사가 쏟아집니다."
      },
      {
        "label": "[B] 고객 사전 공지 후 점검 시간대 셧다운",
        "desc": "서버를 안전하게 끄고 휴식을 취합니다.",
        "effects": {
          "modifier": {
            "stat": "cloudIncome",
            "mul": 0.9,
            "months": 1
          },
          "ceoStress": -5
        },
        "result": "고객들에게 양해를 구하고 점검을 마쳤습니다."
      }
    ]
  },
  {
    "id": "water_cooling_fitting_leak",
    "category": "infra",
    "title": "수랭 커스텀 쿨러 피팅 미세 누수 발견",
    "text": "\"서버 랙 점검 도중 피팅 결합부에서 냉각수 한 방울이 떨어지는 것을 기적적으로 발견했습니다!\"",
    "trigger": {
      "minMonth": 5,
      "chancePerMonth": 0.09,
      "cooldownMonths": 10,
      "require": "totalTflops >= 50"
    },
    "choices": [
      {
        "label": "[A] 전 라인 정품 금속 피팅 전면 교체",
        "desc": "부품비 180만원을 들여 배관을 강화합니다.",
        "cost": 1800000,
        "effects": {
          "reputation": 5
        },
        "result": "누수 위험을 원천 차단했습니다."
      },
      {
        "label": "[B] 방수 테이프로 임시 보강 후 관찰",
        "desc": "비용을 아낍니다.",
        "outcomes": [
          {
            "chance": 0.6,
            "effects": {
              "ceoStress": 10
            },
            "result": "다행히 추가 누수 없이 버텼습니다."
          },
          {
            "chance": 0.4,
            "effects": {
              "damageRandomGpu": {
                "count": 2,
                "damage": 50
              },
              "money": -1000000
            },
            "result": "압력을 못 이겨 터졌습니다! GPU 2대에 냉각수가 튀어 내구도가 반토막 났습니다."
          }
        ]
      }
    ]
  },
  {
    "id": "free_cooling_efficiency_drop",
    "category": "infra",
    "title": "여름철 외기냉방 효율 급감 찜통 서버실",
    "text": "\"외부 온도가 35도를 넘어서며 외기 프리쿨링(외기냉방)이 완전히 마비되었습니다. 실내 온도가 88도를 향해 폭주합니다!\"",
    "trigger": {
      "calendarMonth": [
        7,
        8
      ],
      "cooldownMonths": 10,
      "require": "totalTflops >= 60"
    },
    "choices": [
      {
        "label": "[A] 산업용 이동식 스팟 에어컨 긴급 렌탈",
        "desc": "월 200만원에 스팟 쿨러 3대를 긴급 투입합니다.",
        "cost": 2000000,
        "effects": {
          "ceoStress": -5
        },
        "result": "서버실 온도를 70도대로 다시 안정시켰습니다."
      },
      {
        "label": "[B] 연산 클럭을 낮추는 언더클럭 단체 적용",
        "desc": "소프트웨어로 발열을 억제합니다.",
        "effects": {
          "modifier": {
            "stat": "tflops",
            "mul": 0.8,
            "months": 1
          }
        },
        "result": "장비 손상 없이 폭염 기간을 넘겼습니다."
      }
    ]
  },
  {
    "id": "basement_flood_warning",
    "category": "infra",
    "title": "게릴라성 폭우 장마철 침수 위험 경보",
    "text": "\"시간당 80mm의 기록적 폭우로 지식산업센터 지하 기계실과 주차장에 빗물이 역류하기 시작했습니다!\"",
    "trigger": {
      "calendarMonth": 7,
      "cooldownMonths": 11,
      "require": "offices.length >= 2"
    },
    "choices": [
      {
        "label": "[A] 전 직원 모래주머니 설치 및 밤샘 배수 작업",
        "desc": "서버실 입구에 차수벽을 세우고 양수기를 돌립니다.",
        "effects": {
          "burnout": 20,
          "ceoStress": 15,
          "money": -500000
        },
        "result": "서버실 안으로 단 한 방울의 물도 침투하지 못했습니다!"
      },
      {
        "label": "[B] 빌딩 관리사무소에 전적 의존",
        "desc": "자체 대응을 생략합니다.",
        "outcomes": [
          {
            "chance": 0.7,
            "effects": {
              "ceoStress": 10
            },
            "result": "빌딩 배수 펌프가 제때 돌아가 침수를 면했습니다."
          },
          {
            "chance": 0.3,
            "effects": {
              "money": -15000000,
              "breakRandomGpu": 2
            },
            "result": "바닥 배선이 침수되어 랙 하단 GPU 2대가 쇼트로 사망했습니다!"
          }
        ]
      }
    ]
  },
  {
    "id": "grad_student_finals_rush",
    "category": "market",
    "title": "공대 대학원생들의 기말고사 렌탈 러시",
    "text": "\"6월·12월 학기말 논문 마감 시즌! 전국 컴퓨터공학과 대학원생들이 딥러닝 과제용 GPU를 찾지 못해 아우성입니다.\"",
    "trigger": {
      "calendarMonth": [
        6,
        12
      ],
      "cooldownMonths": 5
    },
    "choices": [
      {
        "label": "[A] 시간당 단가 2.5배 탄력 요금제 인상",
        "desc": "물 들어올 때 노를 젓습니다.",
        "effects": {
          "money": 12000000,
          "reputation": -10
        },
        "result": "단기 대박 수익을 올렸으나 대학원 커뮤니티에 바가지 업체로 박제되었습니다."
      },
      {
        "label": "[B] 학생 인증 시 10% 할인 프로모션",
        "desc": "미래의 잠재 고객들을 충성 고객으로 만듭니다.",
        "effects": {
          "money": 5000000,
          "reputation": 20
        },
        "result": "대학원 랩실에 입소문이 퍼지며 장기 단골 유저 풀을 확보했습니다!"
      }
    ]
  },
  {
    "id": "opensource_llama",
    "category": "market",
    "title": "메타(Meta) 차세대 오픈소스 AI 무료 공개",
    "text": "\"메타에서 초고성능 오픈소스 모델을 무료로 기습 배포했습니다! 기존 상용 AI 모델들의 시장 가치가 출렁입니다.\"",
    "trigger": {
      "minMonth": 6,
      "chancePerMonth": 0.08,
      "cooldownMonths": 12
    },
    "choices": [
      {
        "label": "[A] 신규 모델 당일 서빙 최적화(vLLM) 배포",
        "desc": "발 빠르게 새 오픈소스 모델을 인프라에 얹어 서비스합니다.",
        "effects": {
          "money": 8000000,
          "reputation": 15
        },
        "result": "국내 최초 당일 서빙 성공! 신규 AI 스타트업 고객들이 대거 유입되었습니다."
      },
      {
        "label": "[B] 기존 모델 성능 우위 마케팅 집행",
        "desc": "자체 튜닝 모델의 특화성을 강조합니다.",
        "cost": 3000000,
        "effects": {
          "reputation": 5
        },
        "result": "기존 고객 이탈을 성공적으로 방어했습니다."
      }
    ]
  },
  {
    "id": "bigtech_price_war",
    "category": "market",
    "title": "빅테크 클라우드의 단가 인하 치킨게임",
    "text": "\"대기업 계열 클라우드가 정부 바우처 예산을 등에 업고 GPU 시간당 렌탈비를 반값으로 덤핑 공세 시작했습니다!\"",
    "trigger": {
      "minMonth": 7,
      "chancePerMonth": 0.08,
      "cooldownMonths": 12,
      "require": "totalTflops >= 60"
    },
    "choices": [
      {
        "label": "[A] 맞불 단가 인하로 시장 점유율 방어",
        "desc": "마진을 줄이고 고객 이탈을 막습니다.",
        "effects": {
          "modifier": {
            "stat": "cloudIncome",
            "mul": 0.7,
            "months": 2
          },
          "reputation": 5
        },
        "result": "고객 이탈은 막았으나 수익성이 일시적으로 악화되었습니다."
      },
      {
        "label": "[B] \"한국어 엔지니어 1:1 슬랙 직통 지원\" 프리미엄 특화",
        "desc": "대기업이 못하는 밀착 엔지니어링 지원으로 차별화합니다.",
        "effects": {
          "reputation": 15,
          "ceoStress": 10
        },
        "result": "고객들이 감동하며 단가 인하 없이도 충성도를 유지했습니다!"
      }
    ]
  },
  {
    "id": "enterprise_receivable_delay",
    "category": "market",
    "title": "거대 고객사 용역 대금 90일 어음 결제 지연",
    "text": "\"납품을 마친 중견 SI 기업이 결제 대금 4,000만원을 현금 대신 90일 만기 어음으로 끊어주겠다고 일방 통보해왔습니다!\"",
    "trigger": {
      "minMonth": 9,
      "chancePerMonth": 0.09,
      "cooldownMonths": 10,
      "require": "totalTflops >= 80"
    },
    "choices": [
      {
        "label": "[A] 은행 할인(깡)으로 현금화 (할인료 7%)",
        "desc": "수수료를 떼이더라도 즉시 현금을 회수합니다.",
        "effects": {
          "money": 37200000,
          "ceoStress": 5
        },
        "result": "할인료 280만원을 떼이고 현금을 확보해 흑자도산 위기를 넘겼습니다."
      },
      {
        "label": "[B] 공정거래위원회 불공정 하도급 신고",
        "desc": "원칙대로 현금 결제를 요구하며 맞섭니다.",
        "outcomes": [
          {
            "chance": 0.6,
            "effects": {
              "money": 40000000,
              "creditScore": 10
            },
            "result": "원사업자가 놀라 현금으로 전액 이체했습니다!"
          },
          {
            "chance": 0.4,
            "effects": {
              "reputation": -15,
              "ceoStress": 20
            },
            "result": "업계에 까다로운 업체로 찍히며 해당 고객사와 거래가 끊겼습니다."
          }
        ]
      }
    ]
  },
  {
    "id": "render_farm_emergency_order",
    "category": "market",
    "title": "VFX 3D 영화 제작사의 밤샘 렌더팜 독점 긴급 발주",
    "text": "\"개봉을 앞둔 SF 영화 제작사에서 CG 렌더링 마감 시한이 임박했다며 오늘 밤 전체 GPU를 3일간 독점 임대하겠다고 거액을 제시했습니다!\"",
    "trigger": {
      "minMonth": 4,
      "chancePerMonth": 0.1,
      "cooldownMonths": 8,
      "require": "totalTflops >= 40"
    },
    "choices": [
      {
        "label": "[A] 일반 고객 양해 구하고 렌더팜 풀가동 수주",
        "desc": "3일간 렌더링에 올인하여 고수익을 챙깁니다.",
        "effects": {
          "money": 18000000,
          "reputation": 5,
          "modifier": {
            "stat": "heat",
            "mul": 1.25,
            "months": 1
          }
        },
        "result": "렌더링을 성공리에 끝마치고 1,800만원을 일시불 수령했습니다!"
      },
      {
        "label": "[B] 기존 스팟 고객 신뢰 유지를 위해 정중히 거절",
        "desc": "일반 렌탈 서비스를 유지합니다.",
        "effects": {
          "reputation": 10
        },
        "result": "기존 고객들에게 서비스 안정성에 대한 신뢰를 주었습니다."
      }
    ]
  },
  {
    "id": "ethereum_merge_pos",
    "category": "market",
    "title": "이더리움 머지(PoW 종료) 및 채굴 수익 급락",
    "text": "\"메이저 암호화폐가 지분증명(PoS)으로 전환되어 GPU 채굴 채산성이 하룻밤 사이에 폭락했습니다!\"",
    "trigger": {
      "minMonth": 5,
      "chancePerMonth": 0.08,
      "cooldownMonths": 18,
      "require": "workloadAlloc.crypto >= 20"
    },
    "choices": [
      {
        "label": "[A] 보유 GPU 전량을 AI 클라우드로 전환",
        "desc": "채굴 비중을 줄이고 AI 클라우드 비즈니스에 집중합니다.",
        "effects": {
          "modifier": {
            "stat": "cloudIncome",
            "mul": 1.2,
            "months": 3
          },
          "flags.aiPivoted": true
        },
        "result": "AI 전환 성공! 시대의 흐름에 맞춰 AI 인프라 기업으로 거듭났습니다."
      },
      {
        "label": "[B] 잡알트코인으로 갈아타서 버티기",
        "desc": "신규 PoW 코인을 찾아 채굴을 지속합니다.",
        "effects": {
          "modifier": {
            "stat": "cryptoIncome",
            "mul": 0.6,
            "months": 2
          }
        },
        "result": "수익성은 떨어졌으나 채굴기를 계속 돌립니다."
      }
    ]
  },
  {
    "id": "bitcoin_all_time_high",
    "category": "market",
    "title": "비트코인 10만 달러 돌파! 크립토 불장 개막",
    "text": "\"가상자산 시장이 폭발했습니다! 채굴 보상 가치가 폭등하고 채굴용 GPU 수요가 급증합니다.\"",
    "trigger": {
      "minMonth": 6,
      "chancePerMonth": 0.08,
      "cooldownMonths": 12
    },
    "choices": [
      {
        "label": "[A] 채굴 비중을 일시적으로 대폭 확대",
        "desc": "불장의 파도를 탑니다.",
        "effects": {
          "modifier": {
            "stat": "cryptoIncome",
            "mul": 2,
            "months": 2
          }
        },
        "result": "채굴 코인 수익이 2배로 폭증했습니다!"
      },
      {
        "label": "[B] 중고 그래픽카드 시세 폭등 때 일부 차익 실현 매각",
        "desc": "비싸진 GPU 1대를 최고가에 중고 처분합니다.",
        "effects": {
          "money": 6000000,
          "breakRandomGpu": 1
        },
        "result": "정점 가격에 GPU를 매각하여 목돈을 챙겼습니다."
      }
    ]
  },
  {
    "id": "enterprise_sla_penalty_scare",
    "category": "market",
    "title": "대기업 엔터프라이즈 SLA 위약금 청구 위기",
    "text": "\"통신망 장애로 지난달 가용률이 99.8%에 그쳤습니다. 고객사 법무팀에서 계약서상 SLA 위약금 2,000만원 청구서를 보냈습니다.\"",
    "trigger": {
      "minMonth": 10,
      "chancePerMonth": 0.08,
      "cooldownMonths": 12,
      "require": "totalTflops >= 100"
    },
    "choices": [
      {
        "label": "[A] 장애 원인 보고서 제출 및 크레딧 30% 보상 타협",
        "desc": "현금 배상 대신 다음 달 크레딧 할인으로 합의합니다.",
        "effects": {
          "modifier": {
            "stat": "corpIncome",
            "mul": 0.7,
            "months": 1
          },
          "reputation": 5
        },
        "result": "현금 유출 없이 파트너십을 지켜냈습니다."
      },
      {
        "label": "[B] 위약금 전액 즉시 송금 및 사과",
        "desc": "대기업과의 신뢰를 최우선으로 합니다.",
        "effects": {
          "money": -20000000,
          "reputation": 20,
          "creditScore": 10
        },
        "result": "대기업 C-Level에게 확실한 책임 경영 이미지를 각인시켰습니다."
      }
    ]
  },
  {
    "id": "danggeun_brick_scam",
    "category": "procure",
    "title": "당근마켓 직거래 벽돌 사기",
    "text": "\"싸게 올라온 RTX 4090을 택배 거래로 입금했으나, 뜯어보니 붉은 벽돌과 신문지만 들어있습니다!\"",
    "trigger": {
      "minMonth": 2,
      "chancePerMonth": 0.08,
      "cooldownMonths": 10,
      "require": "totalTflops >= 8"
    },
    "choices": [
      {
        "label": "[A] 사이버수사대 정식 고소 접수",
        "desc": "경찰서에 진정서를 넣고 계좌 지급정지를 요청합니다.",
        "effects": {
          "ceoStress": 10
        },
        "outcomes": [
          {
            "chance": 0.4,
            "effects": {
              "money": 2000000,
              "creditScore": 5
            },
            "result": "범인이 검거되어 합의금 200만원을 돌려받았습니다!"
          },
          {
            "chance": 0.6,
            "effects": {
              "ceoStress": 10
            },
            "result": "대포통장이라 환수하지 못했습니다."
          }
        ]
      },
      {
        "label": "[B] 액땜했다 치고 잊기",
        "desc": "시간을 아끼고 본업에 집중합니다.",
        "effects": {
          "money": -2000000,
          "ceoStress": 5
        },
        "result": "수업료를 톡톡히 치렀습니다."
      }
    ]
  },
  {
    "id": "yongsan_bundle",
    "category": "procure",
    "title": "용산 총판의 H100 끼워팔기 제안",
    "text": "\"사장님, 지금 전 세계 품귀인 H100 바로 드릴 수 있는데... 창고에 썩어가는 구형 스토리지 서버 2대 같이 사주셔야 돼요.\"",
    "trigger": {
      "minMonth": 6,
      "chancePerMonth": 0.09,
      "cooldownMonths": 12,
      "require": "money >= 40000000"
    },
    "choices": [
      {
        "label": "[A] 울며 겨자먹기로 묶음 구매",
        "desc": "추가 지출을 감수하고 H100 신품을 확보합니다.",
        "effects": {
          "money": -40000000,
          "addGpus": {
            "model": "h100",
            "count": 1
          }
        },
        "result": "H100 1대가 입고되었습니다! 구형 스토리지는 선반 받침대로 씁니다."
      },
      {
        "label": "[B] \"정가대로 단품만 주세요\" 단호히 거절",
        "desc": "끼워팔기 관행을 거부합니다.",
        "effects": {
          "ceoStress": 5
        },
        "result": "납품 대기 순번이 4개월 뒤로 밀렸습니다."
      }
    ]
  },
  {
    "id": "mining_farm_bulk_dump",
    "category": "procure",
    "title": "중고 채굴장 매물 통매입 찬스",
    "text": "\"파산한 암호화폐 채굴장에서 RTX 3060 12GB 10대를 대당 12만원에 일괄 덤핑 매각하겠다고 긴급 연락이 왔습니다!\"",
    "trigger": {
      "minMonth": 3,
      "chancePerMonth": 0.1,
      "cooldownMonths": 10
    },
    "choices": [
      {
        "label": "[A] 120만원에 10대 전량 일괄 매입",
        "desc": "저비용으로 대규모 연산력을 확보합니다.",
        "effects": {
          "money": -1200000,
          "addGpus": {
            "model": "rtx3060",
            "count": 5,
            "isMining": true
          }
        },
        "result": "채굴 에디션 GPU가 대거 입고되었습니다! 연산력이 대폭 증가했습니다."
      },
      {
        "label": "[B] \"채굴 찌든 카드는 안 산다\" 패스",
        "desc": "장비 안정성을 위해 거절합니다.",
        "effects": {
          "ceoStress": -3
        },
        "result": "리스크를 회피하고 품질을 지켰습니다."
      }
    ]
  },
  {
    "id": "us_export_control_nvidia",
    "category": "procure",
    "title": "미 상무부 엔비디아 GPU 수출 통제 심사",
    "text": "\"미국 정부가 대중국 AI 칩셋 수출 통제를 강화하면서 한국 수입 물량에 대해서도 최종 사용자(End-User) 실사를 요구하고 있습니다.\"",
    "trigger": {
      "minMonth": 8,
      "chancePerMonth": 0.08,
      "cooldownMonths": 14,
      "require": "totalTflops >= 150"
    },
    "choices": [
      {
        "label": "[A] 로펌 검수 거쳐 최종 사용자 서약서(EUC) 제출",
        "desc": "법률 검토비 300만원을 쓰고 합법적 수입 라인을 지킵니다.",
        "cost": 3000000,
        "effects": {
          "reputation": 15,
          "creditScore": 10
        },
        "result": "미 상무부 화이트리스트 등록! 향후 엔비디아 최신 칩셋 수급 우선권을 확보했습니다."
      },
      {
        "label": "[B] 총판 대행사에 일임하고 대기",
        "desc": "비용 없이 총판의 처분을 기다립니다.",
        "effects": {
          "modifier": {
            "stat": "cloudIncome",
            "mul": 0.85,
            "months": 2
          }
        },
        "result": "심사 지연으로 장비 도입이 2개월 밀렸습니다."
      }
    ]
  },
  {
    "id": "customs_kc_hold",
    "category": "procure",
    "title": "해외 직구 고성능 GPU 세관 통관 보류",
    "text": "\"해외 직구로 반입하던 고성능 그래픽카드가 전파법 KC인증 미비 사유로 인천세관에 억류되었습니다!\"",
    "trigger": {
      "minMonth": 4,
      "chancePerMonth": 0.09,
      "cooldownMonths": 10
    },
    "choices": [
      {
        "label": "[A] 공인 시험기관 전파인증 시험 성적서 발급",
        "desc": "인증비 250만원을 납부하고 정식 통관을 진행합니다.",
        "cost": 2500000,
        "effects": {
          "reputation": 5,
          "addGpus": {
            "model": "rtx4090",
            "count": 1
          }
        },
        "result": "KC 인증 완료! 합법적으로 통관되어 랙에 장착되었습니다."
      },
      {
        "label": "[B] 반송 처리 후 해외 판매자에게 환불 요청",
        "desc": "비용을 피하고 반송합니다.",
        "effects": {
          "money": -500000,
          "ceoStress": 10
        },
        "result": "왕복 배송비 50만원을 제하고 환불받았습니다."
      }
    ]
  },
  {
    "id": "fake_thermal_paste_disaster",
    "category": "procure",
    "title": "알리익스프레스 짝퉁 서멀구리스 참사",
    "text": "\"인터넷에서 싼값에 대량 구매한 유명 브랜드 서멀구리스가 알고 보니 치약 수준의 가짜였습니다! 바른 GPU의 온도가 95도를 찍습니다!\"",
    "trigger": {
      "minMonth": 3,
      "chancePerMonth": 0.09,
      "cooldownMonths": 8
    },
    "choices": [
      {
        "label": "[A] 즉시 전량 닦아내고 정품 곰서멀로 재작업",
        "desc": "정품 튜브와 세척제를 급히 사서 밤새 재도포합니다.",
        "cost": 400000,
        "effects": {
          "ceoStress": 10
        },
        "result": "온도를 정상화했습니다. 가짜 서멀을 전량 폐기했습니다."
      },
      {
        "label": "[B] 일단 선풍기 틀고 버티기",
        "desc": "귀찮아서 방치합니다.",
        "effects": {
          "damageRandomGpu": {
            "count": 1,
            "damage": 45
          }
        },
        "result": "고온으로 인해 GPU 1대의 내구도가 크게 손상되었습니다!"
      }
    ]
  },
  {
    "id": "holiday_family_nagging",
    "category": "life",
    "title": "설·추석 명절 친척들의 취직 잔소리",
    "text": "\"명절에 고향에 내려가자 큰아버지가 묻습니다. \"동규야, 그 컴퓨터 조립하는 거 그만하고 이제 삼전이나 현차 공채 안 넣냐?\"\"",
    "trigger": {
      "calendarMonth": [
        2,
        9
      ],
      "cooldownMonths": 5
    },
    "choices": [
      {
        "label": "[A] 웃어넘기며 용돈 10만원씩 쥐어드리기",
        "desc": "성공한 젊은 CEO의 면모를 보여줍니다.",
        "cost": 500000,
        "effects": {
          "ceoStress": -10,
          "reputation": 5
        },
        "result": "친척들의 입을 막고 마음의 평화를 얻었습니다."
      },
      {
        "label": "[B] GPU 클라우드 기술 패러다임 1시간 열변",
        "desc": "인공지능 혁명에 대해 설파합니다.",
        "effects": {
          "ceoStress": 15
        },
        "result": "큰아버지는 \"애가 바람이 들었네\"라며 고개를 저었습니다."
      }
    ]
  },
  {
    "id": "ceo_health_check_alarm",
    "category": "life",
    "title": "대표 종합건강검진 간수치 4배 폭증",
    "text": "\"밤샘과 에너지드링크 남용으로 간수치(GOT/GPT)가 180을 돌파하고 역류성 식도염 판정을 받았습니다. 의사가 절대 안정을 권고합니다.\"",
    "trigger": {
      "minMonth": 6,
      "chancePerMonth": 0.1,
      "cooldownMonths": 12
    },
    "choices": [
      {
        "label": "[A] 주말 2일간 스마트폰 끄고 온천 요양",
        "desc": "몸을 추스르고 체력을 회복합니다.",
        "cost": 600000,
        "effects": {
          "ceoHealth": 30,
          "ceoStress": -25
        },
        "result": "몸과 마음이 정화되어 업무 활력을 되찾았습니다."
      },
      {
        "label": "[B] 우루사와 비타민 때려 넣고 출근",
        "desc": "스타트업 대표에게 아플 시간 따윈 없습니다.",
        "effects": {
          "ceoHealth": -15,
          "ceoStress": 15,
          "money": 2000000
        },
        "result": "일은 진척되었으나 몸이 곯아가고 있습니다."
      }
    ]
  },
  {
    "id": "highschool_reunion_pride",
    "category": "life",
    "title": "고등학교 동창회 (대기업 친구들의 연봉 자랑)",
    "text": "\"오랜만에 나간 동창회. 네이버, 대기업 다니는 친구들이 성과급 3,000만원 받았다고 자랑하며 영수증을 긁습니다.\"",
    "trigger": {
      "minMonth": 5,
      "chancePerMonth": 0.08,
      "cooldownMonths": 10
    },
    "choices": [
      {
        "label": "[A] \"나는 내 회사의 지분 80%가 있다\" 속으로 삭이기",
        "desc": "미래의 유니콘 엑싯을 꿈꾸며 평정을 유지합니다.",
        "effects": {
          "ceoStress": -5,
          "reputation": 5
        },
        "result": "묵묵히 내실을 다지기로 결의했습니다."
      },
      {
        "label": "[B] 기 살리려고 2차 골든벨 긁기",
        "desc": "법인카드로 술값을 결제합니다.",
        "effects": {
          "money": -700000,
          "ceoStress": 10
        },
        "result": "동창들의 환호를 받았으나 다음 날 카드 명세서를 보고 후회했습니다."
      }
    ]
  },
  {
    "id": "relationship_ultimatum",
    "category": "life",
    "title": "연인의 최후통첩: \"나야, 스타트업이야?\"",
    "text": "\"주말마다 서버실에 불려 나가고 데이트 도중에도 슬랙만 보던 당신에게 연인이 울먹이며 마지막 선택을 요구합니다.\"",
    "trigger": {
      "minMonth": 6,
      "chancePerMonth": 0.08,
      "cooldownMonths": 12
    },
    "choices": [
      {
        "label": "[A] 하루 데이트에 온전히 집중하고 사과",
        "desc": "스마트폰을 끄고 연인과의 시간을 보냅니다.",
        "cost": 300000,
        "effects": {
          "ceoStress": -20,
          "ceoHealth": 10
        },
        "result": "관계를 회복하고 정서적 안정을 얻었습니다!"
      },
      {
        "label": "[B] \"지금 중요한 시기야, 이해 못 해주면 힘들어\"",
        "desc": "사업에 올인합니다.",
        "effects": {
          "ceoStress": 25,
          "modifier": {
            "stat": "allIncome",
            "mul": 1.1,
            "months": 1
          }
        },
        "result": "결국 결별했습니다. 슬픔을 잊기 위해 밤새 코딩과 서버 세팅에 매진합니다."
      }
    ]
  },
  {
    "id": "parents_civil_servant_nag",
    "category": "life",
    "title": "어머니의 9급 공무원 원서 봉투",
    "text": "\"주말에 집에 들르자 어머니가 밥상 위에 9급 전산직 공무원 시험 원서와 학원 팜플렛을 올려두셨습니다. \"아들아, 안정적인 게 최고다...\"\"",
    "trigger": {
      "minMonth": 4,
      "chancePerMonth": 0.09,
      "cooldownMonths": 10
    },
    "choices": [
      {
        "label": "[A] 이번 달 회사 통장 잔고 보여드리며 안심시키기",
        "desc": "당당하게 매출 지표를 증명합니다.",
        "effects": {
          "reputation": 10,
          "ceoStress": -10
        },
        "result": "어머니가 안도하시며 맛있는 갈비찜을 차려주셨습니다."
      },
      {
        "label": "[B] \"엄마는 아무것도 몰라!\" 홧김에 소리치고 나오기",
        "desc": "스트레스를 표출합니다.",
        "effects": {
          "ceoStress": 20
        },
        "result": "집을 나와 자취방으로 돌아오는 길 내내 가슴이 먹먹했습니다."
      }
    ]
  },
  {
    "id": "idc_night_crash_call",
    "category": "life",
    "title": "새벽 3시 IDC 서버 다운 긴급 출동",
    "text": "\"새벽 3시 17분, 긴급 PagerDuty 알람이 요란하게 울립니다. IDC 메인 스위치가 다운되어 100대의 GPU가 먹통이 되었습니다!\"",
    "trigger": {
      "minMonth": 7,
      "chancePerMonth": 0.1,
      "cooldownMonths": 8,
      "require": "totalTflops >= 60"
    },
    "choices": [
      {
        "label": "[A] 택시 타고 즉시 IDC로 날아가 현장 복구",
        "desc": "대표가 직접 밤샘 현장 대응에 나섭니다.",
        "cost": 100000,
        "effects": {
          "ceoHealth": -10,
          "ceoStress": 15,
          "reputation": 10
        },
        "result": "1시간 만에 스위치를 리셋하고 정상 복구했습니다. 고객사들이 빠른 대응을 칭찬합니다."
      },
      {
        "label": "[B] IDC 원격 스마트핸즈(엔지니어 대행) 유료 호출",
        "desc": "50만원을 결제하고 IDC 상주 기사에게 맡깁니다.",
        "cost": 500000,
        "effects": {
          "ceoStress": -5
        },
        "result": "집에서 편히 자며 복구를 완료했습니다. 돈으로 시간을 샀습니다."
      }
    ]
  },
  {
    "id": "bigtech_mna",
    "category": "ending",
    "title": "글로벌 테크 대기업의 인수 제안 (M&A)",
    "text": "\"귀사의 GPU 클러스터 및 AI 운영팀을 1,000억원에 인수하고 전 직원에게 스톡옵션을 승계하겠습니다. 실리콘밸리 본사에서 정식 인수의향서(LOI)가 도착했습니다.\"",
    "trigger": {
      "minMonth": 24,
      "chancePerMonth": 0.1,
      "cooldownMonths": 24,
      "require": "totalTflops >= 5000 && monthlyProfit > 0"
    },
    "choices": [
      {
        "label": "[A] 엑싯(Exit)! M&A 계약서에 서명",
        "desc": "1,000억원에 회사를 매각하고 전설적인 창업가로 남습니다.",
        "effects": {
          "special": "mna_exit"
        },
        "result": "M&A 인수 계약 체결! [트루엔딩 T1]로 직행합니다!"
      },
      {
        "label": "[B] \"우린 유니콘으로 갈 겁니다\" 거절",
        "desc": "독자 생존하여 나스닥 상장을 향해 계속 달립니다.",
        "effects": {
          "reputation": 30,
          "ceoStress": 10
        },
        "result": "대기업의 거액 제안을 거절한 패기 있는 K-스타트업으로 전 세계 테크 언론에 대서특필되었습니다!"
      }
    ]
  },
  {
    "id": "national_agi_datacenter_bid",
    "category": "ending",
    "title": "과기부 대한민국 국가 AGI 데이터센터 단독 수주 타진",
    "text": "\"과기정통부 2차관이 극비리에 방문했습니다. 춘천 하이퍼스케일 센터를 국가 소버린 AI 거점으로 지정하고 1조원 규모의 국가 연산 센터를 위탁 운영할 의향이 있는지 묻습니다.\"",
    "trigger": {
      "minMonth": 36,
      "chancePerMonth": 0.1,
      "cooldownMonths": 24,
      "require": "flags.hasChuncheonDC && totalTflops >= 10000"
    },
    "choices": [
      {
        "label": "[A] 국가 AGI 컴퓨팅 센터 주관사 협약 체결",
        "desc": "대한민국 AI의 심장으로 도약합니다.",
        "effects": {
          "reputation": 50,
          "money": 500000000,
          "creditScore": 50
        },
        "result": "정부와 국가 AGI 인프라 공식 협약 체결! [트루엔딩 T2] 조건에 근접했습니다!"
      },
      {
        "label": "[B] 관제 리스크를 우려하여 민간 클러스터에 집중",
        "desc": "자유로운 글로벌 민간 시장을 지향합니다.",
        "effects": {
          "ceoStress": -10
        },
        "result": "정부 과제 대신 빅테크 고객사 유치에 집중하기로 했습니다."
      }
    ]
  }
];
