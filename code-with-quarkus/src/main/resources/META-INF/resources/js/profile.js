// 13주차 12~13페이지: 프로필 정보 표시 + 회원정보 수정 유효성 검사
// 13주차 18페이지: 비밀번호 변경 유효성 검사 + SHA-256 처리
// 13주차 23페이지: 비밀번호 변경 성공 Toast 처리

window.addEventListener("load", function () {
  // 1. 프로필 정보 불러오기
  fetch("/profile/info")
    .then((res) => res.json())
    .then((data) => {
      const username = data.username || "";
      const email = data.email || "";
      const phone = data.phone || "";
      const profileImage = data.profileImage || "";

      // 기존 정보 테이블 표시
      document.getElementById("infoUsername").textContent =
        username || "정보 없음";
      document.getElementById("infoEmail").textContent = email || "정보 없음";
      document.getElementById("infoPhone").textContent = phone || "정보 없음";

      // 프로필 이미지 표시
      if (profileImage) {
        document.getElementById("profileImg").src =
          "/uploads/profile/" + profileImage;
      }

      // 수정 폼에 기존 값 자동 채우기
      const updateEmail = document.getElementById("updateEmail");
      const updatePhone = document.getElementById("updatePhone");

      if (updateEmail) {
        updateEmail.value = email;
      }

      if (updatePhone) {
        updatePhone.value = phone;
      }

      // 네비바 프로필 링크 Tooltip에 사용자명 표시
      const profileLink = document.getElementById("profileNavLink");

      if (profileLink) {
        profileLink.setAttribute("data-bs-title", " " + username);
        new bootstrap.Tooltip(profileLink);
      }
    })
    .catch((error) => {
      console.error("프로필 정보를 불러오는 중 오류 발생:", error);

      document.getElementById("infoUsername").textContent = "정보 없음";
      document.getElementById("infoEmail").textContent = "정보 없음";
      document.getElementById("infoPhone").textContent = "정보 없음";
    });

  // 2. URL 파라미터 메시지 처리
  const params = new URLSearchParams(window.location.search);
  const error = params.get("error");
  const success = params.get("success");

  const updateMsg = document.getElementById("updateMsg");
  const passwordMsg = document.getElementById("passwordMsg");

  // 개인정보 수정 결과 메시지
  if (success === "updated" && updateMsg) {
    updateMsg.className = "alert alert-success";
    updateMsg.textContent = "개인정보가 수정되었습니다.";
  } else if (error === "duplicate_email" && updateMsg) {
    updateMsg.className = "alert alert-danger";
    updateMsg.textContent = "이미 사용 중인 이메일입니다.";
  }

  // 13주차 23페이지: 비밀번호 변경 성공 Toast 출력 후 로그아웃
  if (success === "password_changed") {
    showToast(
      "비밀번호가 변경되었습니다. 잠시 후 로그인 페이지로 이동합니다.",
      "success",
    );

    // 3.5초 후 로그아웃 처리 + 로그인 페이지 이동
    setTimeout(function () {
      window.location.href = "/logout?next=login";
    }, 3500);
  }

  // 현재 비밀번호 불일치 메시지
  if (error === "wrong_password" && passwordMsg) {
    passwordMsg.className = "alert alert-danger";
    passwordMsg.textContent = "현재 비밀번호가 올바르지 않습니다.";
  } else if (error === "password_fail" && passwordMsg) {
    passwordMsg.className = "alert alert-danger";
    passwordMsg.textContent = "비밀번호 변경에 실패했습니다.";
  }

  // 12주차 업로드 오류 메시지 유지
  const uploadErrorMsg = document.getElementById("uploadErrorMsg");

  if (error === "invalid_type" && uploadErrorMsg) {
    uploadErrorMsg.textContent = "jpg, png, gif, webp 파일만 가능합니다.";
    uploadErrorMsg.classList.remove("d-none");
  } else if (error === "too_large" && uploadErrorMsg) {
    uploadErrorMsg.textContent = "파일 크기는 5MB 이하여야 합니다.";
    uploadErrorMsg.classList.remove("d-none");
  } else if (error === "upload_fail" && uploadErrorMsg) {
    uploadErrorMsg.textContent = "업로드 실패. 다시 시도해주세요.";
    uploadErrorMsg.classList.remove("d-none");
  }
});

// 13주차 13페이지: 회원정보 수정 폼 정규식 검사
function validateAndUpdate() {
  let valid = true;

  const email = document.getElementById("updateEmail").value.trim();
  const phone = document.getElementById("updatePhone").value.trim();

  // 이메일 형식 검사
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    showFieldError(
      "updateEmail",
      "updateEmailMsg",
      "올바른 이메일 형식이 아닙니다.",
    );
    valid = false;
  } else {
    clearFieldError("updateEmail");
  }

  // 연락처 형식 검사
  const phoneRegex = /^010-\d{4}-\d{4}$/;

  if (!phoneRegex.test(phone)) {
    showFieldError(
      "updatePhone",
      "updatePhoneMsg",
      "010-0000-0000 형식으로 입력해주세요.",
    );
    valid = false;
  } else {
    clearFieldError("updatePhone");
  }

  // 유효성 검사 통과 시 폼 전송
  if (valid) {
    document.getElementById("updateForm").submit();
  }
}

// 13주차 18페이지: 비밀번호 변경 폼 검사 + SHA-256 변환
async function validateAndChangePassword() {
  let valid = true;

  const currentPasswordInput = document.getElementById("currentPasswordInput");
  const newPasswordInput = document.getElementById("newPasswordInput");
  const newPasswordConfirmInput = document.getElementById(
    "newPasswordConfirmInput",
  );

  const currentPasswordHidden = document.getElementById("currentPassword");
  const newPasswordHidden = document.getElementById("newPassword");

  const currentPassword = currentPasswordInput.value;
  const newPassword = newPasswordInput.value;
  const newPasswordConfirm = newPasswordConfirmInput.value;

  // 기존 오류 초기화
  clearFieldError("currentPasswordInput");
  clearFieldError("newPasswordInput");
  clearFieldError("newPasswordConfirmInput");

  // 현재 비밀번호 입력 여부 검사
  if (currentPassword.trim() === "") {
    showFieldError(
      "currentPasswordInput",
      "currentPasswordMsg",
      "현재 비밀번호를 입력해주세요.",
    );
    valid = false;
  }

  // 새 비밀번호: 8자 이상, 영문 + 숫자 + 특수문자 포함
  const passwordRegex =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

  if (!passwordRegex.test(newPassword)) {
    showFieldError(
      "newPasswordInput",
      "newPasswordMsg",
      "새 비밀번호는 8자 이상, 영문+숫자+특수문자를 포함해야 합니다.",
    );
    valid = false;
  }

  // 새 비밀번호 확인 검사
  if (newPassword !== newPasswordConfirm) {
    showFieldError(
      "newPasswordConfirmInput",
      "newPasswordConfirmMsg",
      "새 비밀번호가 일치하지 않습니다.",
    );
    valid = false;
  }

  if (!valid) {
    return;
  }

  // input_sha256.js의 hashPassword 함수 사용
  currentPasswordHidden.value = await hashPassword(currentPassword);
  newPasswordHidden.value = await hashPassword(newPassword);

  console.log("현재 비밀번호 SHA-256:", currentPasswordHidden.value);
  console.log("새 비밀번호 SHA-256:", newPasswordHidden.value);

  // 서버로 전송 → POST /profile/password
  document.getElementById("passwordForm").submit();
}

// profile.js 전용 오류 표시 함수
function showFieldError(fieldId, msgId, message) {
  const field = document.getElementById(fieldId);
  const msg = document.getElementById(msgId);

  if (!field) {
    return;
  }

  field.classList.add("is-invalid");
  field.classList.remove("is-valid");

  if (msg) {
    msg.textContent = message;
  }
}

// profile.js 전용 오류 제거 함수
function clearFieldError(fieldId) {
  const field = document.getElementById(fieldId);

  if (!field) {
    return;
  }

  field.classList.remove("is-invalid");
  field.classList.remove("is-valid");
}
