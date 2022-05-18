import "../scss/main.scss";
import "../scss/animate.css";

const apiKey = process.env.API_KEY;
let pageNo = 1;
let searchValue = "";

// All Movie Data API
async function getMovies(title, page) {
  const url = `https://www.omdbapi.com?apikey=${apiKey}&s=${title}&page=${page}`;
  let result = await fetch(url);
  result = result.json();
  return result;
}

function createCard(imdbID, title, year, poster) {
  const card = `
    <div id="${imdbID}" class="movie-card">
      <div class="card__poster" style="background-image:url(${poster})" alt="movie poster" /></div>
      <div class="card__thumb">
        <h5 class="card__title">${title}</h5>
        <p class="card__year">
          ${year}
        </p>
      </div>
    </div>
  `;
  return card;
}
function defaultImg(imdbID, title, year) {
  const card = `
    <div id="${imdbID}" class="movie-card">
      <div class="card__default-img" style="background-image:url(image/default_image.png)" alt="movie poster" /></div>
      <div class="card__thumb">
        <h5 class="card__title">${title}</h5>
        <p class="card__year">
          ${year}
        </p>
      </div>
    </div>
  `;
  return card;
}

// 로고 눌렀을 때 초기 메인으로 돌아가기
function goHome() {
  const mainTitle = document.querySelector(".movie-searcher-title");
  const mainHeader = document.querySelector("#main-header");
  const searchBar = document.querySelector("#input");
  if (!mainHeader.classList.contains("result")) {
    return;
  }

  mainTitle.addEventListener("click", () => {
    mainHeader.className = "init";
    searchBar.value = null;
  });
}

/**
 * 1. getMovies를 통해서 전체 데이터 받아오기
 * 2. getMovies의  결과 데이터를 map으로 순회하면서 createCard 호출
 * 3. 포스터가 없는 영화의 이미지에는 디폴트 이미지 띄우기
 */
async function cardList(pageNo, init = false) {
  // id가 input인 태그를 찾아서 value값을 변수에 저장
  const input = document.getElementById("input");
  const title = init ? input.value : searchValue;
  const cards = document.getElementById("cards");
  const totalSearch = document.querySelector(".total-search");
  const data = await getMovies(title, pageNo);
  if (data.Response === "False") {
    totalSearch.innerHTML = `" <strong>${title}</strong> "의 검색결과: 0개`;
    cards.innerHTML =
      "<img class='no-result' src='image/no-results.png' alt='no-results'>";
    return;
  }

  const movieCard = data.Search.map((d) => {
    if (d.Poster !== "N/A") {
      // 큰 포스터 가져오기
      const bigPoster = d.Poster.replace("SX300", "SX700");
      return createCard(d.imdbID, d.Title, d.Year, bigPoster);
    } else {
      // 포스터가 없는 영화 정보
      return defaultImg(d.imdbID, d.Title, d.Year);
    }
  });

  const totalSearchData = data.totalResults ? data.totalResults : "0";

  // 총 검색결과 수
  if (init) {
    totalSearch.innerHTML = `" <strong>${title}</strong> "의 검색결과: ${totalSearchData}개`;
    cards.innerHTML = movieCard.join("\n");
    return;
  }

  cards.innerHTML += movieCard.join("\n");
}

// Loading Image
function activateLoader() {
  const loader = document.getElementById("loader");
  loader.className = "loader";
}

function deactivateLoader() {
  const loader = document.getElementById("loader");
  loader.className = "";
}

// 초기 화면을 바꾸고 카드 리스트 만들기 + 스크롤 했을 때 추가 카드 만들기
function initialize() {
  const searchInput = document.getElementById("input");

  // 한글 입력 방지
  searchInput.addEventListener("keyup", (event) => {
    const key = event.key || event.keyCode;

    if (key === "Process") {
      alert("영어만 입력 가능합니다.");
      searchInput.value = null;
      return;
    }
    event.preventDefault();
  });

  const searchForm = document.querySelector(".search-container");
  searchForm.addEventListener("submit", (e) => {
    // loader on
    activateLoader();

    const headerClass = document.querySelector("header").classList;
    const title = document.getElementById("input").value;
    if (headerClass.contains("init") && searchInput.value !== "") {
      // form의 디폴트 이벤트(새로고침) 방지
      e.preventDefault();
      headerClass.replace("init", "result");
      pageNo = 1;

      // 카드 리스트가 만들어진 뒤, 바로 modal을 만드는 함수 실행
      searchValue = title;
      cardList(pageNo, true).then(() => {
        deactivateLoader();
        clickPopup();
      });
      goHome();
      return;
    }
    // 새로운 검색어 입력했을 때, 스크롤을 상단으로 초기화
    searchValue = title;
    window.scrollTo(0, 0);
    const cards = document.querySelector("#cards");
    cards.innerHTML = "";
    e.preventDefault();
    pageNo = 1;
    cardList(pageNo, true).then(() => {
      deactivateLoader();
      clickPopup();
    });
  });

  // 초기 화면에서 검색창 누르면 Welcome 문구 사라지게 만들기
  searchInput.addEventListener("click", () => {
    searchInput.innerText = "";
  });

  // Lodash를 이용한 무한 스크롤
  document.addEventListener(
    "scroll",
    _.throttle(() => {
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 300
      ) {
        pageNo += 1;
        cardList(pageNo);
      }
    }, 1000)
  );

  closePopup();
}

// MOVIE MODAL
async function getDetail(imdbID) {
  const url = await fetch(
    `https://www.omdbapi.com?apikey=${apiKey}&i=${imdbID}`
  );
  const result = await url.json();
  Object.entries(result).forEach(([key, value]) => {
    if (value === "N/A") {
      result[key] = "no Data";
      return;
    }
  });

  return result;
}

// 카드 MODAL 만들기
async function cardDetail(imdbID) {
  const detailPoster = document.querySelector(".detail__poster");
  const detailTitle = document.querySelector(".detail__title");
  const detailOpen = document.querySelector(".detail__open");
  const detailRate = document.querySelector(".detail__rate");
  const detailRateStar = document.querySelector(".star-ratings-fill");
  const detailGenre = document.querySelector(".detail__genre");
  const detailCountry = document.querySelector(".detail__country");
  const detailRuntime = document.querySelector(".detail__runtime");
  const detailDirector = document.querySelector(".detail__director");
  const detailActors = document.querySelector(".detail__actors");
  const detailPlot = document.querySelector(".detail__plot");
  const data = await getDetail(imdbID);
  detailTitle.innerText = `${data.Title}`;
  detailOpen.innerText = `Released: ${data.Released}`;
  detailRate.innerText = `Rate: ${data.imdbRating} / 10`;
  detailRateStar.style.width = `calc(${data.imdbRating} * 10%)`;
  detailGenre.innerText = `${data.Genre}`;
  detailCountry.innerText = `${data.Country}`;
  detailRuntime.innerText = `${data.Runtime}`;
  detailDirector.innerText = `Director: ${data.Director}`;
  detailActors.innerText = `Actors: ${data.Actors}`;
  detailPlot.innerText = `${data.Plot}`;
  if (data.Poster !== "no Data") {
    const bigPoster = data.Poster.replace("SX300", "SX700");
    detailPoster.src = bigPoster;
    detailPoster.alt = data.Title;
    detailPoster.style = "width: 100%; height: 100%; transform: scale(1.01);";
  } else {
    detailPoster.src = "image/default_image.png";
    detailPoster.alt = data.Title;
    detailPoster.style = "width: 6vw; height: auto;";
  }
}

// Modal창이 떠 있을 때 배경 스크롤 방지
function preventScroll(e) {
  e.preventDefault();
  e.stopPropagation();

  return false;
}

function disableScrollWheel() {
  window.addEventListener("wheel", preventScroll, { passive: false });
}

function enableScrollWheel() {
  window.removeEventListener("wheel", preventScroll, { passive: true });
}

/**
 * 이벤트 리스너의 최적화를 위해 카드 리스트를 클릭했을 때 팝업이 뜨도록 하고
 * 이벤트가 일어난 타겟 중 가장 가까운 요소의 정보를 가져오도록 함
 */
function clickPopup() {
  const movieCards = document.querySelector("#cards");
  movieCards.addEventListener("click", (e) => {
    activateLoader();
    const popup = document.querySelector(".dark-window");
    const movieCard = e.target.closest(".movie-card");
    const movieID = movieCard.id;
    console.log(movieID);

    // 영화 카드가 아니라면 아무 이벤트 일어나지 않음
    if (!movieCard) return;

    // 카드 리스트 중 영화카드가 아니라면 아무 이벤트 일어나지 않음
    if (!movieCards.contains(movieCard)) return;

    popup.classList.add("show");

    // 배경 스크롤 방지
    disableScrollWheel();

    // 클릭된 카드의 omdbID를 통해 영화 상세 정보 가져오기
    cardDetail(movieID).then(() => deactivateLoader());
    e.preventDefault();
  });
}

function closePopup() {
  const popup = document.querySelector(".dark-window");
  const moviePoster = document.querySelector(".detail__poster");

  // modal창 안보이게 하기
  popup.classList.remove("show");

  // modal창의 포스터 사진 비우기. 비우지 않으면 다음 카드 modal에서 사진이 남음
  moviePoster.src = "";

  // 다시 스크롤 가능
  enableScrollWheel();
}

// X버튼 눌렀을 때 모달 끄기
const closeBtn = document.querySelector(".close");
closeBtn.addEventListener("click", closePopup);

// 모달 영역 외의 화면 클릭시 모달 끄기
const darkWindow = document.querySelector(".dark-window");
darkWindow.addEventListener("click", (e) => {
  const modal = document.querySelector(".card__popup");
  if (e.target !== darkWindow) return;
  if (e.target === modal) return;
  closePopup();
});

initialize();
