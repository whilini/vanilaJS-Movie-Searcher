# 🎥 영화 검색 프로젝트

- 과제 기한:
  - 과제 수행 기간: 04월 28일(목) ~ 05월 19일(목)
  - 코드 리뷰 기간: 05월 19일(목) ~ 05월 27일(금)
- 내용:
  - 주어진 API를 활용해 영화 검색 프로젝트를 만들어보세요.

## 배포 사이트

https://flourishing-piroshki-17aebb.netlify.app/


---

## 💡Custom

**💡초기 화면에서 보이는 검색창 화면과 무언갈 검색한 이후 검색창 화면을 전환하기 위해 form 내의 버튼의 submit이벤트 기준으로 javascript로 scss 파일 변경**

⚠️아무런 값을 입력하지 않았을 때는 화면이 전환되지 않도록 막아야 함

```jsx
if (headerClass.contains("init") && searchInput.value != "") {
  // 실행할 코드
}
```

<br>

**💡검색 결과 개수가 위에 뜨도록 함**

```jsx
totalSearch.innerHTML = `" <strong>${title}</strong> "의 검색결과: ${totalSearchData}개`;
```

<br>

**💡평점의 정보를 이용해 별점을 만들어 표시함**

평점으로 노란 별의 `width`를 %로 조절함

```jsx
detailRateStar.style.width = `calc(${data.imdbRating} * 10%)`;
```

<br>

**💡포스터 사진을 고화질로 가져옴**

```jsx
const data = await getMovies(title, pageNo);
const movieCard = data.Search.map((d) => {
  const bigPoster = d.Poster.replace("SX300", "SX700");
  return createCard(d.Title, d.Year, bigPoster);
});
```

<br>

**💡OMBd API 문서를 보니 장르와 줄거리, 평점, 런타임 등 다양한 정보를 가져올 수 있음**

이를 이용하여 상세보기 페이지도 만들어보기로 함
많은 정보가 있진 않아서 상세보기를 새로운 페이지로 넘어가기보다 모달로 띄우도록 함

<br>

**💡API key를 숨김:webpack 환경변수 `.env` 파일 생성**

<br>

💡**이벤트리스너의 최적화를 위해 카드 하나가 아닌 카드리스트를 클릭했을 때 이벤트가 일어나게 함**

⚠️이벤트가 일어난 카드 한장의 정보만 필요한데 `((e) ⇒ e.target.id)`를 했더니 이벤트 버블링으로 인해 정확한 이벤트 타겟이 잡히지 않음

```jsx
const movieCard = e.target.closest(".movie-card");
// 영화 카드가 아니라면 아무 이벤트 일어나지 않음
if (!movieCard) return;

// 카드 리스트 중 영화카드가 아니라면 아무 이벤트 일어나지 않음
if (!movieCards.contains(movieCard)) return;
```

<br>

💡**검색결과가 없을 때 보이는 화면을 만듬**

```jsx
if (data.Response === "False") {
  totalSearch.innerHTML = `" <strong>${title}</strong> "의 검색결과: 0개`;
  cards.innerHTML =
    "<img class='no-result' src='image/no-results.png' alt='no-results'>";
  return;
}
```

<br>

💡**상세보기에서 `N/A`로 뜨는 데이터를 `no Data`로 변경**

```jsx
const result = await url.json();
Object.entries(result).forEach(([key, value]) => {
  if (value === "N/A") {
    result[key] = "no Data";
    return;
  }
});
```

<br>

## ⚠️Issue

**⚠️새로운 키워드로 검색했을 때 기존 메인에서 이미 가져온 카드리스트에서 뒤에 추가됨. 이전 카드리스트를 없애야 함.**

```jsx
async function cardList(pageNo, init = false) {
  if (init) {
    cards.innerHTML = movieCard.join("\n");
    return;
  }
  cards.innerHTML += movieCard.join("\n");
}
--------------------------------------------------
// 새로운 페이지 부를때
pageNo = 1;
cardList(pageNo, true);

// 기존 페이지에 카드만 늘릴때
pageNo += 1;
cardList(pageNo);  // 기본값이 false이므로 생략
```

<br>

**⚠️한국어로 검색시, 검색 결과가 하나도 없음 → 영어로만 입력 받아야함**

```jsx
<input type='text' style="ime-mode:disabled;">  // 영어만 가능
<input type='text' style="ime-mode:active;">  // 한글 우선, 영어 가능
<input type='text' style="ime-mode:inactive;">  // 영어 우선, 한글 가능
```

```jsx
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
```

<br>

**⚠️새로운 검색어를 입력했을 때, 스크롤 위치가 이전 검색화면과 동일. 스크롤 위치를 맨 위로 초기화 해야함**

```jsx
window.scrollTo(0, 0);
```

<br>

**⚠️영화 제목의 길이가 길면 화면 밖으로 밀려남. 일정 길이 이상은 말 줄임표 사용**

```scss
@mixin ellipsis($line-cnt, $line-height) {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: $line-cnt; /* 라인수 */
  -webkit-box-orient: vertical;
  word-break: keep-all;
  word-wrap: break-word;
  line-height: $line-height;
  height: $line-height * $line-cnt;
}
```

<br>

⚠️**모달이 떠있을 때 window 스크롤 이벤트 방지**

```jsx
function preventScroll(e) {
  e.preventDefault();
  e.stopPropagation();

  return false;
}

function disableScrollWheel() {
  window.addEventListener("wheel", preventScroll, { passive: false });
}

function enableScrollWheel() {
  window.removeEventListener("wheel", preventScroll);
}
```

<br>

**⚠️스크롤 하면서 카드를 불러올 때, 이미 불러온 카드가 깜빡거림. 스크롤 할 때마다 새로 불러오기 때문.**

```jsx
if (init) {
  cards.innerHTML = movieCard.join("\n");
  return;
}
cards.innerHTML += movieCard.join("\n");
movieCardList.forEach((card) => cards.appendChild(card));
```

코드를 새로 불러오는 것이 아닌 appendChild로 요소를 삽입, 새로운 검색어를 입력하면 `innerHTML = “”`로 이전 검색리스트 비워줌

```jsx
function createElement(str) {
  const fragment = document.createDocumentFragment();

  const elem = document.createElement("div");
  elem.innerHTML = str;

  while (elem.childNodes[0]) {
    fragment.appendChild(elem.childNodes[0]);
  }
  return fragment;
}
------
const movieCardList = data.Search.map((d) => {
	const cardHtml = createCard(d.imdbID, d.Title, d.Year, bigPoster);
	const card = createElement(cardHtml);
	return card;
}
------
movieCardList.forEach((card) => cards.appendChild(card));
```
