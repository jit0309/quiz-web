function check(answer) {
  if (answer === "len") {
    document.getElementById("result").innerText = "정답입니다!";
  } else {
    document.getElementById("result").innerText = "오답입니다.";
  }
}
