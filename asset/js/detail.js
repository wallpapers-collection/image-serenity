document.addEventListener("DOMContentLoaded", async function () {
  const img = document.getElementById("detailImg");
  const imgLoading = document.getElementById("detailImgLoading");
  const titleEl = document.getElementById("detailTitle");
  const descEl = document.getElementById("detailDesc");
  const chipsEl = document.getElementById("detailChips");
  const gridEl = document.getElementById("detailGrid");
  const openRaw = document.getElementById("detailOpenRaw");
  const pageLoader = document.getElementById("pageLoader");
  const backBtn = document.getElementById("detailBackBtn");

  const hidePageLoader = () => {
    if (pageLoader) pageLoader.style.display = "none";
  };

  if (backBtn) {
    backBtn.addEventListener("click", () => {
      // site sends no-referrer, so history length is the only reliable signal we arrived from within the site
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = "index.html";
      }
    });
  }

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const idx = params.get("idx");

  if (!id && idx === null) {
    titleEl.textContent = "No image id provided";
    hidePageLoader();
    return;
  }

  try {
    const res = await fetch("raw/datas.json", { cache: "force-cache" });
    const datas = await res.json();
    // ids in datas.json are not unique (one post can hold multiple images),
    // so the array index (idx) is required to pinpoint the exact item.
    let item = null;
    if (Array.isArray(datas)) {
      const parsedIdx = idx !== null ? Number(idx) : NaN;
      if (Number.isInteger(parsedIdx) && datas[parsedIdx]) {
        item = datas[parsedIdx];
      } else {
        // fallback for legacy links that only carry an id
        item = datas.find((x) => String(x.id) === String(id));
      }
    }

    if (!item) {
      titleEl.textContent = "Image not found";
      hidePageLoader();
      return;
    }

    img.alt = item.description || item.title || "detail";
    titleEl.textContent = item.title || "Untitled";
    descEl.textContent = item.description || "";
    openRaw.href = item.src;

    if (imgLoading) imgLoading.style.display = "flex";
    img.onload = () => {
      if (imgLoading) imgLoading.style.display = "none";
    };
    img.onerror = () => {
      if (imgLoading) imgLoading.textContent = "Failed to load image";
    };
    img.src = `${item.src}@1280w_85q.webp`;

    chipsEl.innerHTML = "";
    const chips = [
      item.category && `Category: ${item.category}`,
      item.author_id && `Author: @${item.author_id}`,
    ].filter(Boolean);
    chips.forEach((chip) => {
      const span = document.createElement("span");
      span.className = "chip";
      span.textContent = chip;
      chipsEl.appendChild(span);
    });

    gridEl.innerHTML = "";
    const gridItems = [
      { label: "Size", value: item.size },
      { label: "Date", value: item.date_time },
      { label: "Tags", value: item.tags },
      { label: "Keywords", value: item.keywords },
      { label: "Characters", value: item.characters },
    ].filter((g) => g.value);

    gridItems.forEach((g) => {
      const div = document.createElement("div");
      div.className = "detail-tile";
      const label = document.createElement("span");
      label.className = "label";
      label.textContent = g.label;
      const val = document.createElement("span");
      val.className = "value";
      val.textContent = g.value;
      div.append(label, val);
      gridEl.appendChild(div);
    });
  } catch (e) {
    titleEl.textContent = "Load failed";
    console.error(e);
  } finally {
    hidePageLoader();
  }
});

