// 수학 문제 데이터 (중2: 닮음, 피타고라스 정리, 무게중심, 확률과 경우의 수)
// answer: choices 배열에서 정답의 인덱스
const SVG = {
  shadow: `<svg viewBox="0 0 260 120"><line x1="10" y1="105" x2="250" y2="105" stroke="#666"/>
  <line x1="40" y1="105" x2="40" y2="75" stroke="#c33" stroke-width="3"/><line x1="40" y1="75" x2="80" y2="105" stroke="#888" stroke-dasharray="3"/>
  <text x="20" y="92" fill="#aaa" font-size="10">1.5m</text><text x="52" y="117" fill="#aaa" font-size="10">2m</text>
  <line x1="140" y1="105" x2="140" y2="15" stroke="#c33" stroke-width="4"/><line x1="140" y1="15" x2="245" y2="105" stroke="#888" stroke-dasharray="3"/>
  <text x="118" y="62" fill="#aaa" font-size="10">h</text><text x="185" y="117" fill="#aaa" font-size="10">24m</text></svg>`,
  parallel: `<svg viewBox="0 0 260 130"><polygon points="130,10 30,120 230,120" fill="none" stroke="#999"/>
  <line x1="63" y1="83" x2="197" y2="83" stroke="#c33" stroke-width="2"/>
  <text x="125" y="8" fill="#ccc" font-size="11">A</text><text x="18" y="128" fill="#ccc" font-size="11">B</text><text x="234" y="128" fill="#ccc" font-size="11">C</text>
  <text x="50" y="83" fill="#ccc" font-size="11">D</text><text x="201" y="83" fill="#ccc" font-size="11">E</text></svg>`,
  rail: `<svg viewBox="0 0 260 120"><line x1="10" y1="100" x2="60" y2="100" stroke="#999" stroke-width="4"/>
  <line x1="200" y1="30" x2="250" y2="30" stroke="#999" stroke-width="4"/><line x1="60" y1="100" x2="200" y2="30" stroke="#c33" stroke-dasharray="5"/>
  <line x1="60" y1="100" x2="200" y2="100" stroke="#555"/><line x1="200" y1="100" x2="200" y2="30" stroke="#555"/>
  <text x="115" y="115" fill="#aaa" font-size="11">8m</text><text x="205" y="70" fill="#aaa" font-size="11">6m</text><text x="110" y="58" fill="#c66" font-size="11">?</text></svg>`,
  centroid: `<svg viewBox="0 0 260 130"><polygon points="130,10 30,120 230,120" fill="none" stroke="#999"/>
  <line x1="130" y1="10" x2="130" y2="120" stroke="#777" stroke-dasharray="3"/><circle cx="130" cy="83" r="3" fill="#c33"/>
  <line x1="63" y1="83" x2="197" y2="83" stroke="#c33" stroke-width="2"/>
  <text x="136" y="80" fill="#c66" font-size="11">G</text><text x="125" y="8" fill="#ccc" font-size="11">A</text><text x="18" y="128" fill="#ccc" font-size="11">B</text>
  <text x="234" y="128" fill="#ccc" font-size="11">C</text><text x="50" y="83" fill="#ccc" font-size="11">E</text><text x="201" y="83" fill="#ccc" font-size="11">F</text><text x="126" y="130" fill="#ccc" font-size="10">D</text></svg>`
};

const QUESTIONS = [
  // CHAPTER 1 — 닮음
  { id: 'c1q1', diff: '쉬움', q: '△ABC ∽ △DEF 이고 닮음비가 2 : 3 이다. AB = 6cm 일 때, 대응변 DE의 길이는?',
    choices: ['9cm', '4cm', '12cm', '8cm'], answer: 0,
    exp: 'AB : DE = 2 : 3 이므로 6 : DE = 2 : 3 → 2·DE = 18 → DE = 9cm' },
  { id: 'c1q2', diff: '보통', svg: SVG.shadow, q: '같은 시각, 길이 1.5m인 막대의 그림자는 2m였다. 관람차 기둥의 그림자가 24m일 때, 기둥의 높이는?',
    choices: ['18m', '32m', '16m', '20m'], answer: 0,
    exp: '햇빛은 평행하므로 막대와 그림자, 기둥과 그림자가 만드는 두 직각삼각형은 AA 닮음이다.\n1.5 : 2 = h : 24 → 2h = 36 → h = 18m' },
  { id: 'c1q3', diff: '보통', svg: SVG.parallel, q: '△ABC에서 DE ∥ BC 이고 AD = 4, DB = 2, DE = 6 일 때, BC의 길이는?',
    choices: ['9', '8', '12', '3'], answer: 0,
    exp: 'DE ∥ BC 이므로 △ADE ∽ △ABC (AA 닮음).\nAD : AB = 4 : 6 = 2 : 3 → DE : BC = 2 : 3 → 6 : BC = 2 : 3 → BC = 9' },
  { id: 'c1q4', diff: '어려움', q: '닮음비가 3 : 5 인 두 닮은 평면도형의 넓이의 비는?',
    choices: ['9 : 25', '3 : 5', '6 : 10', '27 : 125'], answer: 0,
    exp: '닮음비가 m : n 이면 넓이의 비는 m² : n² 이다. → 3² : 5² = 9 : 25' },
  { id: 'c1q5', diff: '매우 어려움', q: '서로 닮은 두 곤돌라(입체도형)의 부피의 비가 8 : 27 이다. 두 곤돌라의 겉넓이의 비는?',
    choices: ['4 : 9', '2 : 3', '8 : 27', '16 : 81'], answer: 0,
    exp: '부피의 비 = 닮음비의 세제곱. 8 : 27 = 2³ : 3³ → 닮음비 2 : 3\n겉넓이의 비 = 닮음비의 제곱 = 2² : 3² = 4 : 9' },

  // CHAPTER 2 — 피타고라스 정리
  { id: 'c2q1', diff: '쉬움', q: '직각을 낀 두 변의 길이가 3m, 4m 인 직각삼각형의 빗변의 길이는?',
    choices: ['5m', '7m', '6m', '√7 m'], answer: 0,
    exp: '피타고라스 정리: c² = a² + b² = 9 + 16 = 25 → c = 5m' },
  { id: 'c2q2', diff: '보통', svg: SVG.rail, q: '끊어진 레일의 두 끝점 사이의 수평 거리는 8m, 높이 차는 6m이다. 두 끝을 직선 레일로 연결하려면 레일이 몇 m 필요한가?',
    choices: ['10m', '14m', '12m', '2√7 m'], answer: 0,
    exp: '수평 거리와 높이 차는 직각을 이룬다. 8² + 6² = 64 + 36 = 100 → √100 = 10m' },
  { id: 'c2q3', diff: '보통', q: '빗변의 길이가 13, 다른 한 변의 길이가 5인 직각삼각형에서 나머지 한 변의 길이는?',
    choices: ['12', '8', '√194', '11'], answer: 0,
    exp: 'x² + 5² = 13² → x² = 169 − 25 = 144 → x = 12' },
  { id: 'c2q4', diff: '어려움', q: '세 변의 길이가 다음과 같은 삼각형 중 직각삼각형인 것은?',
    choices: ['6, 8, 10', '4, 5, 6', '5, 6, 7', '7, 8, 9'], answer: 0,
    exp: '가장 긴 변의 제곱이 나머지 두 변의 제곱의 합과 같으면 직각삼각형이다.\n6² + 8² = 36 + 64 = 100 = 10² ✔\n나머지: 4²+5²=41≠6²=36, 5²+6²=61≠7²=49, 7²+8²=113≠9²=81 → 직각삼각형이 아니다.' },
  { id: 'c2q5', diff: '매우 어려움', q: '한 변의 길이가 6m인 정삼각형 모양 지지대의 높이는?',
    choices: ['3√3 m', '3√2 m', '6√3 m', '2√3 m'], answer: 0,
    exp: '정삼각형의 높이는 밑변을 이등분한다 → 밑변 절반 3m, 빗변 6m인 직각삼각형.\nh² = 6² − 3² = 27 → h = √27 = 3√3 m' },

  // CHAPTER 3 — 삼각형의 무게중심
  { id: 'c3q1', diff: '쉬움', q: '△ABC의 무게중심을 G라 하자. 중선 AD의 길이가 12cm일 때, AG의 길이는?',
    choices: ['8cm', '6cm', '4cm', '9cm'], answer: 0,
    exp: '무게중심은 중선을 꼭짓점으로부터 2 : 1로 나눈다. AG = 12 × 2/3 = 8cm' },
  { id: 'c3q2', diff: '보통', q: '△ABC의 무게중심 G가 중선 AD 위에 있고 GD = 3cm 일 때, 중선 AD의 길이는?',
    choices: ['9cm', '6cm', '12cm', '4.5cm'], answer: 0,
    exp: 'AG : GD = 2 : 1 → AG = 6cm. AD = AG + GD = 6 + 3 = 9cm' },
  { id: 'c3q3', diff: '보통', q: '넓이가 36cm²인 △ABC의 무게중심을 G라 할 때, △GBC의 넓이는?',
    choices: ['12cm²', '18cm²', '9cm²', '6cm²'], answer: 0,
    exp: '△GAB, △GBC, △GCA 의 넓이는 모두 같다. → 36 ÷ 3 = 12cm²' },
  { id: 'c3q4', diff: '어려움', q: '넓이가 54cm²인 △ABC의 무게중심을 G, 변 BC의 중점을 D라 할 때, △GBD의 넓이는?',
    choices: ['9cm²', '18cm²', '6cm²', '27cm²'], answer: 0,
    exp: '세 중선은 △ABC를 넓이가 같은 6개의 삼각형으로 나눈다. △GBD = 54 ÷ 6 = 9cm²' },
  { id: 'c3q5', diff: '매우 어려움', svg: SVG.centroid, q: '△ABC의 무게중심 G를 지나고 BC에 평행한 직선이 AB, AC와 만나는 점을 각각 E, F라 하자. BC = 18cm일 때, EF의 길이는?',
    choices: ['12cm', '9cm', '6cm', '13.5cm'], answer: 0,
    exp: 'AG : AD = 2 : 3 이고 EF ∥ BC 이므로 △AEF ∽ △ABC, 닮음비 2 : 3.\nEF = 18 × 2/3 = 12cm' },

  // CHAPTER 4 — 확률과 경우의 수
  { id: 'c4q1', diff: '쉬움', q: '주사위 한 개를 던질 때, 짝수의 눈이 나올 확률은?',
    choices: ['1/2', '1/3', '1/6', '2/3'], answer: 0,
    exp: '짝수 눈: 2, 4, 6 → 3가지. 전체 6가지. 확률 = 3/6 = 1/2' },
  { id: 'c4q2', diff: '보통', q: 'ON / OFF 두 가지 상태를 갖는 스위치 3개로 만들 수 있는 모든 경우의 수는?',
    choices: ['8', '6', '9', '3'], answer: 0,
    exp: '스위치마다 2가지씩, 곱의 법칙: 2 × 2 × 2 = 8' },
  { id: 'c4q3', diff: '보통', q: '범퍼카 5대 중 2대를 골라 1번 트랙과 2번 트랙에 한 대씩 배치하는 경우의 수는?',
    choices: ['20', '10', '25', '9'], answer: 0,
    exp: '1번 트랙에 5가지, 2번 트랙에 남은 4가지 → 5 × 4 = 20 (순서가 있음)' },
  { id: 'c4q4', diff: '어려움', q: '주사위 두 개를 동시에 던질 때, 나온 눈의 합이 7일 확률은?',
    choices: ['1/6', '7/36', '1/12', '5/36'], answer: 0,
    exp: '전체 6 × 6 = 36가지. 합이 7: (1,6)(2,5)(3,4)(4,3)(5,2)(6,1) → 6가지. 6/36 = 1/6' },
  { id: 'c4q5', diff: '매우 어려움', q: '4개의 스위치가 각각 1/2의 확률로 켜진다. 적어도 한 개의 스위치가 켜질 확률은?',
    choices: ['15/16', '1/16', '3/4', '1/2'], answer: 0,
    exp: '(적어도 한 개 켜질 확률) = 1 − (모두 꺼질 확률) = 1 − (1/2)⁴ = 1 − 1/16 = 15/16' },

  // FINAL — 정문
  { id: 'f1', diff: '종합', q: '정문 제어 장치: 놀이기구 4개 중 서로 다른 2개를 골라 순서 없이 점검 기록을 남기는 경우의 수는?',
    choices: ['6', '12', '4', '8'], answer: 0,
    exp: '순서가 있다면 4 × 3 = 12. 순서가 없으므로 같은 쌍이 2번씩 세어짐 → 12 ÷ 2 = 6' },
  { id: 'f2', diff: '종합', q: '정문 제어 장치: 비상 전원은 남쪽으로 9m, 동쪽으로 12m 떨어져 있다. 정문에서 비상 전원까지의 직선 거리는?',
    choices: ['15m', '21m', '13m', '3√7 m'], answer: 0,
    exp: '남쪽과 동쪽은 직각. 9² + 12² = 81 + 144 = 225 → √225 = 15m' }
];
QUESTIONS.forEach(q => { q.choices = q.choices.map((t, i) => ({ t, ok: i === q.answer })); });
const QMAP = Object.fromEntries(QUESTIONS.map(q => [q.id, q]));
