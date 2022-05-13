import "../scss/main.scss";
import "../scss/animate.css";

const apiKey = process.env.API_KEY;
let pageNo = 1;

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
 */
async function cardList(pageNo, init = false) {
  // id가 input인 태그를 찾아서 value값을 변수에 저장한다.
  const input = document.getElementById("input");
  const title = input.value;
  const data = await getMovies(title, pageNo);
  const movieCard = data.Search.map((d) => {
    if (d.Poster !== "N/A") {
      const bigPoster = d.Poster.replace("SX300", "SX700");
      return createCard(d.imdbID, d.Title, d.Year, bigPoster);
    } else {
      return defaultImg(d.imdbID, d.Title, d.Year);
    }
  });
  const totalSearch = document.querySelector(".total-search");
  const totalSearchData = data.totalResults;

  const cards = document.getElementById("cards");

  if (init) {
    totalSearch.innerHTML = `" <strong>${title}</strong> "의 검색결과: ${totalSearchData}개`;
    cards.innerHTML = movieCard.join("\n");
    return;
  }

  cards.innerHTML += movieCard.join("\n");
}

function initialize() {
  const searchInput = document.getElementById("input");
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
    const headerClass = document.querySelector("header").classList;
    if (headerClass.contains("init") && searchInput.value !== "") {
      e.preventDefault();
      headerClass.replace("init", "result");
      pageNo = 1;
      cardList(pageNo, true).then(() => clickPopup());
      goHome();
      return;
    }
    window.scrollTo(0, 0);
    e.preventDefault();
    pageNo = 1;
    cardList(pageNo, true).then(() => clickPopup());
  });

  searchInput.addEventListener("click", () => {
    searchInput.innerText = "";
  });

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
  const result = url.json();
  return result;
}
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
  if (data.Poster !== "N/A") {
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
function clickPopup() {
  const movieCards = document.querySelector("#cards");
  movieCards.addEventListener("click", (e) => {
    const popup = document.querySelector(".dark-window");
    const movieCard = e.target.closest(".movie-card");
    const movieID = movieCard.id;

    if (!movieCard) return;

    if (!movieCards.contains(movieCard)) return;

    popup.classList.add("show");
    disableScrollWheel();
    cardDetail(movieID);
  });
}
function closePopup() {
  const closeBtn = document.querySelector(".close");
  closeBtn.addEventListener("click", () => {
    const popup = document.querySelector(".dark-window");
    const moviePoster = document.querySelector(".detail__poster");
    popup.classList.remove("show");
    moviePoster.src = "";
    enableScrollWheel();
  });
}

initialize();
