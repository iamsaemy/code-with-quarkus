// 로그인 입력값 검사 + SHA-256 암호화 후 서버 전송

// 로그인 입력 오류 표시
function showLoginError(inputEl, msgEl, message) {
  if (!inputEl || !msgEl) {
    return;
  }

  inputEl.classList.add("is-invalid");
  inputEl.classList.remove("is-valid");
  msgEl.textContent = message;
}

// 로그인 입력 오류 제거
function clearLoginError(inputEl, msgEl) {
  if (!inputEl || !msgEl) {
    return;
  }

  inputEl.classList.remove("is-invalid");
  inputEl.classList.remove("is-valid");
  msgEl.textContent = "";
}

// 로그인 페이지 상단 메시지 출력
function showLoginPageMessage(message, type = "success") {
  const loginForm = document.getElementById("loginForm");

  if (!loginForm) {
    return;
  }

  const msgBox = document.createElement("div");
  msgBox.className = `alert alert-${type} text-center mb-3`;
  msgBox.textContent = message;

  // 로그인 폼 맨 위에 메시지 삽입
  loginForm.prepend(msgBox);
}

// 12주차 마무리 과제 + 13주차 21페이지: 로그인 페이지 메시지 처리
window.addEventListener("load", function () {
  const params = new URLSearchParams(window.location.search);
  const error = params.get("error");
  const success = params.get("success");

  const usernameInput = document.getElementById("usernameInput");
  const passwordInput = document.getElementById("passwordInput");
  const usernameMsg = document.getElementById("usernameMsg");
  const passwordMsg = document.getElementById("passwordMsg");

  // 로그인 실패 메시지
  if (error === "1") {
    showLoginError(
      usernameInput,
      usernameMsg,
      "아이디 또는 패스워드가 올바르지 않습니다.",
    );

    showLoginError(
      passwordInput,
      passwordMsg,
      "아이디 또는 패스워드가 올바르지 않습니다.",
    );
  }

  // 13주차 21페이지: 비밀번호 변경 성공 메시지
  if (success === "password_changed") {
    showLoginPageMessage(
      "비밀번호가 변경되었습니다. 새 비밀번호로 다시 로그인해주세요.",
      "success",
    );
  }
});

// 로그인 버튼 클릭 시 실행
async function validateAndLogin() {
  let valid = true;

  const loginForm = document.getElementById("loginForm");

  const usernameInput = document.getElementById("usernameInput");
  const passwordInput = document.getElementById("passwordInput");

  const usernameMsg = document.getElementById("usernameMsg");
  const passwordMsg = document.getElementById("passwordMsg");

  const hiddenPassword = document.getElementById("password");

  const username = usernameInput.value.trim();
  const password = passwordInput.value;

  clearLoginError(usernameInput, usernameMsg);
  clearLoginError(passwordInput, passwordMsg);

  // 아이디: 4~20자 영문/숫자
  const usernameRegex = /^[a-zA-Z0-9]{4,20}$/;

  if (!usernameRegex.test(username)) {
    showLoginError(
      usernameInput,
      usernameMsg,
      "아이디는 4~20자 영문 또는 숫자로 입력해주세요.",
    );
    valid = false;
  }

  if (password.trim() === "") {
    showLoginError(passwordInput, passwordMsg, "패스워드를 입력해주세요.");
    valid = false;
  }

  if (!valid) {
    return;
  }

  // SHA-256 해시 생성 후 hidden input에 저장
  const hashed = await hashPassword(password);
  hiddenPassword.value = hashed;

  console.log("입력 아이디:", username);
  console.log("전송할 SHA-256 비밀번호:", hashed);

  // POST /login_check 전송
  loginForm.submit();
}
