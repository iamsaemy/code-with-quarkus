// ── 챔피언 데이터 ──────────────────────────────────────────────
// DB에서 불러온 챔피언 데이터를 저장할 배열
let CHAMPIONS = [];

// 현재 로그인한 사용자가 즐겨찾기한 챔피언 id 목록
let FAVORITE_IDS = [];

// ── 서버 DB에서 챔피언 목록 불러오기 ───────────────────────────
fetch("/champions")
  .then((response) => response.json())
  .then((data) => {
    // DB 컬럼 line을 기존 검색 코드에서 쓰던 lane 이름으로 맞춰준다.
    CHAMPIONS = data.map((c) => ({
      id: c.id,
      name: c.name,
      engName: c.engName,
      role: c.role,
      lane: c.line,
      img: c.img,
      difficulty: c.difficulty,
    }));

    console.log("DB 챔피언 데이터 불러오기 성공:", CHAMPIONS);

    // 챔피언 데이터를 불러온 뒤 즐겨찾기 정보도 같이 불러온다.
    loadFavoriteIds();
  })
  .catch((error) => {
    console.error("챔피언 데이터 불러오기 실패:", error);
  });

// ── 로그인 사용자의 즐겨찾기 챔피언 ID 목록 불러오기 ─────────────
function loadFavoriteIds() {
  fetch("/favorites/ids")
    .then((response) => {
      if (!response.ok) {
        return [];
      }

      return response.json();
    })
    .then((ids) => {
      FAVORITE_IDS = ids;
      console.log("즐겨찾기 ID 목록:", FAVORITE_IDS);
    })
    .catch((error) => {
      console.error("즐겨찾기 목록 불러오기 실패:", error);
      FAVORITE_IDS = [];
    });
}

// ── 뉴스 데이터 ──────────────────────────────────────────────
const NEWS = [
  {
    title: "새로운 챔피언 출시",
    desc: "2026 루나 레벨 이벤트! 신규 챔피언과 함께하는 특별한 시즌.",
    category: "게임 업데이트",
  },
  {
    title: "패치 노트 16.4",
    desc: "챔피언 밸런스 및 아이템 업데이트 내용을 확인하세요.",
    category: "패치 노트",
  },
];

// ── Toast 출력 함수 ───────────────────────────────────────────
function showFavoriteMessage(message, type = "success") {
  if (typeof showToast === "function") {
    showToast(message, type);
  } else {
    alert(message);
  }
}

// ── 이미지 경로 보정 ───────────────────────────────────────────
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

// ─────────────────────────────────────────────
// 추가 구현 기능 8: 메인화면 오늘의 랜덤 챔피언
// ─────────────────────────────────────────────
function loadMainRandomChampion() {
  const resultBox = document.getElementById("mainRandomChampionResult");

  if (!resultBox) return;

  fetch("/random/champion")
    .then((response) => {
      if (!response.ok) {
        throw new Error("오늘의 랜덤 챔피언 조회 실패");
      }

      return response.json();
    })
    .then((data) => {
      console.log("메인화면 랜덤 챔피언 결과:", data);

      const champion = data.champion;

      if (!champion) {
        resultBox.innerHTML = `
          <div class="alert alert-secondary mb-0 text-center">
            추천할 챔피언이 없습니다.
          </div>
        `;
        return;
      }

      resultBox.innerHTML = `
        <div class="row align-items-center bg-light text-dark rounded p-3 mx-1">
          <div class="col-md-3 text-center mb-3 mb-md-0">
            <img
              src="${normalizeImagePath(champion.img)}"
              alt="${champion.name}"
              width="120"
              height="120"
              class="rounded"
              style="object-fit: cover;"
            />
          </div>

          <div class="col-md-7">
            <h4 class="fw-bold mb-1">
              ${champion.name}
              <span class="text-secondary fs-6">(${champion.engName})</span>
            </h4>

            <p class="mb-1">
              역할: ${champion.role}
              &nbsp;|&nbsp;
              라인: ${champion.line}
              &nbsp;|&nbsp;
              난이도: ${champion.difficulty}
            </p>

            <p class="text-success small mb-0">
              ${data.message || "오늘의 랜덤 챔피언이 추천되었습니다."}
            </p>
          </div>

          <div class="col-md-2 text-md-end text-center mt-3 mt-md-0">
            <span class="badge bg-warning text-dark fs-6">오늘의 추천</span>
          </div>
        </div>
      `;

      if (typeof showToast === "function") {
        showToast("오늘의 랜덤 챔피언이 추천되었습니다.", "success");
      }
    })
    .catch((error) => {
      console.error("메인화면 랜덤 챔피언 조회 중 오류 발생:", error);

      resultBox.innerHTML = `
        <div class="alert alert-danger mb-0 text-center">
          오늘의 랜덤 챔피언을 불러오는 중 오류가 발생했습니다.
        </div>
      `;
    });
}

// ─────────────────────────────────────────────
// 추가 구현 기능 9: 메인화면 라인별 빠른 추천
// ─────────────────────────────────────────────
function loadMainLineRecommend(line) {
  const resultBox = document.getElementById("mainLineRecommendResult");

  if (!resultBox) return;

  const query = new URLSearchParams();
  query.append("line", line);

  fetch(`/recommend/champions?${query.toString()}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("라인별 추천 챔피언 조회 실패");
      }

      return response.json();
    })
    .then((data) => {
      console.log("메인화면 라인별 추천 결과:", data);

      if (!data.champions || data.champions.length === 0) {
        resultBox.innerHTML = `
          <div class="alert alert-secondary mb-0 text-center">
            ${line} 라인에 해당하는 추천 챔피언이 없습니다.
          </div>
        `;
        return;
      }

      resultBox.innerHTML = `
        <div class="alert alert-success text-center">
          ${line} 라인 추천 챔피언 ${data.count}명을 찾았습니다.
        </div>

        <div class="row g-3">
          ${data.champions
            .map(
              (champion) => `
                <div class="col-md-6 col-lg-4">
                  <div class="d-flex align-items-center bg-light text-dark rounded p-2 h-100">
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
                        <br />
                        라인: ${champion.line}
                        <br />
                        난이도: ${champion.difficulty}
                      </div>
                    </div>

                    <span class="badge bg-success">추천</span>
                  </div>
                </div>
              `,
            )
            .join("")}
        </div>
      `;

      if (typeof showToast === "function") {
        showToast(`${line} 라인 추천 챔피언을 불러왔습니다.`, "success");
      }
    })
    .catch((error) => {
      console.error("메인화면 라인별 추천 중 오류 발생:", error);

      resultBox.innerHTML = `
        <div class="alert alert-danger mb-0 text-center">
          라인별 추천 챔피언을 불러오는 중 오류가 발생했습니다.
        </div>
      `;
    });
}

// ── 검색 결과 카테고리 전환 ─────────────────────────────
function switchCategory(type, el) {
  document.querySelectorAll(".search-category-item").forEach((item) => {
    item.classList.remove("active");
  });

  el.classList.add("active");

  document.getElementById("resultChampion").style.display =
    type === "champion" ? "block" : "none";

  document.getElementById("resultNews").style.display =
    type === "news" ? "block" : "none";
}

// ── 즐겨찾기 버튼 HTML 만들기 ─────────────────────────────────
function createFavoriteButton(championId) {
  const isFavorite = FAVORITE_IDS.includes(championId);

  return `
    <button
      type="button"
      class="btn btn-sm ${isFavorite ? "btn-warning" : "btn-outline-warning"} favorite-btn"
      data-champion-id="${championId}"
      title="${isFavorite ? "즐겨찾기 해제" : "즐겨찾기 추가"}"
    >
      ${isFavorite ? "★ 즐겨찾기됨" : "☆ 즐겨찾기"}
    </button>
  `;
}

// ── 즐겨찾기 버튼 화면 갱신 ───────────────────────────────────
function updateFavoriteButton(button, isFavorite) {
  if (!button) return;

  if (isFavorite) {
    button.classList.remove("btn-outline-warning");
    button.classList.add("btn-warning");
    button.textContent = "★ 즐겨찾기됨";
    button.title = "즐겨찾기 해제";
  } else {
    button.classList.remove("btn-warning");
    button.classList.add("btn-outline-warning");
    button.textContent = "☆ 즐겨찾기";
    button.title = "즐겨찾기 추가";
  }
}

// ── 즐겨찾기 추가/해제 처리 ───────────────────────────────────
function toggleFavorite(championId, button) {
  fetch(`/favorites/toggle/${championId}`, {
    method: "POST",
  })
    .then((response) => {
      if (response.status === 401) {
        showFavoriteMessage("로그인 후 이용할 수 있습니다.", "warning");
        return null;
      }

      if (!response.ok) {
        throw new Error("즐겨찾기 처리 실패");
      }

      return response.json();
    })
    .then((data) => {
      if (!data) return;

      const isFavorite = data.favorited;

      if (isFavorite) {
        if (!FAVORITE_IDS.includes(championId)) {
          FAVORITE_IDS.push(championId);
        }
      } else {
        FAVORITE_IDS = FAVORITE_IDS.filter((id) => id !== championId);
      }

      updateFavoriteButton(button, isFavorite);
      showFavoriteMessage(data.message, isFavorite ? "success" : "warning");

      console.log("즐겨찾기 처리 결과:", data);
    })
    .catch((error) => {
      console.error(error);
      showFavoriteMessage("즐겨찾기 처리 중 오류가 발생했습니다.", "danger");
    });
}

// ── 즐겨찾기 버튼 이벤트 등록 ─────────────────────────────────
function bindFavoriteButtons() {
  document.querySelectorAll(".favorite-btn").forEach((button) => {
    button.addEventListener("click", function (e) {
      // 카드 클릭 이벤트가 같이 실행되지 않도록 막는다.
      e.preventDefault();
      e.stopPropagation();

      const championId = Number(this.dataset.championId);
      toggleFavorite(championId, this);
    });
  });
}

// ── 최근 본 챔피언 저장 ───────────────────────────────────────
// 챔피언 카드를 클릭하면 로그인 사용자 기준으로 최근 본 챔피언에 저장한다.
function saveRecentChampion(championId) {
  fetch(`/recent/view/${championId}`, {
    method: "POST",
  })
    .then((response) => {
      if (response.status === 401) {
        console.warn("최근 본 챔피언 저장 실패: 로그인 필요");
        return null;
      }

      if (!response.ok) {
        throw new Error("최근 본 챔피언 저장 실패");
      }

      return response.json();
    })
    .then((data) => {
      if (!data) return;

      console.log("최근 본 챔피언 저장 결과:", data);
    })
    .catch((error) => {
      console.error("최근 본 챔피언 저장 중 오류 발생:", error);
    });
}

// ── 검색 실행 함수 ────────────────────────────────────────────
function performSearch(query) {
  const q = query.trim().toLowerCase();

  if (!q) return;

  // 검색한 키워드 표시
  document.getElementById("searchKeywordDisplay").textContent = `"${query}"`;

  // 챔피언 검색
  const champResults = CHAMPIONS.filter(
    (c) =>
      c.name.includes(q) ||
      c.engName.toLowerCase().includes(q) ||
      c.role.includes(q) ||
      c.lane.includes(q),
  );

  // 뉴스 검색
  const newsResults = NEWS.filter(
    (n) =>
      n.title.toLowerCase().includes(q) ||
      n.desc.toLowerCase().includes(q) ||
      n.category.toLowerCase().includes(q),
  );

  // 검색 결과 개수 표시
  document.getElementById("champCount").textContent =
    `(${champResults.length})`;
  document.getElementById("newsCount").textContent = `(${newsResults.length})`;

  // ── 챔피언 검색 결과 화면 출력 ─────────────────────────────
  const champList = document.getElementById("championResultList");

  if (champResults.length === 0) {
    champList.innerHTML = `
      <div class="no-result">
        <h4>검색 결과 없음</h4>
        <p>"${query}"에 해당하는 챔피언이 없습니다.</p>
      </div>
    `;
  } else {
    champList.innerHTML = champResults
      .map(
        (c) => `
          <div class="search-result-card champion-card d-flex align-items-center p-0 overflow-hidden"
               data-champion="${c.engName}"
               data-champion-id="${c.id}"
               style="cursor:pointer;">
            <img src="${normalizeImagePath(c.img)}" alt="${c.name}">
            <div class="p-3 flex-grow-1">
              <div style="font-weight:700; font-size:1rem; color:#111;">
                ${c.name}
                <span style="color:#888; font-size:0.85rem;">(${c.engName})</span>
              </div>
              <div style="color:#555; font-size:0.9rem; margin-top:4px;">
                역할: ${c.role} &nbsp;|&nbsp;
                라인: ${c.lane} &nbsp;|&nbsp;
                난이도: ${c.difficulty}
              </div>
            </div>

            <div class="p-3">
              ${createFavoriteButton(c.id)}
            </div>
          </div>
        `,
      )
      .join("");

    // 검색 결과 챔피언 카드를 클릭하면 최근 본 챔피언 저장 후 기존 모달창 열기
    document.querySelectorAll(".champion-card").forEach((card) => {
      card.addEventListener("click", function () {
        const championId = Number(this.dataset.championId);

        saveRecentChampion(championId);
        openChampionModal(this.dataset.champion);
      });
    });

    // 즐겨찾기 버튼 이벤트 등록
    bindFavoriteButtons();
  }

  // ── 뉴스 검색 결과 화면 출력 ─────────────────────────────
  const newsList = document.getElementById("newsResultList");

  if (newsResults.length === 0) {
    newsList.innerHTML = `
      <div class="no-result">
        <h4>검색 결과 없음</h4>
        <p>"${query}"에 해당하는 뉴스가 없습니다.</p>
      </div>
    `;
  } else {
    newsList.innerHTML = newsResults
      .map(
        (n) => `
          <div class="search-result-card p-3">
            <span style="font-size:0.75rem; background:#c8253a; color:#fff; padding:2px 8px; border-radius:3px;">
              ${n.category}
            </span>
            <div style="font-weight:700; font-size:1rem; color:#111; margin-top:8px;">
              ${n.title}
            </div>
            <div style="color:#555; font-size:0.9rem; margin-top:4px;">
              ${n.desc}
            </div>
          </div>
        `,
      )
      .join("");
  }

  // 검색하면 기본적으로 챔피언 탭이 먼저 보이도록 설정
  switchCategory("champion", document.querySelector(".search-category-item"));

  // 메인 히어로 영역 숨김
  const hero = document.querySelector(".hero");
  if (hero) {
    hero.classList.add("d-none");
  }

  // 검색 결과 섹션을 제외한 나머지 section 숨김
  document
    .querySelectorAll("section:not(#searchResults)")
    .forEach((section) => {
      section.classList.add("d-none");
    });

  // 검색 결과 섹션 표시
  const searchResults = document.getElementById("searchResults");
  searchResults.classList.remove("d-none");
  searchResults.style.display = "block";

  // 콘솔 확인용
  console.log("챔피언 검색 결과:", champResults);
  console.log("뉴스 검색 결과:", newsResults);
}

// ── 메인화면 다시 보여주기 ─────────────────────────────────────
function showMainScreen() {
  // 검색 결과 섹션 숨김
  const searchResults = document.getElementById("searchResults");
  searchResults.style.display = "none";
  searchResults.classList.add("d-none");

  // 검색 결과 내용 초기화
  document.getElementById("searchKeywordDisplay").textContent = "";
  document.getElementById("champCount").textContent = "(0)";
  document.getElementById("newsCount").textContent = "(0)";
  document.getElementById("championResultList").innerHTML = "";
  document.getElementById("newsResultList").innerHTML = "";

  // 모든 section 다시 표시
  document.querySelectorAll("section").forEach((section) => {
    section.classList.remove("d-none");
  });

  // 검색 결과 섹션은 다시 숨김
  searchResults.style.display = "none";

  // 검색창 비우기
  document.getElementById("searchInput").value = "";
}

// ── 검색 결과 챔피언 클릭 시 기존 모달창 열기 ─────────────────
function openChampionModal(engName) {
  const modalId = `modal${engName.replace(/\s/g, "")}`;
  const modalElement = document.getElementById(modalId);

  if (!modalElement) {
    console.warn("해당 챔피언 모달을 찾을 수 없습니다:", modalId);
    return;
  }

  const modal = new bootstrap.Modal(modalElement);
  modal.show();
}

// ── 검색 폼 이벤트 등록 ───────────────────────────────────────
document.getElementById("searchForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const query = document.getElementById("searchInput").value.trim();

  // 검색어가 없거나 공백이면 메인화면으로 돌아간다.
  if (!query) {
    showMainScreen();
    return;
  }

  performSearch(query);
});
