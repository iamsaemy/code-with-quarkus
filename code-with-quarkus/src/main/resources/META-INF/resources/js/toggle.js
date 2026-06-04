// [추가] 다크/라이트 모드 토글 JavaScript
function toggleTheme() {
  const body = document.body;
  const btn = document.getElementById("themeToggleBtn");
  const navbar = document.querySelector(".navbar");

  // light-mode 클래스가 없으면 추가, 있으면 제거
  body.classList.toggle("light-mode");

  // 현재 light-mode인지 확인
  if (body.classList.contains("light-mode")) {
    btn.textContent = "☀️ LIGHT";

    navbar.classList.remove("navbar-dark", "bg-dark");
    navbar.classList.add("navbar-light", "bg-light");
  } else {
    btn.textContent = "🌙 DARK";

    navbar.classList.remove("navbar-light", "bg-light");
    navbar.classList.add("navbar-dark", "bg-dark");
  }
}
