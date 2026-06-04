// 13주차 7페이지: Bootstrap Toast 공통 함수

/**
 * Bootstrap Toast 메시지를 출력하는 함수
 * type 값에 따라 색상을 변경한다.
 *
 * success: 초록색
 * danger: 빨간색
 * warning: 노란색
 */
function showToast(message, type = "success") {
  const toastEl = document.getElementById("liveToast");
  const toastBody = document.getElementById("toastBody");

  // Toast HTML이 없는 페이지에서는 오류 없이 종료
  if (!toastEl || !toastBody) {
    return;
  }

  // 기존 색상 클래스 초기화 후 새 색상 적용
  toastEl.className = `toast align-items-center text-white bg-${type} border-0`;

  // 메시지 내용 변경
  toastBody.textContent = message;

  // Bootstrap Toast 실행
  const toast = new bootstrap.Toast(toastEl, {
    delay: 3000,
  });

  toast.show();
}
