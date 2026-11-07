const movies = window.MOVIES || [];
const fallbackPalette = {
  frozen: ["#152c50", "#9ad4e9"], moana: ["#035a69", "#f4bb69"],
  "the-m-riders-finding-pangu": ["#41275d", "#d9a9ff"], "good-boy": ["#202d36", "#8fb9bd"]
};
const dateText = value => value ? value.replaceAll("-", "/") : "尚未補充";
const escapeHTML = value => String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
function posterMarkup(movie, detail = false) {
  const [from, to] = fallbackPalette[movie.id] || ["#343541", "#c2ad83"];
  const image = movie.posterUrl || movie.poster || "";
  return `<div class="poster-frame${detail ? " poster-detail" : ""}" style="--poster-from:${from};--poster-to:${to}">${image ? `<img src="${escapeHTML(image)}" alt="${escapeHTML(movie.posterAlt || movie.title + "電影海報")}" loading="${detail ? "eager" : "lazy"}" onerror="this.remove()">` : ""}<div class="poster-fallback"><span class="poster-fallback-kicker">A FILM IN MY JOURNAL</span><strong>${escapeHTML(movie.title)}</strong><small>${escapeHTML(movie.originalTitle || "")}</small></div><span class="poster-year">${escapeHTML(movie.year || "—")}</span></div>`;
}
function cardMarkup(movie) {
  const genres = (movie.genres || []).slice(0, 2).map(escapeHTML).join(" · ");
  return `<a class="movie-card" href="movie.html?id=${encodeURIComponent(movie.id)}" aria-label="查看《${escapeHTML(movie.title)}》電影資訊"><div class="poster-wrap">${posterMarkup(movie)}<span class="card-arrow" aria-hidden="true">↗</span></div><div class="card-meta"><span>${escapeHTML(movie.year || "年份待補")}</span><span>${genres}</span></div><h3>${escapeHTML(movie.title)}</h3><p class="card-original">${escapeHTML(movie.originalTitle || "")}</p></a>`;
}
function initIndex() {
  const grid = document.getElementById("movie-grid");
  if (!grid) return;
  const search = document.getElementById("search"), genre = document.getElementById("genre-filter"), sort = document.getElementById("sort-order");
  const genres = [...new Set(movies.flatMap(movie => movie.genres || []))].sort((a,b) => a.localeCompare(b, "zh-Hant"));
  genres.forEach(value => genre.insertAdjacentHTML("beforeend", `<option value="${escapeHTML(value)}">${escapeHTML(value)}</option>`));
  function render() {
    const query = search.value.trim().toLowerCase();
    const selectedGenre = genre.value;
    const visible = movies.filter(movie => `${movie.title} ${movie.originalTitle}`.toLowerCase().includes(query) && (selectedGenre === "all" || (movie.genres || []).includes(selectedGenre)));
    if (sort.value === "newest") visible.sort((a,b) => (b.year || 0) - (a.year || 0) || a.title.localeCompare(b.title, "zh-Hant"));
    if (sort.value === "oldest") visible.sort((a,b) => (a.year || 0) - (b.year || 0) || a.title.localeCompare(b.title, "zh-Hant"));
    if (sort.value === "title") visible.sort((a,b) => a.title.localeCompare(b.title, "zh-Hant"));
    grid.innerHTML = visible.map(cardMarkup).join("");
    document.getElementById("result-count").textContent = `${visible.length} 部電影`;
    document.getElementById("empty-state").hidden = visible.length !== 0;
  }
  [search, genre, sort].forEach(control => control.addEventListener(control === search ? "input" : "change", render));
  render();
}
function initDetail() {
  const root = document.getElementById("movie-detail");
  if (!root) return;
  const id = new URLSearchParams(location.search).get("id");
  const movie = movies.find(item => item.id === id);
  if (!movie) {
    root.innerHTML = `<section class="not-found"><p class="eyebrow">NOT IN THE COLLECTION</p><h1>找不到這部電影。</h1><p>這個片單沒有對應的電影，或網址中的代稱有誤。</p><a class="back-button" href="index.html">← 返回所有電影</a></section>`;
    return;
  }
  const rating = Number.isFinite(movie.rating) ? `${movie.rating.toFixed(1)} <span>/ 5</span>` : `<span class="muted-value">尚未評分</span>`;
  const facts = [["上映年份", movie.year], ["台灣上映日", dateText(movie.releaseDateTW)], ["類型", (movie.genres || []).join("、")], ["導演", movie.director], ["主要演員", (movie.cast || []).join("、")], ["片長", movie.runtimeMinutes ? `${movie.runtimeMinutes} 分鐘` : "尚未補充"]];
  const factsHTML = facts.map(([label,value]) => `<div class="fact"><dt>${escapeHTML(label)}</dt><dd>${escapeHTML(value || "尚未補充")}</dd></div>`).join("");
  root.innerHTML = `<a class="back-link" href="index.html">← 回到我的片單</a><section class="detail-hero"><div class="detail-poster">${posterMarkup(movie, true)}</div><div class="detail-heading"><p class="eyebrow">FILM JOURNAL　/　${escapeHTML(movie.year || "YEAR UNKNOWN")}</p><h1>${escapeHTML(movie.title)}</h1><p class="original-title">${escapeHTML(movie.originalTitle || "")}</p><div class="detail-tags">${(movie.genres || []).map(tag => `<span>${escapeHTML(tag)}</span>`).join("")}</div><p class="detail-lead">為看過的故事留下一個位置，慢慢補上屬於自己的觀影記錄。</p><a class="back-button" href="#my-notes">閱讀觀後感 <span>↓</span></a></div></section><section class="detail-content"><div class="content-main"><section class="content-section"><p class="eyebrow">01 / THE FILM</p><h2>基本資料</h2><dl class="facts-grid">${factsHTML}</dl></section><section class="content-section"><p class="eyebrow">02 / THE STORY</p><h2>劇情簡介</h2><p class="body-copy">${escapeHTML(movie.synopsis || "尚未補充。")}</p><p class="spoiler-note">本簡介不透露結局。</p></section><section class="content-section" id="my-notes"><p class="eyebrow">03 / MY IMPRESSION</p><h2>觀後感</h2>${movie.review ? `<p class="body-copy review-copy">${escapeHTML(movie.review).replaceAll("\n", "<br>")}</p>${movie.spoiler ? `<span class="spoiler-label">含劇透</span>` : ""}` : `<div class="note-placeholder"><span class="note-icon">✳</span><p>這篇觀後感還在等你補上。</p><small>記下喜歡的片段、印象深刻的角色，或看完後留下的想法。</small></div>`}</section></div><aside class="personal-card"><p class="eyebrow">MY VIEWING LOG</p><h2>我的觀影紀錄</h2><div class="rating-block"><span class="aside-label">個人評分</span><strong class="rating-value">${rating}</strong><span class="rating-stars">${Number.isFinite(movie.rating) ? "★".repeat(Math.round(movie.rating)) + "☆".repeat(5 - Math.round(movie.rating)) : "☆☆☆☆☆"}</span></div><div class="watch-info"><span class="aside-label">觀影日期</span><strong>${escapeHTML(dateText(movie.watchedAt))}</strong></div><div class="watch-info"><span class="aside-label">台灣上映</span><strong>${escapeHTML(dateText(movie.releaseDateTW))}</strong></div><p class="aside-hint">評分和觀影日期以個人實際紀錄為準。</p></aside></section><nav class="detail-bottom"><a href="index.html">← 返回所有電影</a><span>${escapeHTML(movie.title)}　·　${escapeHTML(movie.originalTitle || "")}</span></nav>`;
}
initIndex();
initDetail();
