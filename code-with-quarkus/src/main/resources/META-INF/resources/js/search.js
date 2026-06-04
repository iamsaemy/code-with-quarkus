// ── 챔피언 데이터 ──────────────────────────────────────────────
// DB에서 불러온 챔피언 데이터를 저장할 배열
let CHAMPIONS = [];

// 서버 DB에서 챔피언 목록 불러오기
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
  })
  .catch((error) => {
    console.error("챔피언 데이터 불러오기 실패:", error);
  });

// ── 뉴스 데이터 ──────────────────────────────────────────────
// 객체 배열: 뉴스 한 개당 하나의 객체로 관리한다.
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

// ── 검색 결과 카테고리 전환 ─────────────────────────────
// 챔피언/뉴스 탭을 클릭했을 때 해당 결과만 보여준다.
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

// ── 검색 실행 함수 ────────────────────────────────────────────
// 검색어를 받아 챔피언 데이터와 뉴스 데이터에서 일치하는 항목을 찾는다.
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
               style="cursor:pointer;">
            <img src="${c.img}" alt="${c.name}">
            <div class="p-3">
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
          </div>
        `,
      )
      .join("");

    // 검색 결과 챔피언 카드를 클릭하면 기존 모달창 열기
    document.querySelectorAll(".champion-card").forEach((card) => {
      card.addEventListener("click", function () {
        openChampionModal(this.dataset.champion);
      });
    });
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
// 검색어가 비어 있거나 공백일 때 기존 메인 화면으로 돌아간다.
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
// 검색 버튼 클릭 또는 Enter 입력 시 performSearch 함수 실행
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
