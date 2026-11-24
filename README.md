# ganadi 공포 수학 게임 모음

## 폐장 (CLOSED) — `closed/`
10년 전 폐쇄된 놀이공원을 배경으로 한 1인칭 3D 심리 공포 탈출 게임 (Three.js, 중2 수학).

- **실행**: `closed/index.html`을 브라우저(Chrome/Edge/Safari)로 열기. 설치·서버 불필요 (Three.js는 `closed/lib/`에 포함).
  - 로컬 서버를 원하면: `cd closed && python3 -m http.server 8000` → http://localhost:8000
- **조작**: WASD 이동 · 마우스 시점(화면 클릭 시 고정) · Shift 달리기 · E 상호작용 · F 손전등 · ESC/P 일시정지 · 모바일 조이스틱/터치 지원
- **구성**: CH1 관람차(닮음) → CH2 롤러코스터(피타고라스) → CH3 회전목마(무게중심) → CH4 범퍼카(확률·경우의 수) → FINAL 정문 추격
- 문제 22개(난이도 상승, 해설 포함, 재도전 가능) · 공포 이벤트 25종(쿨다운·중복 방지 랜덤 디렉터) + 챕터별 연출/추격
- 엔딩 4종: TRUE / BAD / SECRET(사진 조각 5장) / LOOP · 자동 저장 · 이어하기
- 파일: `js/world.js`(절차적 맵) `js/horror.js`(공포 이벤트) `js/questions.js`(문제) `js/game.js`(진행/플레이어) `js/ui.js` `js/audio.js`(Web Audio 효과음)

## 13번째 방문자 — `index.html`
폐쇄된 심야 병원 배경 2D 심리 공포 + 경우의 수 퍼즐 게임 (단일 파일).
