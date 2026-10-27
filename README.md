# ⚡ GPU FOUNDER — 한국 GPU 스타트업 타이쿤 (V2 Full Edition)

당근마켓 GTX 1060 한 장으로 시작해 한국 스타트업의 온갖 현실(집주인 항의, e나라도움 정산, 압박 면접 피칭, 판교 이직 러시)을 뚫고 국가급 소버린 AI 데이터센터까지 키우는 HTML5 경영 시뮬레이션.

## ▶ 실행 방법
`game/index.html`을 브라우저로 열면 바로 플레이 가능합니다 (`file://` 더블클릭 실행 완벽 지원, 빌드·서버 불필요).

## 🧪 자동 밸런스 & 스모크 테스트 실행
```powershell
node tests/sim_bot.js
```

## 📁 폴더 구조
```
GPU타이쿤/
├─ AGENTS.md                      # Antigravity 에이전트 공통 개발 규칙 (자동 주입)
├─ README.md
├─ .agents/
│  └─ skills/                     # 프로젝트 전용 표준 런북 스킬
│     ├─ balance-test/SKILL.md    # 84개월 자동 시뮬레이션 봇 & 밸런스 검증
│     ├─ add-event/SKILL.md       # 랜덤 딜레마 이벤트 추가 표준 절차
│     └─ smoke-test/SKILL.md      # 로컬 file:// 실행 및 로드 순서 무결성 검사
├─ tests/
│  └─ sim_bot.js                  # 헤드리스 84개월 시뮬레이션 & 엔딩 전수 검증 봇
├─ game/                          # 본 게임 (순수 HTML5 + Vanilla JS 모듈 아키텍처)
│  ├─ index.html
│  ├─ style.css
│  ├─ data/                       # 정적 마스터 데이터 (window.GAME_DATA.*)
│  │  ├─ economy.js               # GPU, 사업장, 대출, 리스, 당근 스토리
│  │  ├─ staff.js                 # 9대 직군, 6대 채용 채널, 7대 사내 복지
│  │  ├─ events.js                # 한국 스타트업 딜레마 20선 + 인사 돌발 이벤트 8선
│  │  ├─ pitching.js              # 정부지원사업 4종·VC 2종, 심사위원 4인, 질문 10선
│  │  ├─ hardware.js              # GPU 개별 개조 10종, 쿨링 테크트리 11종, 전력 9종
│  │  └─ endings.js               # 멀티 엔딩 8종(배드4·히든2·트루2) & 84개월 등급
│  └─ js/
│     ├─ core/                    # 코어 엔진 (sound.js, utils.js, state.js)
│     ├─ systems/                 # 도메인 로직 (office, hr, events, pitching, hardware, endings)
│     ├─ ui/                      # UI 렌더러 & 모달 컨트롤러 (modals.js, render.js)
│     └─ main.js                  # 메인 루프 (1초 틱 & 60초 월간 정산, 세이브/로드)
└─ docs/
   ├─ 00_GDD_overview.md          # 기획 인덱스 · 핵심 루프 · 구현 현황
   ├─ CONVENTIONS.md              # 변수·스키마·파일 소유권 컨벤션
   ├─ design/                     # 상세 기획서 (00~05 전 모듈 구현 완료)
   └─ references/                 # 레퍼런스 게임 · 한국 스타트업 현실 고증 분석
```
