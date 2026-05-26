const allQuestions = [
  {
    question: "Python에서 리스트의 길이를 구하는 함수는?",
    options: ["len()", "size()", "count()", "length()"],
    answer: 0
  },
  {
    question: "Python에서 함수를 정의하는 키워드는?",
    options: ["func", "function", "def", "define"],
    answer: 2
  },
  {
    question: "Python에서 클래스를 정의하는 키워드는?",
    options: ["object", "class", "struct", "type"],
    answer: 1
  },
  {
    question: "Python 리스트에서 마지막 요소를 제거하고 반환하는 메서드는?",
    options: ["remove()", "pop()", "delete()", "discard()"],
    answer: 1
  },
  {
    question: "Python에서 딕셔너리의 모든 키를 반환하는 메서드는?",
    options: ["values()", "items()", "keys()", "get()"],
    answer: 2
  },
  {
    question: "Python에서 문자열을 대문자로 변환하는 메서드는?",
    options: ["toUpper()", "uppercase()", "capitalize()", "upper()"],
    answer: 3
  },
  {
    question: "Python에서 range(5)가 생성하는 숫자 범위는?",
    options: ["1 ~ 5", "0 ~ 5", "0 ~ 4", "1 ~ 4"],
    answer: 2
  },
  {
    question: "Python에서 None 여부를 확인하는 올바른 방법은?",
    options: ["x == None", "x === None", "x is None", "isNone(x)"],
    answer: 2
  },
  {
    question: "Python에서 리스트를 제자리(in-place) 오름차순 정렬하는 메서드는?",
    options: ["order()", "arrange()", "sort()", "sorted()"],
    answer: 2
  },
  {
    question: "Python에서 print()의 줄바꿈 문자를 바꾸는 매개변수는?",
    options: ["sep", "end", "newline", "flush"],
    answer: 1
  },
  {
    question: "Python에서 올바른 리스트 컴프리헨션 문법은?",
    options: [
      "[for x in range(5): x*2]",
      "{x*2 for x in range(5)}",
      "[x*2 for x in range(5)]",
      "(x*2 for x in range(5))"
    ],
    answer: 2
  },
  {
    question: "Python에서 예외 처리 블록의 올바른 순서는?",
    options: ["catch - try - finally", "try - except - finally", "try - catch - finally", "error - handle - end"],
    answer: 1
  },
  {
    question: "Python에서 딕셔너리를 만드는 올바른 방법은?",
    options: ["d = []", "d = ()", "d = {}", "d = <>"],
    answer: 2
  },
  {
    question: "Python에서 문자열을 분리하는 메서드는?",
    options: ["divide()", "split()", "cut()", "slice()"],
    answer: 1
  },
  {
    question: "Python에서 파일을 열 때 사용하는 내장 함수는?",
    options: ["read()", "load()", "open()", "file()"],
    answer: 2
  }
];

const QUESTIONS_PER_ROUND = 5;

let questions = [];
let current = 0;
let score = 0;
let answered = false;

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function startQuiz() {
  questions = shuffle(allQuestions).slice(0, QUESTIONS_PER_ROUND);
  current = 0;
  score = 0;
  answered = false;

  document.getElementById('quizScreen').classList.remove('hidden');
  document.getElementById('resultScreen').classList.remove('active');
  document.getElementById('nextBtn').hidden = true;

  showQuestion();
}

function showQuestion() {
  const q = questions[current];
  answered = false;

  // 헤더 업데이트
  document.getElementById('questionNumber').textContent =
    `문제 ${current + 1} / ${QUESTIONS_PER_ROUND}`;
  document.getElementById('scoreDisplay').textContent = `점수: ${score}`;

  // 프로그레스 바
  document.getElementById('progressBar').style.width =
    `${(current / QUESTIONS_PER_ROUND) * 100}%`;

  // 문제
  document.getElementById('question').textContent = q.question;

  // 보기
  const optionsEl = document.getElementById('options');
  optionsEl.innerHTML = '';
  q.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = opt;
    btn.onclick = () => selectAnswer(i);
    optionsEl.appendChild(btn);
  });

  // 피드백 초기화
  document.getElementById('feedback').textContent = '';
  document.getElementById('feedback').className = 'feedback';
  document.getElementById('nextBtn').hidden = true;
}

function selectAnswer(index) {
  if (answered) return;
  answered = true;

  const q = questions[current];
  const buttons = document.querySelectorAll('.option-btn');
  const feedback = document.getElementById('feedback');

  buttons.forEach(btn => btn.disabled = true);

  if (index === q.answer) {
    buttons[index].classList.add('correct');
    feedback.textContent = '✅ 정답입니다!';
    feedback.className = 'feedback correct';
    score++;
  } else {
    buttons[index].classList.add('wrong');
    buttons[q.answer].classList.add('correct');
    feedback.textContent = `❌ 오답! 정답: ${q.options[q.answer]}`;
    feedback.className = 'feedback wrong';
  }

  document.getElementById('scoreDisplay').textContent = `점수: ${score}`;
  document.getElementById('nextBtn').hidden = false;
}

function nextQuestion() {
  current++;
  if (current < QUESTIONS_PER_ROUND) {
    showQuestion();
  } else {
    showResult();
  }
}

function showResult() {
  document.getElementById('quizScreen').classList.add('hidden');
  document.getElementById('resultScreen').classList.add('active');

  const percent = (score / QUESTIONS_PER_ROUND) * 100;

  let emoji, comment;
  if (percent === 100) {
    emoji = '🏆'; comment = '완벽합니다! 만점이에요!';
  } else if (percent >= 80) {
    emoji = '😄'; comment = '훌륭해요! 거의 다 맞혔어요!';
  } else if (percent >= 60) {
    emoji = '🙂'; comment = '좋아요! 조금만 더 공부하면 완벽!';
  } else if (percent >= 40) {
    emoji = '😅'; comment = '아쉽네요. 다시 한번 도전해보세요!';
  } else {
    emoji = '😢'; comment = '힘내세요! 연습하면 반드시 늘어요!';
  }

  document.getElementById('resultEmoji').textContent = emoji;
  document.getElementById('finalScore').textContent =
    `${score} / ${QUESTIONS_PER_ROUND}`;
  document.getElementById('resultSub').innerHTML =
    `${comment}<br><br>정답률: <strong>${percent}%</strong>`;

  // 프로그레스 바 100%
  document.getElementById('progressBar').style.width = '100%';
}

// 시작
startQuiz();
