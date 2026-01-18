const TSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vR_s11QpNmzgSpUm_dJHcw7ljLd-omtgCKheM24lb_IfrXtnEXLaqCeNdGBKkcwELI3sH509CcfzRoX/pub?output=tsv&gid=0";

const STORAGE_KEY = "flashcardStatuses";

let cards = [];
let filteredCards = [];
let currentIndex = 0;
let showingJapanese = true;
let currentFilter = "all";

/* 要素取得 */
const cardEl = document.getElementById("card");
const cardNumberEl = document.getElementById("cardNumber");
const cardTextEl = document.getElementById("cardText");
const progressEl = document.getElementById("progress");
const statusEl = document.getElementById("status");

const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const shuffleBtn = document.getElementById("shuffleBtn");

const makeBtn = document.getElementById("makeBtn");
const memorizedBtn = document.getElementById("memorizedBtn");
const unknownBtn = document.getElementById("unknownBtn");

const filterButtons = {
  all: document.getElementById("filterAll"),
  make: document.getElementById("filterMake"),
  memorized: document.getElementById("filterMemorized"),
  unknown: document.getElementById("filterUnknown"),
};

/* ===== LocalStorage ===== */
function saveStatuses() {
  const data = {};
  cards.forEach(card => {
    data[card.rowNumber] = card.status;
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadStatuses() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return;

  const data = JSON.parse(saved);
  cards.forEach(card => {
    if (data[card.rowNumber]) {
      card.status = data[card.rowNumber];
    }
  });
}

/* ===== TSV 読み込み ===== */
fetch(TSV_URL)
  .then(res => res.text())
  .then(text => {
    const lines = text.trim().split("\n");

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split("\t");

      const japanese = cols[1];
      const english = cols[2];

      if (japanese && english) {
        cards.push({
          rowNumber: i + 1, // スプレッドシートの行番号
          japanese,
          english,
          status: "unrated"
        });
      }
    }

    loadStatuses();
    filteredCards = [...cards];
    showCard();
  });

/* ===== 表示 ===== */
function showCard() {
  if (filteredCards.length === 0) {
    cardTextEl.textContent = "カードがありません";
    cardNumberEl.textContent = "";
    progressEl.textContent = "0 / 0";
    statusEl.textContent = "状態：-";
    return;
  }

  const card = filteredCards[currentIndex];
  showingJapanese = true;

  cardNumberEl.textContent = `No.${card.rowNumber}`;
  cardTextEl.textContent = card.japanese;
  progressEl.textContent = `${currentIndex + 1} / ${filteredCards.length}`;
  statusEl.textContent = `状態：${getStatusLabel(card.status)}`;
}

/* ===== 操作 ===== */
function flipCard() {
  const card = filteredCards[currentIndex];
  cardTextEl.textContent =
    showingJapanese ? card.english : card.japanese;
  showingJapanese = !showingJapanese;
}

function nextCard() {
  currentIndex = (currentIndex + 1) % filteredCards.length;
  showCard();
}

function prevCard() {
  currentIndex =
    (currentIndex - 1 + filteredCards.length) % filteredCards.length;
  showCard();
}

function shuffleCards() {
  for (let i = filteredCards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [filteredCards[i], filteredCards[j]] =
      [filteredCards[j], filteredCards[i]];
  }
  currentIndex = 0;
  showCard();
}

/* ===== ステータス ===== */
function setStatus(status) {
  filteredCards[currentIndex].status = status;
  saveStatuses();
  showCard();
}

/* ===== フィルター ===== */
function applyFilter(status) {
  currentFilter = status;

  filteredCards =
    status === "all"
      ? [...cards]
      : cards.filter(c => c.status === status);

  currentIndex = 0;
  updateFilterButtons();
  showCard();
}

function updateFilterButtons() {
  Object.keys(filterButtons).forEach(key => {
    filterButtons[key].classList.toggle(
      "active",
      key === currentFilter
    );
  });
}

/* ===== 表示用 ===== */
function getStatusLabel(status) {
  return {
    make: "英作文できる",
    memorized: "暗記した",
    unknown: "覚えてない",
    unrated: "未分類"
  }[status] || "-";
}

/* ===== イベント ===== */
cardEl.addEventListener("click", flipCard);
nextBtn.addEventListener("click", nextCard);
prevBtn.addEventListener("click", prevCard);
shuffleBtn.addEventListener("click", shuffleCards);

makeBtn.addEventListener("click", () => setStatus("make"));
memorizedBtn.addEventListener("click", () => setStatus("memorized"));
unknownBtn.addEventListener("click", () => setStatus("unknown"));

filterButtons.all.addEventListener("click", () => applyFilter("all"));
filterButtons.make.addEventListener("click", () => applyFilter("make"));
filterButtons.memorized.addEventListener("click", () => applyFilter("memorized"));
filterButtons.unknown.addEventListener("click", () => applyFilter("unknown"));
