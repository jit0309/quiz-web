# quiz-web — 작업 가이드

경희대 파이썬/응용데이터분석 기출 퀴즈 웹앱. Vercel 정적 배포(`main` 푸시 시 자동 배포). 제품 배경과 요구사항은 [PRD.md](PRD.md).

## 구조
- `index.html` — 앱 전부(HTML/CSS/JS 인라인). 시험 목록은 `EXAMS`(Python), `EXAMS_ADA`(응용데이터분석) 배열.
- `data/*.json` — 시험별 문제. 파일명 = 시험 id.
- `script.js` — 초기 버전의 잔재. `index.html`에서 로드하지 않음. 수정 불필요.
- 빌드/테스트 없음. 로컬 확인은 정적 서버로 `index.html`을 열면 됨(`fetch`가 필요해서 `file://`은 불가).

## 시험 id 규칙
`{연도}_{학기}_{m|f}` — m=중간, f=기말. 예: `2023_1_m`, `2024_2_f`. 응용데이터분석은 `ada_` 접두사(`ada_2024_1_m`).
새 시험 추가 = `data/<id>.json` 생성 + `index.html`의 `EXAMS`/`EXAMS_ADA`에 항목 추가.

## 문제 JSON 스키마
배열 안의 객체:
```
id            "<시험id>_<번호>"  (파일명과 반드시 일치시킬 것)
type          "mcq" (대부분) | "saq"
language      "python"
tags          []
question      "문제 문장\n\n코드"   ← 코드는 문장 뒤 빈 줄(\n\n) 다음에 붙임. 렌더러가 첫 단락=문장, 나머지=코드로 분리
options       [{ "text": "...", "isCorrect": true|false }]
answers       정답 텍스트 또는 null (렌더링엔 options.isCorrect가 쓰임)
explanation_kor / explanation_eng   한/영 해설
image         (선택) base64 data URI — 외부 파일 대신 JSON에 임베드
```
로딩 시 `question`이 null이거나 `options`가 비었거나 `isCorrect`가 하나도 없는 문제는 **조용히 제외**된다. 문제가 안 보이면 이 조건부터 확인.

## 데이터 수정 시 체크리스트
1. 코드가 있는 문제는 실제로 실행(또는 손으로 추적)해 정답/해설을 검증한다.
2. 정답 보기가 정확히 1개인지 확인(복수 정답 방지: 따옴표·공백 같은 사소한 차이 주의).
3. 해설의 값이 코드와 일치하는지 확인(예: 문자열 길이).
4. 다른 시험 파일을 통째로 복사해 덮어쓰지 말 것. id 접두사와 문제 내용이 해당 시험 것인지 확인.
5. 수정 후 `node -e "JSON.parse(require('fs').readFileSync('data/<id>.json','utf8'))"`로 파싱 확인.
6. 원본 소스는 사용자 바탕화면의 시험별 폴더(예: `2024-2_Mid/`)에 `.json`(문제문장·보기·해설)과 `.py`(코드)로 분리돼 있다. 의심스러우면 원본과 대조.

## 외부 연동
- Google 로그인(GSI)으로 사용자 식별, 닉네임은 `localStorage`(`quizUser` 등)와 시트에 저장.
- 점수/랭킹은 Google Apps Script 웹앱(`SHEET_URL`, `index.html` 상단 CONFIG)에 GET(조회)/POST(저장). 랭킹은 계정별 최고 점수만, 과목(python/ada)별 탭.

## 작업 규칙
- 커밋/푸시는 사용자가 요청할 때만. 푸시하면 곧바로 운영에 반영된다.
- 커밋 메시지는 영어 한 줄 요약(기존 관례), 말미에 Co-Authored-By 라인.
