// 프로필 정보 표시 + 회원정보 수정 유효성 검사
// 비밀번호 변경 유효성 검사 + SHA-256 처리
// 추가 구현 기능 1: 내가 찜한 챔피언 목록 표시 및 삭제
// 추가 구현 기능 2: 최근 본 챔피언 목록 표시 및 초기화
// 추가 구현 기능 3: 챔피언 개인 메모 저장, 조회, 삭제
// 추가 구현 기능 4: 나의 활동 통계 대시보드
// 추가 구현 기능 5: 조건 기반 챔피언 추천
// 추가 구현 기능 6: 랜덤 챔피언 추천
// 추가 구현 기능 7: 내가 찜한 챔피언 중 랜덤 추천

window.addEventListener("load", function () {
  fetch("/profile/info")
    .then((res) => res.json())
    .then((data) => {
      const username = data.username || "";
      const email = data.email || "";
      const phone = data.phone || "";
      const profileImage = data.profileImage || "";

      document.getElementById("infoUsername").textContent =
        username || "정보 없음";
      document.getElementById("infoEmail").textContent = email || "정보 없음";
      document.getElementById("infoPhone").textContent = phone || "정보 없음";

      if (profileImage) {
        document.getElementById("profileImg").src =
          "/uploads/profile/" + profileImage;
      }

      const updateEmail = document.getElementById("updateEmail");
      const updatePhone = document.getElementById("updatePhone");

      if (updateEmail) updateEmail.value = email;
      if (updatePhone) updatePhone.value = phone;

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

  loadUserStats();
  loadFavoriteChampions();
  loadRecentChampions();
  loadMemoChampionOptions();
  loadChampionMemos();
  handleProfileMessages();
});

function loadUserStats() {
  fetch("/stats/my")
    .then((response) => {
      if (response.status === 401) {
        console.warn("활동 통계 조회 실패: 로그인 필요");
        return null;
      }

      if (!response.ok) {
        throw new Error("활동 통계 조회 실패");
      }

      return response.json();
    })
    .then((stats) => {
      if (!stats) return;

      const favoriteCount = document.getElementById("statFavoriteCount");
      const recentCount = document.getElementById("statRecentCount");
      const memoCount = document.getElementById("statMemoCount");
      const totalCount = document.getElementById("statTotalCount");

      if (favoriteCount) favoriteCount.textContent = stats.favoriteCount;
      if (recentCount) recentCount.textContent = stats.recentCount;
      if (memoCount) memoCount.textContent = stats.memoCount;
      if (totalCount) totalCount.textContent = stats.totalActivityCount;

      console.log("활동 통계:", stats);
    })
    .catch((error) => {
      console.error("활동 통계를 불러오는 중 오류 발생:", error);
    });
}

function loadFavoriteChampions() {
  const favoriteList = document.getElementById("favoriteChampionList");

  if (!favoriteList) return;

  fetch("/favorites/my")
    .then((response) => {
      if (response.status === 401) {
        favoriteList.innerHTML = `
          <div class="alert alert-warning mb-0">
            로그인 후 즐겨찾기 목록을 확인할 수 있습니다.
          </div>
        `;
        return [];
      }

      if (!response.ok) {
        throw new Error("즐겨찾기 목록 조회 실패");
      }

      return response.json();
    })
    .then((champions) => {
      if (!champions || champions.length === 0) {
        favoriteList.innerHTML = `
          <div class="alert alert-secondary mb-0">
            아직 즐겨찾기한 챔피언이 없습니다.<br>
            메인화면에서 챔피언을 검색한 뒤 ⭐ 즐겨찾기를 눌러보세요.
          </div>
        `;
        loadUserStats();
        return;
      }

      favoriteList.innerHTML = champions
        .map(
          (champion) => `
            <div class="d-flex align-items-center bg-light text-dark rounded p-2 mb-2">
              <img
                src="${normalizeImagePath(champion.img)}"
                alt="${champion.name}"
                width="64"
                height="64"
                class="rounded me-3"
                style="object-fit: cover;"
              />

              <div class="flex-grow-1">
                <div class="fw-bold">
                  ${champion.name}
                  <span class="text-secondary small">(${champion.engName})</span>
                </div>

                <div class="small text-secondary">
                  역할: ${champion.role}
                  &nbsp;|&nbsp;
                  라인: ${champion.line}
                  &nbsp;|&nbsp;
                  난이도: ${champion.difficulty}
                </div>
              </div>

              <button
                type="button"
                class="btn btn-sm btn-outline-danger"
                onclick="deleteFavoriteChampion(${champion.id})"
              >
                삭제
              </button>
            </div>
          `,
        )
        .join("");

      loadUserStats();
    })
    .catch((error) => {
      console.error("즐겨찾기 목록을 불러오는 중 오류 발생:", error);

      favoriteList.innerHTML = `
        <div class="alert alert-danger mb-0">
          즐겨찾기 목록을 불러오는 중 오류가 발생했습니다.
        </div>
      `;
    });
}

function deleteFavoriteChampion(championId) {
  fetch(`/favorites/${championId}`, {
    method: "DELETE",
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("즐겨찾기 삭제 실패");
      }

      return response.json();
    })
    .then((data) => {
      console.log("즐겨찾기 삭제 결과:", data);

      if (typeof showToast === "function") {
        showToast(data.message || "즐겨찾기가 삭제되었습니다.", "warning");
      }

      loadFavoriteChampions();
      loadUserStats();
    })
    .catch((error) => {
      console.error("즐겨찾기 삭제 중 오류 발생:", error);

      if (typeof showToast === "function") {
        showToast("즐겨찾기 삭제 중 오류가 발생했습니다.", "danger");
      } else {
        alert("즐겨찾기 삭제 중 오류가 발생했습니다.");
      }
    });
}

function loadRecentChampions() {
  const recentList = document.getElementById("recentChampionList");

  if (!recentList) return;

  fetch("/recent/my")
    .then((response) => {
      if (response.status === 401) {
        recentList.innerHTML = `
          <div class="alert alert-warning mb-0">
            로그인 후 최근 본 챔피언 목록을 확인할 수 있습니다.
          </div>
        `;
        return [];
      }

      if (!response.ok) {
        throw new Error("최근 본 챔피언 목록 조회 실패");
      }

      return response.json();
    })
    .then((champions) => {
      if (!champions || champions.length === 0) {
        recentList.innerHTML = `
          <div class="alert alert-secondary mb-0">
            아직 최근 본 챔피언이 없습니다.<br>
            메인화면에서 챔피언을 검색한 뒤 챔피언 카드를 클릭해보세요.
          </div>
        `;
        loadUserStats();
        return;
      }

      recentList.innerHTML = champions
        .map(
          (champion) => `
            <div class="d-flex align-items-center bg-light text-dark rounded p-2 mb-2">
              <img
                src="${normalizeImagePath(champion.img)}"
                alt="${champion.name}"
                width="64"
                height="64"
                class="rounded me-3"
                style="object-fit: cover;"
              />

              <div class="flex-grow-1">
                <div class="fw-bold">
                  ${champion.name}
                  <span class="text-secondary small">(${champion.engName})</span>
                </div>

                <div class="small text-secondary">
                  역할: ${champion.role}
                  &nbsp;|&nbsp;
                  라인: ${champion.line}
                  &nbsp;|&nbsp;
                  난이도: ${champion.difficulty}
                </div>
              </div>

              <span class="badge bg-primary">최근 확인</span>
            </div>
          `,
        )
        .join("");

      loadUserStats();
    })
    .catch((error) => {
      console.error("최근 본 챔피언 목록을 불러오는 중 오류 발생:", error);

      recentList.innerHTML = `
        <div class="alert alert-danger mb-0">
          최근 본 챔피언 목록을 불러오는 중 오류가 발생했습니다.
        </div>
      `;
    });
}

function clearRecentChampions() {
  fetch("/recent/clear", {
    method: "DELETE",
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("최근 본 챔피언 목록 삭제 실패");
      }

      return response.json();
    })
    .then((data) => {
      console.log("최근 본 챔피언 목록 삭제 결과:", data);

      if (typeof showToast === "function") {
        showToast(data.message || "최근 본 목록이 삭제되었습니다.", "warning");
      }

      loadRecentChampions();
      loadUserStats();
    })
    .catch((error) => {
      console.error("최근 본 챔피언 목록 삭제 중 오류 발생:", error);

      if (typeof showToast === "function") {
        showToast("최근 본 목록 삭제 중 오류가 발생했습니다.", "danger");
      } else {
        alert("최근 본 목록 삭제 중 오류가 발생했습니다.");
      }
    });
}

function loadMemoChampionOptions() {
  const select = document.getElementById("memoChampionSelect");

  if (!select) return;

  fetch("/champions")
    .then((response) => {
      if (!response.ok) {
        throw new Error("챔피언 목록 조회 실패");
      }

      return response.json();
    })
    .then((champions) => {
      select.innerHTML = `<option value="">챔피언을 선택하세요</option>`;

      champions.forEach((champion) => {
        const option = document.createElement("option");
        option.value = champion.id;
        option.textContent = `${champion.name} (${champion.engName})`;
        select.appendChild(option);
      });
    })
    .catch((error) => {
      console.error("메모용 챔피언 목록을 불러오는 중 오류 발생:", error);
      select.innerHTML = `<option value="">챔피언 목록 불러오기 실패</option>`;
    });
}

function saveChampionMemo() {
  const championSelect = document.getElementById("memoChampionSelect");
  const memoText = document.getElementById("memoText");

  if (!championSelect || !memoText) return;

  const championId = championSelect.value;
  const memo = memoText.value.trim();

  if (!championId) {
    showMemoMessage("메모를 작성할 챔피언을 선택해주세요.", "danger");
    return;
  }

  if (!memo) {
    showMemoMessage("메모 내용을 입력해주세요.", "danger");
    return;
  }

  if (memo.length > 1000) {
    showMemoMessage("메모는 최대 1000자까지 입력할 수 있습니다.", "danger");
    return;
  }

  const formData = new URLSearchParams();
  formData.append("championId", championId);
  formData.append("memo", memo);

  fetch("/memos/save", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData.toString(),
  })
    .then((response) => {
      if (response.status === 401) {
        throw new Error("로그인 후 이용할 수 있습니다.");
      }

      if (!response.ok) {
        throw new Error("메모 저장 실패");
      }

      return response.json();
    })
    .then((data) => {
      console.log("메모 저장 결과:", data);

      showMemoMessage(
        data.message || "챔피언 메모가 저장되었습니다.",
        "success",
      );

      if (typeof showToast === "function") {
        showToast(data.message || "챔피언 메모가 저장되었습니다.", "success");
      }

      memoText.value = "";
      loadChampionMemos();
      loadUserStats();
    })
    .catch((error) => {
      console.error("챔피언 메모 저장 중 오류 발생:", error);
      showMemoMessage("챔피언 메모 저장 중 오류가 발생했습니다.", "danger");
    });
}

function loadChampionMemos() {
  const memoList = document.getElementById("memoList");

  if (!memoList) return;

  fetch("/memos/my")
    .then((response) => {
      if (response.status === 401) {
        memoList.innerHTML = `
          <div class="alert alert-warning mb-0">
            로그인 후 메모 목록을 확인할 수 있습니다.
          </div>
        `;
        return [];
      }

      if (!response.ok) {
        throw new Error("메모 목록 조회 실패");
      }

      return response.json();
    })
    .then((memos) => {
      if (!memos || memos.length === 0) {
        memoList.innerHTML = `
          <div class="alert alert-secondary mb-0">
            아직 저장된 챔피언 메모가 없습니다.<br>
            챔피언을 선택하고 메모를 작성해보세요.
          </div>
        `;
        loadUserStats();
        return;
      }

      memoList.innerHTML = memos
        .map(
          (item) => `
            <div class="bg-light text-dark rounded p-3 mb-2">
              <div class="d-flex align-items-center mb-2">
                <img
                  src="${normalizeImagePath(item.img)}"
                  alt="${item.name}"
                  width="56"
                  height="56"
                  class="rounded me-3"
                  style="object-fit: cover;"
                />

                <div class="flex-grow-1">
                  <div class="fw-bold">
                    ${item.name}
                    <span class="text-secondary small">(${item.engName})</span>
                  </div>

                  <div class="small text-secondary">
                    역할: ${item.role}
                    &nbsp;|&nbsp;
                    라인: ${item.line}
                    &nbsp;|&nbsp;
                    난이도: ${item.difficulty}
                  </div>
                </div>

                <button
                  type="button"
                  class="btn btn-sm btn-outline-danger"
                  onclick="deleteChampionMemo(${item.championId})"
                >
                  삭제
                </button>
              </div>

              <div class="border rounded p-2 bg-white">
                ${escapeHtml(item.memo)}
              </div>

              <div class="text-secondary small mt-2">
                마지막 수정: ${item.updatedAt || "정보 없음"}
              </div>
            </div>
          `,
        )
        .join("");

      loadUserStats();
    })
    .catch((error) => {
      console.error("챔피언 메모 목록을 불러오는 중 오류 발생:", error);

      memoList.innerHTML = `
        <div class="alert alert-danger mb-0">
          챔피언 메모 목록을 불러오는 중 오류가 발생했습니다.
        </div>
      `;
    });
}

function deleteChampionMemo(championId) {
  fetch(`/memos/${championId}`, {
    method: "DELETE",
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("메모 삭제 실패");
      }

      return response.json();
    })
    .then((data) => {
      console.log("메모 삭제 결과:", data);

      showMemoMessage(
        data.message || "챔피언 메모가 삭제되었습니다.",
        "warning",
      );

      if (typeof showToast === "function") {
        showToast(data.message || "챔피언 메모가 삭제되었습니다.", "warning");
      }

      loadChampionMemos();
      loadUserStats();
    })
    .catch((error) => {
      console.error("챔피언 메모 삭제 중 오류 발생:", error);
      showMemoMessage("챔피언 메모 삭제 중 오류가 발생했습니다.", "danger");
    });
}

function showMemoMessage(message, type) {
  const memoMsg = document.getElementById("memoMsg");

  if (!memoMsg) return;

  memoMsg.className = `alert alert-${type} mb-3`;
  memoMsg.textContent = message;
}

function recommendChampions() {
  const lineSelect = document.getElementById("recommendLine");
  const difficultySelect = document.getElementById("recommendDifficulty");
  const resultList = document.getElementById("recommendResultList");
  const recommendMsg = document.getElementById("recommendMsg");

  if (!lineSelect || !difficultySelect || !resultList) return;

  const line = lineSelect.value;
  const difficulty = difficultySelect.value;

  const query = new URLSearchParams();
  if (line) query.append("line", line);
  if (difficulty) query.append("difficulty", difficulty);

  fetch(`/recommend/champions?${query.toString()}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("챔피언 추천 조회 실패");
      }

      return response.json();
    })
    .then((data) => {
      console.log("추천 챔피언 결과:", data);

      if (recommendMsg) {
        recommendMsg.className = "alert alert-success mb-3";
        recommendMsg.textContent = `${data.count}명의 추천 챔피언을 찾았습니다.`;
      }

      if (!data.champions || data.champions.length === 0) {
        resultList.innerHTML = `
          <div class="alert alert-secondary mb-0">
            선택한 조건에 맞는 챔피언이 없습니다.
          </div>
        `;
        return;
      }

      resultList.innerHTML = data.champions
        .map(
          (champion) => `
            <div class="d-flex align-items-center bg-light text-dark rounded p-2 mb-2">
              <img
                src="${normalizeImagePath(champion.img)}"
                alt="${champion.name}"
                width="64"
                height="64"
                class="rounded me-3"
                style="object-fit: cover;"
              />

              <div class="flex-grow-1">
                <div class="fw-bold">
                  ${champion.name}
                  <span class="text-secondary small">(${champion.engName})</span>
                </div>

                <div class="small text-secondary">
                  역할: ${champion.role}
                  &nbsp;|&nbsp;
                  라인: ${champion.line}
                  &nbsp;|&nbsp;
                  난이도: ${champion.difficulty}
                </div>
              </div>

              <span class="badge bg-success">추천</span>
            </div>
          `,
        )
        .join("");
    })
    .catch((error) => {
      console.error("챔피언 추천 중 오류 발생:", error);

      if (recommendMsg) {
        recommendMsg.className = "alert alert-danger mb-3";
        recommendMsg.textContent = "챔피언 추천 중 오류가 발생했습니다.";
      }

      resultList.innerHTML = `
        <div class="alert alert-danger mb-0">
          챔피언 추천 목록을 불러오는 중 오류가 발생했습니다.
        </div>
      `;
    });
}

function randomChampion() {
  const resultBox = document.getElementById("randomChampionResult");

  if (!resultBox) return;

  fetch("/random/champion")
    .then((response) => {
      if (!response.ok) {
        throw new Error("랜덤 챔피언 추천 실패");
      }

      return response.json();
    })
    .then((data) => {
      console.log("랜덤 챔피언 추천 결과:", data);

      const champion = data.champion;

      if (!champion) {
        resultBox.innerHTML = `
          <div class="alert alert-secondary mb-0">
            추천할 챔피언이 없습니다.
          </div>
        `;
        return;
      }

      resultBox.innerHTML = `
        <div class="d-flex align-items-center bg-light text-dark rounded p-2">
          <img
            src="${normalizeImagePath(champion.img)}"
            alt="${champion.name}"
            width="72"
            height="72"
            class="rounded me-3"
            style="object-fit: cover;"
          />

          <div class="flex-grow-1">
            <div class="fw-bold">
              ${champion.name}
              <span class="text-secondary small">(${champion.engName})</span>
            </div>

            <div class="small text-secondary mt-1">
              역할: ${champion.role}
              &nbsp;|&nbsp;
              라인: ${champion.line}
              &nbsp;|&nbsp;
              난이도: ${champion.difficulty}
            </div>

            <div class="small text-success mt-2">
              ${data.message || "랜덤 챔피언이 추천되었습니다."}
            </div>
          </div>

          <span class="badge bg-primary">랜덤 추천</span>
        </div>
      `;
    })
    .catch((error) => {
      console.error("랜덤 챔피언 추천 중 오류 발생:", error);

      resultBox.innerHTML = `
        <div class="alert alert-danger mb-0">
          랜덤 챔피언 추천 중 오류가 발생했습니다.
        </div>
      `;
    });
}

function favoriteRandomChampion() {
  const resultBox = document.getElementById("favoriteRandomChampionResult");

  if (!resultBox) return;

  fetch("/favorite-random/champion")
    .then((response) => {
      if (!response.ok) {
        return response.json().then((data) => {
          throw new Error(data.message || "찜한 챔피언 랜덤 추천 실패");
        });
      }

      return response.json();
    })
    .then((data) => {
      console.log("찜한 챔피언 랜덤 추천 결과:", data);

      const champion = data.champion;

      if (!champion) {
        resultBox.innerHTML = `
          <div class="alert alert-secondary mb-0">
            추천할 즐겨찾기 챔피언이 없습니다.
          </div>
        `;
        return;
      }

      resultBox.innerHTML = `
        <div class="d-flex align-items-center bg-light text-dark rounded p-2">
          <img
            src="${normalizeImagePath(champion.img)}"
            alt="${champion.name}"
            width="72"
            height="72"
            class="rounded me-3"
            style="object-fit: cover;"
          />

          <div class="flex-grow-1">
            <div class="fw-bold">
              ${champion.name}
              <span class="text-secondary small">(${champion.engName})</span>
            </div>

            <div class="small text-secondary mt-1">
              역할: ${champion.role}
              &nbsp;|&nbsp;
              라인: ${champion.line}
              &nbsp;|&nbsp;
              난이도: ${champion.difficulty}
            </div>

            <div class="small text-warning mt-2">
              ${data.message || "내가 찜한 챔피언 중 랜덤으로 추천되었습니다."}
            </div>
          </div>

          <span class="badge bg-warning text-dark">찜 랜덤</span>
        </div>
      `;
    })
    .catch((error) => {
      console.error("찜한 챔피언 랜덤 추천 중 오류 발생:", error);

      resultBox.innerHTML = `
        <div class="alert alert-warning mb-0">
          ${escapeHtml(error.message)}
        </div>
      `;
    });
}

function escapeHtml(text) {
  if (!text) return "";

  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizeImagePath(img) {
  if (!img) return "/images/logo.png";

  if (img.startsWith("http")) {
    return img;
  }

  if (img.startsWith("/")) {
    return img;
  }

  return "/" + img;
}

function handleProfileMessages() {
  const params = new URLSearchParams(window.location.search);
  const error = params.get("error");
  const success = params.get("success");

  const updateMsg = document.getElementById("updateMsg");
  const passwordMsg = document.getElementById("passwordMsg");

  if (success === "updated" && updateMsg) {
    updateMsg.className = "alert alert-success";
    updateMsg.textContent = "개인정보가 수정되었습니다.";
  } else if (error === "duplicate_email" && updateMsg) {
    updateMsg.className = "alert alert-danger";
    updateMsg.textContent = "이미 사용 중인 이메일입니다.";
  }

  if (success === "password_changed") {
    showToast(
      "비밀번호가 변경되었습니다. 잠시 후 로그인 페이지로 이동합니다.",
      "success",
    );

    setTimeout(function () {
      window.location.href = "/logout?next=login";
    }, 3500);
  }

  if (error === "wrong_password" && passwordMsg) {
    passwordMsg.className = "alert alert-danger";
    passwordMsg.textContent = "현재 비밀번호가 올바르지 않습니다.";
  } else if (error === "password_fail" && passwordMsg) {
    passwordMsg.className = "alert alert-danger";
    passwordMsg.textContent = "비밀번호 변경에 실패했습니다.";
  }

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
}

function validateAndUpdate() {
  let valid = true;

  const email = document.getElementById("updateEmail").value.trim();
  const phone = document.getElementById("updatePhone").value.trim();

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

  if (valid) {
    document.getElementById("updateForm").submit();
  }
}

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

  clearFieldError("currentPasswordInput");
  clearFieldError("newPasswordInput");
  clearFieldError("newPasswordConfirmInput");

  if (currentPassword.trim() === "") {
    showFieldError(
      "currentPasswordInput",
      "currentPasswordMsg",
      "현재 비밀번호를 입력해주세요.",
    );
    valid = false;
  }

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

  currentPasswordHidden.value = await hashPassword(currentPassword);
  newPasswordHidden.value = await hashPassword(newPassword);

  console.log("현재 비밀번호 SHA-256:", currentPasswordHidden.value);
  console.log("새 비밀번호 SHA-256:", newPasswordHidden.value);

  document.getElementById("passwordForm").submit();
}

function showFieldError(fieldId, msgId, message) {
  const field = document.getElementById(fieldId);
  const msg = document.getElementById(msgId);

  if (!field) return;

  field.classList.add("is-invalid");
  field.classList.remove("is-valid");

  if (msg) {
    msg.textContent = message;
  }
}

function clearFieldError(fieldId) {
  const field = document.getElementById(fieldId);

  if (!field) return;

  field.classList.remove("is-invalid");
  field.classList.remove("is-valid");
}
