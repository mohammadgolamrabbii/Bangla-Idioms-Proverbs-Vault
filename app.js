// Bangla Idioms & Proverbs Vault - Client Application Engine
let state = {
  activeTab: "idioms",
  activeCategory: "all",
  searchQuery: "",
  datasets: {
    idioms: [],
    proverbs: [],
    homophones: [],
    substitutions: [],
    quizBank: []
  },
  quiz: {
    currentIndex: 0,
    score: 0,
    answered: false
  }
};

// DOM Elements
const searchInput = document.getElementById("searchInput");
const resultsContainer = document.getElementById("resultsContainer");
const categoryChips = document.getElementById("categoryChips");
const resultsCount = document.getElementById("resultsCount");
const toast = document.getElementById("toast");
const themeToggle = document.getElementById("themeToggle");

// Initialize
document.addEventListener("DOMContentLoaded", async () => {
  initTheme();
  setupEventListeners();
  await loadData();
  render();
});

// Theme Management
function initTheme() {
  const saved = localStorage.getItem("vault_theme") || "light";
  document.documentElement.setAttribute("data-theme", saved);
  updateThemeIcon(saved);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme") || "light";
  const next = current === "light" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("vault_theme", next);
  updateThemeIcon(next);
}

function updateThemeIcon(theme) {
  if (themeToggle) {
    themeToggle.innerHTML = theme === "dark" ? "☀️ হালকা মোড" : "🌙 ডার্ক মোড";
  }
}

// Data Fetching
async function loadData() {
  try {
    const [idm, prv, hom, ows, qz] = await Promise.all([
      fetch("data/idioms.json").then(r => r.json()),
      fetch("data/proverbs.json").then(r => r.json()),
      fetch("data/homophones.json").then(r => r.json()),
      fetch("data/one_word_substitutions.json").then(r => r.json()),
      fetch("data/quiz_bank.json").then(r => r.json())
    ]);

    state.datasets.idioms = idm;
    state.datasets.proverbs = prv;
    state.datasets.homophones = hom;
    state.datasets.substitutions = ows;
    state.datasets.quizBank = qz;

    updateStats();
  } catch (err) {
    console.error("Error loading vault datasets:", err);
    showToast("⚠️ ডেটাসেট লোড করতে সমস্যা হয়েছে!");
  }
}

function updateStats() {
  const elTotal = document.getElementById("statTotal");
  const elIdioms = document.getElementById("statIdioms");
  const elProverbs = document.getElementById("statProverbs");
  const elHomophones = document.getElementById("statHomophones");

  if (elTotal) {
    const total = state.datasets.idioms.length + state.datasets.proverbs.length + state.datasets.homophones.length + state.datasets.substitutions.length;
    elTotal.innerText = total + "+";
  }
  if (elIdioms) elIdioms.innerText = state.datasets.idioms.length;
  if (elProverbs) elProverbs.innerText = state.datasets.proverbs.length;
  if (elHomophones) elHomophones.innerText = state.datasets.homophones.length;
}

// Event Listeners
function setupEventListeners() {
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      state.searchQuery = e.target.value.trim().toLowerCase();
      render();
    });
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", toggleTheme);
  }

  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      state.activeTab = btn.dataset.tab;
      state.activeCategory = "all";
      renderCategories();
      render();
    });
  });
}

// Render Categories
function renderCategories() {
  if (!categoryChips) return;
  categoryChips.innerHTML = "";

  if (state.activeTab === "quiz" || state.activeTab === "api") {
    categoryChips.style.display = "none";
    return;
  }
  categoryChips.style.display = "flex";

  let cats = [];
  if (state.activeTab === "idioms") {
    cats = [...new Set(state.datasets.idioms.map(i => i.category))];
  } else if (state.activeTab === "substitutions") {
    cats = [...new Set(state.datasets.substitutions.map(o => o.category))];
  }

  if (cats.length === 0) {
    categoryChips.style.display = "none";
    return;
  }

  const allChip = document.createElement("button");
  allChip.className = `chip ${state.activeCategory === "all" ? "active" : ""}`;
  allChip.innerText = "সকল বিভাগ";
  allChip.onclick = () => {
    state.activeCategory = "all";
    renderCategories();
    render();
  };
  categoryChips.appendChild(allChip);

  cats.forEach(c => {
    const chip = document.createElement("button");
    chip.className = `chip ${state.activeCategory === c ? "active" : ""}`;
    chip.innerText = c;
    chip.onclick = () => {
      state.activeCategory = c;
      renderCategories();
      render();
    };
    categoryChips.appendChild(chip);
  });
}

// Main Render Function
function render() {
  if (!resultsContainer) return;

  if (state.activeTab === "quiz") {
    renderQuiz();
    return;
  }

  if (state.activeTab === "api") {
    renderApiDocs();
    return;
  }

  let items = [];
  const q = state.searchQuery;

  if (state.activeTab === "idioms") {
    items = state.datasets.idioms.filter(i => {
      const matchCat = state.activeCategory === "all" || i.category === state.activeCategory;
      const matchQuery = !q || i.phrase.toLowerCase().includes(q) || i.meaning.toLowerCase().includes(q) || (i.english_equivalent && i.english_equivalent.toLowerCase().includes(q)) || (i.sentence && i.sentence.toLowerCase().includes(q));
      return matchCat && matchQuery;
    });
    renderIdioms(items);
  } else if (state.activeTab === "proverbs") {
    items = state.datasets.proverbs.filter(p => {
      return !q || p.proverb.toLowerCase().includes(q) || p.meaning.toLowerCase().includes(q) || (p.english_proverb && p.english_proverb.toLowerCase().includes(q));
    });
    renderProverbs(items);
  } else if (state.activeTab === "homophones") {
    items = state.datasets.homophones.filter(h => {
      const str = (h.pair_title + " " + h.notes + " " + h.words.map(w => w.word + " " + w.meaning).join(" ")).toLowerCase();
      return !q || str.includes(q);
    });
    renderHomophones(items);
  } else if (state.activeTab === "substitutions") {
    items = state.datasets.substitutions.filter(s => {
      const matchCat = state.activeCategory === "all" || s.category === state.activeCategory;
      const matchQuery = !q || s.phrase.toLowerCase().includes(q) || s.substitution.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });
    renderSubstitutions(items);
  }

  if (resultsCount) {
    resultsCount.innerText = `মোট ফলাফল: ${items.length} টি`;
  }
}

// Renderers for Categories
function renderIdioms(items) {
  if (items.length === 0) {
    renderEmpty();
    return;
  }

  resultsContainer.innerHTML = items.map(i => `
    <div class="card">
      <div class="card-top">
        <div class="card-title">${escapeHtml(i.phrase)}</div>
        <button class="card-copy-btn" title="কপি করুন" onclick="copyText('${escapeHtml(i.phrase)} - ${escapeHtml(i.meaning)}')">
          📋
        </button>
      </div>
      <div class="card-meaning">অর্থ: ${escapeHtml(i.meaning)}</div>
      <div class="card-sentence">${escapeHtml(i.sentence)}</div>
      ${i.english_equivalent ? `<div class="card-english">🇬🇧 <em>${escapeHtml(i.english_equivalent)}</em></div>` : ''}
      <div class="card-footer">
        <span class="category-badge">${escapeHtml(i.category)}</span>
        <div class="tag-list">
          ${(i.tags || []).map(t => `<span class="tag">#${escapeHtml(t)}</span>`).join('')}
        </div>
      </div>
    </div>
  `).join("");
}

function renderProverbs(items) {
  if (items.length === 0) {
    renderEmpty();
    return;
  }

  resultsContainer.innerHTML = items.map(p => `
    <div class="card">
      <div class="card-top">
        <div class="card-title">📜 ${escapeHtml(p.proverb)}</div>
        <button class="card-copy-btn" title="কপি করুন" onclick="copyText('${escapeHtml(p.proverb)}: ${escapeHtml(p.meaning)}')">
          📋
        </button>
      </div>
      <div class="card-meaning">ভাবার্থ: ${escapeHtml(p.meaning)}</div>
      ${p.english_proverb ? `<div class="card-sentence" style="border-left-color: var(--primary);">🇬🇧 সমার্থক ইংরেজি প্রবাদ: <strong>${escapeHtml(p.english_proverb)}</strong></div>` : ''}
      ${p.context ? `<div class="card-english">📌 প্রয়োগ ক্ষেত্র: ${escapeHtml(p.context)}</div>` : ''}
      <div class="card-footer">
        <span class="category-badge">প্রবাদ-প্রবচন</span>
        <div class="tag-list">
          ${(p.tags || []).map(t => `<span class="tag">#${escapeHtml(t)}</span>`).join('')}
        </div>
      </div>
    </div>
  `).join("");
}

function renderHomophones(items) {
  if (items.length === 0) {
    renderEmpty();
    return;
  }

  resultsContainer.innerHTML = items.map(h => `
    <div class="card">
      <div class="card-top">
        <div class="card-title">⚖️ ${escapeHtml(h.pair_title)}</div>
        <button class="card-copy-btn" title="কপি করুন" onclick="copyText('${escapeHtml(h.pair_title)}: ${h.words.map(w => w.word + ' (' + w.meaning + ')').join(' | ')}')">
          📋
        </button>
      </div>
      <div class="homo-pair">
        ${(h.words || []).map(w => `
          <div class="homo-item">
            <div class="homo-word">${escapeHtml(w.word)}</div>
            <div class="homo-def"><strong>অর্থ:</strong> ${escapeHtml(w.meaning)}</div>
            <div class="homo-sen">"${escapeHtml(w.sentence)}"</div>
          </div>
        `).join("")}
      </div>
      ${h.notes ? `<div class="card-english" style="font-size: 0.85rem;">💡 <em>${escapeHtml(h.notes)}</em></div>` : ''}
      <div class="card-footer">
        <span class="category-badge">${escapeHtml(h.bcs_importance || 'গুরুত্বপূর্ণ')}</span>
      </div>
    </div>
  `).join("");
}

function renderSubstitutions(items) {
  if (items.length === 0) {
    renderEmpty();
    return;
  }

  resultsContainer.innerHTML = items.map(s => `
    <div class="card">
      <div class="card-top">
        <div class="card-title" style="color: var(--secondary);">✂️ ${escapeHtml(s.substitution)}</div>
        <button class="card-copy-btn" title="কপি করুন" onclick="copyText('${escapeHtml(s.phrase)} = ${escapeHtml(s.substitution)}')">
          📋
        </button>
      </div>
      <div class="card-meaning" style="font-size: 1.05rem; margin-top: 0.4rem;">
        "${escapeHtml(s.phrase)}"
      </div>
      <div class="card-footer" style="margin-top: 1rem;">
        <span class="category-badge">${escapeHtml(s.category)}</span>
      </div>
    </div>
  `).join("");
}

// Render Interactive Quiz
function renderQuiz() {
  if (resultsCount) resultsCount.innerText = "বিসিএস ও ভর্তি পরীক্ষা প্রস্তুতি কুইজ";
  const list = state.datasets.quizBank;
  if (!list || list.length === 0) {
    resultsContainer.innerHTML = `<p style="text-align:center; padding: 2rem;">কুইজ ব্যাংক লোড করা সম্ভব হয়নি।</p>`;
    return;
  }

  const idx = state.quiz.currentIndex;

  if (idx >= list.length) {
    // Show Final Scorecard
    const percentage = Math.round((state.quiz.score / list.length) * 100);
    resultsContainer.innerHTML = `
      <div class="quiz-container">
        <div class="score-screen">
          <h2>🎉 কুইজ সমাপ্ত!</h2>
          <div class="score-badge">${state.quiz.score} / ${list.length}</div>
          <p style="font-size: 1.15rem; color: var(--text-muted); margin-bottom: 1.5rem;">
            আপনার অর্জিত নির্ভুলতা: <strong>${percentage}%</strong>
          </p>
          <button class="btn btn-primary" onclick="restartQuiz()">
            🔄 পুনরায় শুরু করুন
          </button>
        </div>
      </div>
    `;
    return;
  }

  const q = list[idx];
  const progressPercent = Math.round(((idx) / list.length) * 100);

  resultsContainer.innerHTML = `
    <div class="quiz-container">
      <div class="quiz-header">
        <strong>প্রশ্ন ${idx + 1} / ${list.length}</strong>
        <span style="color: var(--primary); font-weight: bold;">স্কোর: ${state.quiz.score}</span>
      </div>
      <div class="progress-bar-wrap">
        <div class="progress-bar" style="width: ${progressPercent}%;"></div>
      </div>
      <div class="quiz-question">${escapeHtml(q.question)}</div>
      <div class="quiz-options">
        ${q.options.map((opt, oIdx) => `
          <button class="quiz-option" id="opt_${oIdx}" onclick="selectAnswer(${oIdx})">
            ${['ক', 'খ', 'গ', 'ঘ'][oIdx]}. ${escapeHtml(opt)}
          </button>
        `).join("")}
      </div>
      <div class="quiz-explanation" id="quizExp">
        💡 <strong>ব্যাখ্যা:</strong> ${escapeHtml(q.explanation)}
      </div>
      <div class="quiz-footer">
        <div></div>
        <button class="btn btn-primary" id="nextQuizBtn" style="display: none;" onclick="nextQuestion()">
          পরবর্তী প্রশ্ন ➔
        </button>
      </div>
    </div>
  `;
}

function selectAnswer(chosenIdx) {
  if (state.quiz.answered) return;
  state.quiz.answered = true;

  const q = state.datasets.quizBank[state.quiz.currentIndex];
  const isCorrect = chosenIdx === q.answerIndex;

  if (isCorrect) {
    state.quiz.score++;
    showToast("✅ সঠিক উত্তর!");
  } else {
    showToast("❌ ভুল উত্তর!");
  }

  // Highlight options
  q.options.forEach((_, i) => {
    const btn = document.getElementById(`opt_${i}`);
    if (btn) {
      btn.disabled = true;
      if (i === q.answerIndex) {
        btn.classList.add("correct");
      } else if (i === chosenIdx) {
        btn.classList.add("wrong");
      }
    }
  });

  const expEl = document.getElementById("quizExp");
  if (expEl) expEl.classList.add("show");

  const nextBtn = document.getElementById("nextQuizBtn");
  if (nextBtn) nextBtn.style.display = "inline-flex";
}

function nextQuestion() {
  state.quiz.currentIndex++;
  state.quiz.answered = false;
  renderQuiz();
}

function restartQuiz() {
  state.quiz.currentIndex = 0;
  state.quiz.score = 0;
  state.quiz.answered = false;
  renderQuiz();
}

// Render API & Downloads Tab
function renderApiDocs() {
  if (resultsCount) resultsCount.innerText = "ওপেন এপিআই ও সরাসরি ডেটাসেট ডাউনলোড";
  resultsContainer.innerHTML = `
    <div style="max-width: 900px; margin: 0 auto;">
      <div class="api-card">
        <h3>📥 সরাসরি ডেটাসেট ডাউনলোড (JSON & CSV)</h3>
        <p style="color: var(--text-muted); margin-bottom: 1rem;">
          এই ডেটাসেটগুলো সম্পূর্ণ ওপেন-সোর্স এবং MIT লাইসেন্সযুক্ত। যেকোনো বাণিজ্যিক বা অবাণিজ্যিক প্রজেক্টে ফ্রিতে ব্যবহার করা যাবে।
        </p>
        <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
          <a class="btn" href="data/idioms.json" download>📄 idioms.json</a>
          <a class="btn" href="data/csv/idioms.csv" download>📊 idioms.csv</a>
          <a class="btn" href="data/proverbs.json" download>📄 proverbs.json</a>
          <a class="btn" href="data/csv/proverbs.csv" download>📊 proverbs.csv</a>
          <a class="btn" href="data/homophones.json" download>📄 homophones.json</a>
          <a class="btn" href="data/one_word_substitutions.json" download>📄 one_word_substitutions.json</a>
        </div>
      </div>

      <div class="api-card">
        <h3>🌐 সরাসরি CDN বা REST API কল (JavaScript / Fetch)</h3>
        <p style="color: var(--text-muted);">আপনার ওয়েব অ্যাপ্লিকেশনে সরাসরি ডেটাসেট ফেচ করতে পারেন:</p>
        <div class="code-block">
// Fetch all Bangla Idioms directly from GitHub Pages
fetch("https://mohammadgolamrabbii.github.io/Bangla-Idioms-Proverbs-Vault/data/idioms.json")
  .then(res => res.json())
  .then(idioms => {
    console.log("Loaded idioms:", idioms.length);
    console.log("Sample:", idioms[0]);
  });
        </div>
      </div>

      <div class="api-card">
        <h3>🐍 পাইথন ইন্টিগ্রেশন (Python / Pandas / NLP)</h3>
        <div class="code-block">
import pandas as pd

# Load idioms directly into a DataFrame
url = "https://raw.githubusercontent.com/mohammadgolamrabbii/Bangla-Idioms-Proverbs-Vault/main/data/csv/idioms.csv"
df = pd.read_csv(url)
print(df.head())
        </div>
      </div>
    </div>
  `;
}

function renderEmpty() {
  resultsContainer.innerHTML = `
    <div style="text-align: center; padding: 3rem 1rem; color: var(--text-muted); grid-column: 1 / -1;">
      <p style="font-size: 2rem; margin-bottom: 0.5rem;">🔍</p>
      <h3>কোনো ফলাফল পাওয়া যায়নি</h3>
      <p>ভিন্ন কোনো শব্দ বা অর্থ দিয়ে পুনরায় অনুসন্ধান করুন।</p>
    </div>
  `;
}

// Utility Functions
function copyText(str) {
  navigator.clipboard.writeText(str).then(() => {
    showToast("📋 কপি সম্পন্ন হয়েছে!");
  }).catch(() => {
    showToast("কপি করা যায়নি!");
  });
}

function showToast(msg) {
  if (!toast) return;
  toast.innerText = msg;
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
