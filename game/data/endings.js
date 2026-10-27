/**
 * game/data/endings.js
 * 멀티 엔딩 시나리오 8종(배드 4, 히든 2, 트루 2) 및 84개월 만료 최종 기업가치 등급 데이터
 * 기준 문서: docs/design/05_endings.md
 */
window.GAME_DATA = window.GAME_DATA || {};

window.GAME_DATA.endings = [
  {
    id: 'B1',
    type: 'bad',
    title: '신용불량 파산 엔딩',
    subtitle: '「대표이사 연대보증의 그림자」',
    badge: '💀 BAD ENDING B1',
    conditionDesc: '보유 현금 적자(< 0원) 3개월 연속 지속 AND 신용점수 400점 미만',
    storyText: [
      '법원에서 날아온 파산선고 결정문. 사무실의 H100은 경매로 넘어갔고, 당근마켓에는 "사무실 정리합니다" 글이 올라왔다. 작성자는 당신이다.',
      '6개월 뒤, 당신은 판교 대기업 인프라팀 면접장에 앉아 있었다. 면접관이 물었다. "공백기 동안 뭐 하셨어요?"',
      '"…GPU 좀 만졌습니다."'
    ].join('\n\n')
  },
  {
    id: 'B2',
    type: 'bad',
    title: '한전 체납 단전 엔딩',
    subtitle: '「꺼진 불빛」',
    badge: '💀 BAD ENDING B2',
    conditionDesc: '한국전력 전기요금 3개월 연속 체납',
    storyText: [
      '한전 직원이 계량기에 빨간 봉인 스티커를 붙였다. 300대의 팬이 동시에 멈추자, 서버실에는 난생처음 듣는 정적이 흘렀다.',
      '고객사 위약금 청구서가 이메일함을 가득 채웠다. 마지막으로 남은 건 GTX 1060 한 장. 처음 시작했던 그 카드였다.'
    ].join('\n\n')
  },
  {
    id: 'B3',
    type: 'bad',
    title: '국고보조금 횡령 구속 엔딩',
    subtitle: '「e나라도움의 심판」',
    badge: '💀 BAD ENDING B3',
    conditionDesc: '피칭 불법 브로커/허위 답변 또는 정부지원금 용도 외 유용 AND 감사 적발',
    storyText: [
      '"보조금관리법 위반 혐의로 체포합니다." 인건비를 장비비로 돌린 증빙이 전부 나왔다.',
      '뉴스 헤드라인: [단독] \'AI 스타트업\' 대표, 정부지원금 5억 유용 혐의로 구속',
      '베스트 댓글: "또 정부지원금 빨대네"'
    ].join('\n\n')
  },
  {
    id: 'B4',
    type: 'bad',
    title: '번아웃 고립 엔딩',
    subtitle: '「대표님, 저희 다 나갑니다」',
    badge: '💀 BAD ENDING B4',
    conditionDesc: '재직 직원이 1명 이상 있다가 전원 퇴사 AND 대표 스트레스 100 도달',
    storyText: [
      '마지막 직원이 사원증을 책상에 올려두고 나갔다. 슬랙 채널에는 당신 혼자 남았다.',
      '새벽 4시, 장애 알림이 울린다. 받을 사람이 없다. 당신은 노트북을 덮고 오랜만에 부모님께 전화를 걸었다.'
    ].join('\n\n')
  },
  {
    id: 'H1',
    type: 'hidden',
    title: '코인 고래 엔딩',
    subtitle: '「사업? 그냥 홀딩할걸」',
    badge: '🔍 HIDDEN ENDING H1',
    conditionDesc: '보유 코인 지갑 평가액 100억 원 이상 AND 코인 매도 0회 AND 채굴 배분 80% 이상 12개월 유지',
    storyText: [
      '사업계획서도, IR 피칭도, e나라도움도 다 필요 없었다. 그저 캐고, 쥐고, 기다렸을 뿐.',
      '당신은 회사를 정리하고 제주도로 내려가 바닷가 카페를 차렸다. 메뉴판 맨 아래엔 작은 글씨로 적혀 있다.',
      '"GPU 채굴 상담 받습니다."'
    ].join('\n\n')
  },
  {
    id: 'H2',
    type: 'hidden',
    title: '신림동의 전설 엔딩',
    subtitle: '「원룸에서 시작해 원룸에서 끝나다」',
    badge: '🔍 HIDDEN ENDING H2',
    conditionDesc: '사무실 이전 없이 신림동 원룸 1곳만으로 누적 순이익 10억 원 달성 AND 집주인 분노 100 미도달',
    storyText: [
      '집주인 아줌마가 김치통을 들고 찾아왔다. "총각, 요즘 전기세 많이 나오지? 이거 먹고 힘내."',
      '알고 보니 아줌마는 당신 회사의 첫 번째 엔젤투자자가 되고 싶었던 것이다.',
      '신림동 고시원 커뮤니티에 전설이 생겼다: "302호에 GPU 신이 산다."'
    ].join('\n\n')
  },
  {
    id: 'T1',
    type: 'true',
    title: '엔비디아 인수 엔딩',
    subtitle: '「젠슨 황의 가죽재킷」',
    badge: '👑 TRUE ENDING T1',
    conditionDesc: '총 연산력 50,000 TFLOPS 이상 AND 기업가치 1조 원 이상 AND 대표 지분 30% 이상 AND M&A 수락',
    storyText: [
      '산타클라라 본사. 가죽재킷을 입은 남자가 악수를 청했다. "Your Korean GPU cloud is amazing."',
      '인수가 1조 2천억. 당신의 지분 가치는 3,600억 원.',
      '계약서에 서명한 뒤, 당신은 전 직원에게 스톡옵션 행사 안내 메일을 보냈다. 제목: "우리 해냈습니다."',
      '그날 밤, 신림동 원룸 앞을 지나며 당신은 302호 창문을 한참 올려다봤다.'
    ].join('\n\n')
  },
  {
    id: 'T2',
    type: 'true',
    title: '국가 AGI 인프라 엔딩',
    subtitle: '「소버린 AI의 심장」',
    badge: '👑 TRUE ENDING T2',
    conditionDesc: '춘천 하이퍼스케일 DC 보유 AND 연산력 200,000 TFLOPS 이상 AND PUE 1.15 이하 AND 코스닥 상장 완료 AND 감사 적발 0회',
    storyText: [
      '과학기술정보통신부 장관이 직접 춘천을 찾았다. "대한민국 국가 AI 컴퓨팅 센터 운영사로 귀사를 선정합니다."',
      '소양강 차가운 물이 10만 장의 GPU를 식히며 흐른다. 한국어를 가장 잘하는 AI가 이곳에서 태어났다.',
      '기자가 물었다. "처음 시작은 어땠나요?"',
      '"당근마켓에서 산 9만 원짜리 GTX 1060이요."'
    ].join('\n\n')
  }
];

window.GAME_DATA.expirationGrades = [
  {
    grade: 'S',
    minValuation: 500000000000, // 5,000억 원+
    title: '🦄 데카콘 직전의 K-유니콘',
    desc: '7년 만에 대한민국 AI 인프라 생태계를 평정한 전설적인 하이퍼스케일 유니콘으로 성장했습니다!'
  },
  {
    grade: 'A',
    minValuation: 100000000000, // 1,000억 원+
    title: '🦄 유니콘 (코스닥 상장사)',
    desc: '험난한 GPU 품귀와 전력난을 이겨내고 당당히 기업가치 1,000억 원을 돌파한 AI 인프라 상장사가 되었습니다.'
  },
  {
    grade: 'B',
    minValuation: 10000000000,  // 100억 원+
    title: '🚀 시리즈 B 성공한 탄탄한 스타트업',
    desc: '판교와 구로에서 인정받는 알짜배기 AI 클라우드 기업으로 자리 잡았습니다.'
  },
  {
    grade: 'C',
    minValuation: 1000000000,   // 10억 원+
    title: '🏢 흑자 내는 강소기업',
    desc: '거창한 유니콘은 아니지만, 매달 꼬박꼬박 흑자를 내는 튼튼한 GPU 서버 호스팅 회사를 일궈냈습니다.'
  },
  {
    grade: 'D',
    minValuation: -Infinity,    // 10억 원 미만
    title: '🥲 "그래도 망하진 않았다"',
    desc: '7년의 창업 마라톤 끝에 파산하지 않고 살아남은 것만으로도 대한민국 상위 10%의 생존자입니다.'
  }
];
