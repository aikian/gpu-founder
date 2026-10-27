# 🎲 한국 테크 스타트업 딜레마 & 억까 랜덤 이벤트 62선 (Master Data)

> 한국 IT/AI 스타트업 창업자가 겪는 현실적인 사건·사고 62종. 세무, 정부지원, 투자, 인사, 인프라, 시장, 조달, 생활 전 영역 고증.

| 번호 | ID | 카테고리 | 이벤트명 | 발생 조건 | 선택지 A | 선택지 B |
| :-: | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `tax_vat_season` | tax | **1월·7월 부가세(VAT) 납부의 달** | `{'calendarMonth':[1,7],'cooldownMonths':5,'require':'month >= 4 && flags.bizRegistered'}` | [A] 부가세 정액 성실 납부 | [B] 매입세액 영수증 탈탈 털어 절세 |
| 2 | `tax_corp_settlement` | tax | **3월 결산 법인세 고지서** | `{'calendarMonth':3,'cooldownMonths':11,'require':'month >= 10 && flags.bizRegistered'}` | [A] 법인세 일시납 | [B] 2개월 분납 신청 |
| 3 | `tax_audit_raid` | tax | **국세청 특별 세무조사 착수 통보** | `{'minMonth':14,'chancePerMonth':0.08,'cooldownMonths':18,'require':'money >= 30000000'}` | [A] 대형 세무법인 조사 대응 선임 | [B] 대표 본인이 장부 들고 직접 소명 |
| 4 | `four_insurance_arrears` | tax | **건보공단 4대보험 연체 독촉장** | `{'minMonth':8,'chancePerMonth':0.12,'cooldownMonths':8,'require':'employees.length >= 1 && money < 5000000'}` | [A] 연체료 포함 즉시 완납 | [B] 분할납부 약정 체결 |
| 5 | `venture_cert_audit` | legal | **벤처기업 인증 현장 실사 방문** | `{'minMonth':9,'chancePerMonth':0.1,'cooldownMonths':12,'require':'totalTflops >= 50'}` | [A] 기술 아키텍처와 자체 GPU 랙 시연 | [B] 벤처 인증 패스 (수수료 절감) |
| 6 | `rnd_lab_inspection` | legal | **기업부설연구소 불시 사후 점검** | `{'minMonth':10,'chancePerMonth':0.09,'cooldownMonths':12,'require':'employees.length >= 2'}` | [A] 완벽한 연구 전담 공간 보여주기 | [B] 행정 미비 지적 및 시정명령 |
| 7 | `personal_info_leak_scare` | legal | **개인정보보호위원회 보안 점검 공문** | `{'minMonth':6,'chancePerMonth':0.08,'cooldownMonths':10,'require':'saasUsers >= 500'}` | [A] 개인정보 보안 전문 컨설팅 의뢰 | [B] 오픈소스 자체 보안 점검표 작성 |
| 8 | `gpl_license_warning` | legal | **오픈소스 GPL 라이선스 위반 경고장** | `{'minMonth':8,'chancePerMonth':0.07,'cooldownMonths':12,'require':'totalTflops >= 60'}` | [A] 해당 모듈 전면 재작성 (오픈소스 클린룸) | [B] 로펌과 합의금 협상 |
| 9 | `grant_audit` | grant | **e나라도움 정산의 악몽** | `{'minMonth':7,'chancePerMonth':0.1,'cooldownMonths':12,'require':'flags.hasGrant'}` | [A] 눈물의 사비 변제 (행정 종결) | [B] 국민신문고 이의신청 & 행정심판 |
| 10 | `gov_grant_season_night` | grant | **2월 정부지원사업 공고 시즌 밤샘** | `{'calendarMonth':[1,2],'cooldownMonths':8,'require':'month >= 2'}` | [A] 전 직원 주말 철야로 올인 작성 | [B] 전문 창업지도사 첨삭 컨설팅 (300만원) |
| 11 | `gov_midterm_presentation` | grant | **정부과제 중간점검 현장 발표평가** | `{'minMonth':6,'chancePerMonth':0.12,'cooldownMonths':10,'require':'flags.hasGrant'}` | [A] 실제 벤치마크 지표와 가동률 투명 공개 | [B] 블러핑 섞인 화려한 비전 쇼잉 |
| 12 | `gov_voucher_inspection` | grant | **정부 AI 바우처 공급기업 현장 실사** | `{'minMonth':5,'chancePerMonth':0.1,'cooldownMonths':12,'require':'totalTflops >= 30'}` | [A] 커피 대접하고 랙 LED 화려하게 쇼잉 | [B] 원리원칙대로 기술 아키텍처만 설명 |
| 13 | `tech_royalty_bill` | grant | **과제 성공 판정에 따른 기술료 납부 고지** | `{'minMonth':16,'chancePerMonth':0.08,'cooldownMonths':16,'require':'flags.hasGrant'}` | [A] 기술료 1,500만원 성실 납부 | [B] 3년 분할 납부 신청 |
| 14 | `grant_officer_change` | grant | **전담기관 간사 교체로 인한 서류 15종 재제출** | `{'minMonth':8,'chancePerMonth':0.1,'cooldownMonths':10,'require':'flags.hasGrant'}` | [A] 밤새워 모든 서류 재편철 제출 | [B] 전임 간사의 공식 결재 공문 제시하며 항의 |
| 15 | `grant_whistleblower` | grant | **연구개발비 부정사용 투서 특별감사** | `{'minMonth':12,'chancePerMonth':0.07,'cooldownMonths':14,'require':'flags.hadEmployees && flags.hasGrant'}` | [A] 감사원 전담 회계사 입회 하에 전수 실사 | [B] 경고 처분 및 소액 환수 수용 |
| 16 | `sanction_hearing_notice` | grant | **정부과제 제재조치위원회 출석 통보** | `{'minMonth':15,'chancePerMonth':0.06,'cooldownMonths':18,'require':'flags.auditCaught'}` | [A] 대표가 직접 눈물로 갱생 의지 호소 | [B] 행정전문 로펌 동행 출석 |
| 17 | `ceo_minus_loan_maturity` | finance | **대표이사 마이너스 통장 만기 연장일** | `{'minMonth':6,'chancePerMonth':0.12,'cooldownMonths':12}` | [A] 신보 청년창업 대출로 대환 대출 | [B] 보유 암호화폐 긴급 시장가 매도하여 상환 |
| 18 | `vc_lowball` | finance | **혹한기 VC의 밸류 후려치기** | `{'minMonth':6,'chancePerMonth':0.1,'cooldownMonths':12,'require':'totalTflops >= 60'}` | [A] 굴욕을 참고 도장 찍기 (런웨이 연장) | [B] "우리 가치를 모르는 곳과는 안 합니다" 거절 |
| 19 | `shinbo_guarantee_extension` | finance | **신용보증기금 보증서 1년 연장 심사** | `{'minMonth':11,'chancePerMonth':0.1,'cooldownMonths':12,'require':'loans.length >= 1'}` | [A] 성실한 경영 지표 브리핑 | [B] 보증 대출 전액 조기 상환 |
| 20 | `vc_term_sheet_poison` | finance | **VC 텀싯(Term Sheet)의 독소조항 발견** | `{'minMonth':9,'chancePerMonth':0.09,'cooldownMonths':12,'require':'totalTflops >= 80'}` | [A] 스타트업 전문 변호사 통해 독소조항 삭제 협상 | [B] 급전이 필요하니 조건 그대로 날인 |
| 21 | `safe_investment_offer` | finance | **실리콘밸리식 SAFE(조건부지분인수계약) 제안** | `{'minMonth':5,'chancePerMonth':0.08,'cooldownMonths':10}` | [A] SAFE 계약 수락 (1억원 유치) | [B] 정중히 거절 (자체 매출로 승부) |
| 22 | `rcps_early_redemption` | finance | **투자사의 RCPS 상환 청구 압박** | `{'minMonth':18,'chancePerMonth':0.07,'cooldownMonths':14,'require':'flags.toxicVcSigned'}` | [A] 법정 배당가능이익 부존재로 상환 거부 | [B] 일부 자금 합의 상환 및 지분 소각 |
| 23 | `angel_investor_drinking` | finance | **엔젤투자자의 취중 심야 전화 간섭** | `{'minMonth':4,'chancePerMonth':0.1,'cooldownMonths':8}` | [A] 1시간 동안 맞장구치며 달래기 | [B] 단호하게 업무시간 외 연락 자제 요청 |
| 24 | `runway_three_months_panic` | finance | **런웨이 3개월 미만 진입! 비상경영 선포** | `{'chancePerMonth':0.2,'cooldownMonths':6,'require':'money < 6000000 && month >= 4'}` | [A] 대표 급여 0원 선언 & 경비 전면 동결 | [B] 보유 GPU 일부 긴급 당근 매각 |
| 25 | `senior_dev_escape` | hr | **시니어 AI 개발자 판교 탈주** | `{'minMonth':5,'chancePerMonth':0.1,'cooldownMonths':12,'require':'employees.length >= 1'}` | [A] 스톡옵션 5% 쥐어주며 붙잡기 | [B] 쿨하게 퇴사 승인 및 인수인계 |
| 26 | `labor_52hours_report` | hr | **근로기준법 52시간제 위반 투서** | `{'minMonth':6,'chancePerMonth':0.08,'cooldownMonths':12,'require':'flags.hadEmployees'}` | [A] 야근수당 전액 정산 및 합의 | [B] 포괄임금제 계약서로 맞대응 |
| 27 | `hr_burnout_sick_leave` | hr | **핵심 엔지니어 번아웃 응급실행** | `{'minMonth':4,'chancePerMonth':0.12,'cooldownMonths':8,'require':'employees.length >= 1'}` | [A] 유급휴가 2주 + 치료비 150만원 지원 | [B] 무급휴가 승인 및 대체 외주 투입 |
| 28 | `hr_blind_review_leak` | hr | **블라인드·잡플래닛 1.2점 폭로글 테러** | `{'minMonth':7,'chancePerMonth':0.09,'cooldownMonths':10,'require':'flags.hadEmployees'}` | [A] 사내 간담회 열고 복지 개선 발표 | [B] 잡플래닛에 명예훼손 권리침해 중단 신청 |
| 29 | `cofounder_equity_fight` | hr | **초기 창업멤버 간의 지분 싸움** | `{'minMonth':6,'chancePerMonth':0.08,'cooldownMonths':14,'require':'ceoEquity >= 50'}` | [A] 지분 10% 떼어주고 달래기 | [B] "나갈 거면 나가라" 결별 선언 |
| 30 | `hr_intern_conversion` | hr | **청년인턴 정규직 전환 평가일** | `{'minMonth':5,'chancePerMonth':0.12,'cooldownMonths':6,'require':'employees.length >= 1'}` | [A] 정규직 전환 및 청년일자리 도약장려금 신청 | [B] 계약 만료 후 작별 |
| 31 | `military_rnd_privilege` | hr | **병역특례(전문연구요원) 배정 심사** | `{'calendarMonth':10,'cooldownMonths':11,'require':'flags.hasRndLab && flags.ventureCertified'}` | [A] 병특 배정 신청서 및 기술실적서 제출 | [B] 신청 포기 (행정 부담) |
| 32 | `dev_poaching_competitor` | hr | **퇴사한 개발자의 경쟁사 이직 및 인력 유출** | `{'minMonth':10,'chancePerMonth':0.08,'cooldownMonths':12,'require':'employees.length >= 2'}` | [A] 전직금지 가처분 내용증명 발송 | [B] 전 직원 면담 및 연봉 10% 일괄 인상 |
| 33 | `kepco_summer_peak` | infra | **한전 여름철 전력 피크 경고** | `{'calendarMonth':[7,8],'cooldownMonths':10}` | [A] 피크 시간대 GPU 50% 절전 모드 | [B] 풀가동 강행 (고객 계약이 우선) |
| 34 | `ac_water_leak` | infra | **서버실 에어컨 배관 누수 사고** | `{'minMonth':3,'chancePerMonth':0.1,'cooldownMonths':8}` | [A] 즉시 메인 차단기 내리고 분해 건조 | [B] 수건 받치고 가동 유지 |
| 35 | `dust_fire_alarm` | infra | **서버실 분진 화재경보기 오작동** | `{'minMonth':4,'chancePerMonth':0.1,'cooldownMonths':8}` | [A] 소방관·관리소장에게 정중히 사과 및 청소 | [B] 전문 덕트 및 공조 헤파필터 시공 |
| 36 | `kakao_idc_fire_aftermath` | infra | **판교 데이터센터 화재 여파 긴급 규제 점검** | `{'minMonth':8,'chancePerMonth':0.08,'cooldownMonths':14}` | [A] 방화벽 및 자동소화설비 보강 공사 | [B] 시정권고 기한까지 버티기 |
| 37 | `kepco_substation_outage` | infra | **한전 변전소 정기점검 6시간 단전 통보** | `{'minMonth':7,'chancePerMonth':0.08,'cooldownMonths':12}` | [A] 이동식 비상발전차량 긴급 임차 | [B] 고객 사전 공지 후 점검 시간대 셧다운 |
| 38 | `water_cooling_fitting_leak` | infra | **수랭 커스텀 쿨러 피팅 미세 누수 발견** | `{'minMonth':5,'chancePerMonth':0.09,'cooldownMonths':10,'require':'totalTflops >= 50'}` | [A] 전 라인 정품 금속 피팅 전면 교체 | [B] 방수 테이프로 임시 보강 후 관찰 |
| 39 | `free_cooling_efficiency_drop` | infra | **여름철 외기냉방 효율 급감 찜통 서버실** | `{'calendarMonth':[7,8],'cooldownMonths':10,'require':'totalTflops >= 60'}` | [A] 산업용 이동식 스팟 에어컨 긴급 렌탈 | [B] 연산 클럭을 낮추는 언더클럭 단체 적용 |
| 40 | `basement_flood_warning` | infra | **게릴라성 폭우 장마철 침수 위험 경보** | `{'calendarMonth':7,'cooldownMonths':11,'require':'offices.length >= 2'}` | [A] 전 직원 모래주머니 설치 및 밤샘 배수 작업 | [B] 빌딩 관리사무소에 전적 의존 |
| 41 | `grad_student_finals_rush` | market | **공대 대학원생들의 기말고사 렌탈 러시** | `{'calendarMonth':[6,12],'cooldownMonths':5}` | [A] 시간당 단가 2.5배 탄력 요금제 인상 | [B] 학생 인증 시 10% 할인 프로모션 |
| 42 | `opensource_llama` | market | **메타(Meta) 차세대 오픈소스 AI 무료 공개** | `{'minMonth':6,'chancePerMonth':0.08,'cooldownMonths':12}` | [A] 신규 모델 당일 서빙 최적화(vLLM) 배포 | [B] 기존 모델 성능 우위 마케팅 집행 |
| 43 | `bigtech_price_war` | market | **빅테크 클라우드의 단가 인하 치킨게임** | `{'minMonth':7,'chancePerMonth':0.08,'cooldownMonths':12,'require':'totalTflops >= 60'}` | [A] 맞불 단가 인하로 시장 점유율 방어 | [B] "한국어 엔지니어 1:1 슬랙 직통 지원" 프리미엄 특화 |
| 44 | `enterprise_receivable_delay` | market | **거대 고객사 용역 대금 90일 어음 결제 지연** | `{'minMonth':9,'chancePerMonth':0.09,'cooldownMonths':10,'require':'totalTflops >= 80'}` | [A] 은행 할인(깡)으로 현금화 (할인료 7%) | [B] 공정거래위원회 불공정 하도급 신고 |
| 45 | `render_farm_emergency_order` | market | **VFX 3D 영화 제작사의 밤샘 렌더팜 독점 긴급 발주** | `{'minMonth':4,'chancePerMonth':0.1,'cooldownMonths':8,'require':'totalTflops >= 40'}` | [A] 일반 고객 양해 구하고 렌더팜 풀가동 수주 | [B] 기존 스팟 고객 신뢰 유지를 위해 정중히 거절 |
| 46 | `ethereum_merge_pos` | market | **이더리움 머지(PoW 종료) 및 채굴 수익 급락** | `{'minMonth':5,'chancePerMonth':0.08,'cooldownMonths':18,'require':'workloadAlloc.crypto >= 20'}` | [A] 보유 GPU 전량을 AI 클라우드로 전환 | [B] 잡알트코인으로 갈아타서 버티기 |
| 47 | `bitcoin_all_time_high` | market | **비트코인 10만 달러 돌파! 크립토 불장 개막** | `{'minMonth':6,'chancePerMonth':0.08,'cooldownMonths':12}` | [A] 채굴 비중을 일시적으로 대폭 확대 | [B] 중고 그래픽카드 시세 폭등 때 일부 차익 실현 매각 |
| 48 | `enterprise_sla_penalty_scare` | market | **대기업 엔터프라이즈 SLA 위약금 청구 위기** | `{'minMonth':10,'chancePerMonth':0.08,'cooldownMonths':12,'require':'totalTflops >= 100'}` | [A] 장애 원인 보고서 제출 및 크레딧 30% 보상 타협 | [B] 위약금 전액 즉시 송금 및 사과 |
| 49 | `danggeun_brick_scam` | procure | **당근마켓 직거래 벽돌 사기** | `{'minMonth':2,'chancePerMonth':0.08,'cooldownMonths':10,'require':'totalTflops >= 8'}` | [A] 사이버수사대 정식 고소 접수 | [B] 액땜했다 치고 잊기 |
| 50 | `yongsan_bundle` | procure | **용산 총판의 H100 끼워팔기 제안** | `{'minMonth':6,'chancePerMonth':0.09,'cooldownMonths':12,'require':'money >= 40000000'}` | [A] 울며 겨자먹기로 묶음 구매 | [B] "정가대로 단품만 주세요" 단호히 거절 |
| 51 | `mining_farm_bulk_dump` | procure | **중고 채굴장 매물 통매입 찬스** | `{'minMonth':3,'chancePerMonth':0.1,'cooldownMonths':10}` | [A] 120만원에 10대 전량 일괄 매입 | [B] "채굴 찌든 카드는 안 산다" 패스 |
| 52 | `us_export_control_nvidia` | procure | **미 상무부 엔비디아 GPU 수출 통제 심사** | `{'minMonth':8,'chancePerMonth':0.08,'cooldownMonths':14,'require':'totalTflops >= 150'}` | [A] 로펌 검수 거쳐 최종 사용자 서약서(EUC) 제출 | [B] 총판 대행사에 일임하고 대기 |
| 53 | `customs_kc_hold` | procure | **해외 직구 고성능 GPU 세관 통관 보류** | `{'minMonth':4,'chancePerMonth':0.09,'cooldownMonths':10}` | [A] 공인 시험기관 전파인증 시험 성적서 발급 | [B] 반송 처리 후 해외 판매자에게 환불 요청 |
| 54 | `fake_thermal_paste_disaster` | procure | **알리익스프레스 짝퉁 서멀구리스 참사** | `{'minMonth':3,'chancePerMonth':0.09,'cooldownMonths':8}` | [A] 즉시 전량 닦아내고 정품 곰서멀로 재작업 | [B] 일단 선풍기 틀고 버티기 |
| 55 | `holiday_family_nagging` | life | **설·추석 명절 친척들의 취직 잔소리** | `{'calendarMonth':[2,9],'cooldownMonths':5}` | [A] 웃어넘기며 용돈 10만원씩 쥐어드리기 | [B] GPU 클라우드 기술 패러다임 1시간 열변 |
| 56 | `ceo_health_check_alarm` | life | **대표 종합건강검진 간수치 4배 폭증** | `{'minMonth':6,'chancePerMonth':0.1,'cooldownMonths':12}` | [A] 주말 2일간 스마트폰 끄고 온천 요양 | [B] 우루사와 비타민 때려 넣고 출근 |
| 57 | `highschool_reunion_pride` | life | **고등학교 동창회 (대기업 친구들의 연봉 자랑)** | `{'minMonth':5,'chancePerMonth':0.08,'cooldownMonths':10}` | [A] "나는 내 회사의 지분 80%가 있다" 속으로 삭이기 | [B] 기 살리려고 2차 골든벨 긁기 |
| 58 | `relationship_ultimatum` | life | **연인의 최후통첩: "나야, 스타트업이야?"** | `{'minMonth':6,'chancePerMonth':0.08,'cooldownMonths':12}` | [A] 하루 데이트에 온전히 집중하고 사과 | [B] "지금 중요한 시기야, 이해 못 해주면 힘들어" |
| 59 | `parents_civil_servant_nag` | life | **어머니의 9급 공무원 원서 봉투** | `{'minMonth':4,'chancePerMonth':0.09,'cooldownMonths':10}` | [A] 이번 달 회사 통장 잔고 보여드리며 안심시키기 | [B] "엄마는 아무것도 몰라!" 홧김에 소리치고 나오기 |
| 60 | `idc_night_crash_call` | life | **새벽 3시 IDC 서버 다운 긴급 출동** | `{'minMonth':7,'chancePerMonth':0.1,'cooldownMonths':8,'require':'totalTflops >= 60'}` | [A] 택시 타고 즉시 IDC로 날아가 현장 복구 | [B] IDC 원격 스마트핸즈(엔지니어 대행) 유료 호출 |
| 61 | `bigtech_mna` | ending | **글로벌 테크 대기업의 인수 제안 (M&A)** | `{'minMonth':24,'chancePerMonth':0.1,'cooldownMonths':24,'require':'totalTflops >= 5000 && monthlyProfit > 0'}` | [A] 엑싯(Exit)! M&A 계약서에 서명 | [B] "우린 유니콘으로 갈 겁니다" 거절 |
| 62 | `national_agi_datacenter_bid` | ending | **과기부 대한민국 국가 AGI 데이터센터 단독 수주 타진** | `{'minMonth':36,'chancePerMonth':0.1,'cooldownMonths':24,'require':'flags.hasChuncheonDC && totalTflops >= 10000'}` | [A] 국가 AGI 컴퓨팅 센터 주관사 협약 체결 | [B] 관제 리스크를 우려하여 민간 클러스터에 집중 |
