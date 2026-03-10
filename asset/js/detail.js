document.addEventListener("DOMContentLoaded", async function () {
  const img = document.getElementById("detailImg");
  const titleEl = document.getElementById("detailTitle");
  const descEl = document.getElementById("detailDesc");
  const chipsEl = document.getElementById("detailChips");
  const gridEl = document.getElementById("detailGrid");
  const openRaw = document.getElementById("detailOpenRaw");

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) {
    titleEl.textContent = "No image id provided";
    return;
  }

  try {
    const res = await fetch("raw/datas.json", { cache: "force-cache" });
    const datas = await res.json();
    const item = Array.isArray(datas)
      ? datas.find((x) => String(x.id) === String(id))
      : null;

    if (!item) {
      titleEl.textContent = "Image not found";
      return;
    }

    img.src = `${item.src}@1280w_85q.webp`;
    img.alt = item.description || item.title || "detail";
    titleEl.textContent = item.title || "Untitled";
    descEl.textContent = item.description || "";
    openRaw.href = item.src;

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
  }
});
