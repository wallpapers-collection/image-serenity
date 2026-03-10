document.addEventListener("DOMContentLoaded", async function () {
  showPageBtn();

  const gallery = document.querySelector(".image-gallery");
  const searchButton = document.getElementById("searchButton");
  const searchInput = document.getElementById("searchInput");
  const firstPageButton = document.getElementById("firstPage");
  const prevPageButton = document.getElementById("prevPage");
  const nextPageButton = document.getElementById("nextPage");
  const lastPageButton = document.getElementById("lastPage");
  const currentPageElement = document.getElementById("currentPage");
  const totalpageElement = document.getElementById("totalpage");
  const loadMoreBtn = document.getElementById("loadMoreBtn");
  const randomButton = document.getElementById("randomButton");
  const scrollTopBtn = document.getElementById("scrollTopBtn");
  const darkmode = document.querySelector(".darkmode-btn");
  // modal kept for potential future inline view

  const itemsPerPage = 10;
  let imageData = await loadPicture();
  if (!Array.isArray(imageData)) {
    imageData = [];
  }
  // build searchable text cache for quick matching
  const searchable = imageData.map((item) => {
    const text = [
      item.title,
      item.description,
      item.author_id,
      item.category,
      item.size,
      item.id,
      item.date_time,
      item.tags,
      item.keywords,
      item.characters,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return { ...item, _search: text };
  });
  // use cached objects for searching
  imageData = searchable;
  let currentImages = imageData.slice();
  let totalPages = Math.max(1, Math.ceil(currentImages.length / itemsPerPage));
  let mobileCurrentPage = 1;

  function displayTitle(item) {
    const pick = (item.description || "")
      .split(/\r?\n/)
      .map((s) => s.trim().replace(/[【】]/g, ""))
      .find((s) => s.length > 0);
    const desc = pick && pick.length > 0 ? pick : null;
    const looksLikeHash = /^[a-f0-9]{20,}\.(jpe?g|png|webp)$/i.test(
      item.title || "",
    );
    if (desc) return desc.slice(0, 48);
    if (!looksLikeHash && item.title) return item.title;
    if (item.author_id) return `@${item.author_id}`;
    if (item.id) return `${item.category || "image"} #${item.id}`;
    return "Untitled";
  }

  function safeLower(value) {
    return (value || "").toString().toLowerCase();
  }

  function createImageItem(el) {
    const imageItem = document.createElement("div");
    imageItem.classList.add("image-item");
    imageItem.dataset.category = el.category || "image";

    const loadingElement = document.createElement("div");
    loadingElement.classList.add("image-loading");
    loadingElement.textContent = "Loading...";
    loadingElement.style.display = "flex";

    const detailHref = `detail.html?id=${encodeURIComponent(el.id)}`;
    const alink = document.createElement("a");
    alink.href = detailHref;
    alink.target = "_self";
    alink.rel = "noopener noreferrer";

    const img = new Image();
    img.onload = function () {
      loadingElement.style.display = "none";
    };
    img.onerror = function () {
      img.src = "./asset/images/default.png";
      loadingElement.style.display = "none";
    };
    img.alt = el.description;
    img.title = el.description;
    img.dataset.id = el.id;
    img.dataset.author_id = el.author_id;
    img.dataset.category = el.category;
    img.dataset.size = el.size;
    img.dataset.datetime = el.date_time;
    img.src = `${el.src}@720w_80q.webp`;
    img.loading = "lazy";
    img.decoding = "async";

    const footer = document.createElement("div");
    footer.classList.add("card-footer");
    const title = document.createElement("div");
    title.classList.add("title");
    title.textContent = displayTitle(el);
    const pillAuthor = document.createElement("div");
    pillAuthor.classList.add("pill");
    pillAuthor.textContent = el.author_id ? `@${el.author_id}` : "unknown";
    footer.appendChild(title);
    footer.appendChild(pillAuthor);

    alink.appendChild(img);
    imageItem.appendChild(alink);
    imageItem.appendChild(loadingElement);
    imageItem.appendChild(footer);

    imageItem.addEventListener("click", () => {
      window.location.href = detailHref;
    });

    return imageItem;
  }

  function renderImages(images, replace) {
    const fragment = document.createDocumentFragment();
    images.forEach((el) => {
      fragment.appendChild(createImageItem(el));
    });

    if (replace) {
      gallery.replaceChildren(fragment);
    } else {
      gallery.appendChild(fragment);
    }
  }

  function displayImages(currentPage) {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageImages = currentImages.slice(startIndex, endIndex);
    renderImages(pageImages, true);

    currentPageElement.textContent = currentPage;
    totalpageElement.textContent = totalPages;
  }

  function updateURL(page) {
    const allPath = window.location.origin + window.location.pathname;
    const newUrl = allPath + "?page=" + page;
    window.history.pushState({ path: newUrl }, "", newUrl);
  }

  function displayImagesAndUpdateURL(currentPage) {
    displayImages(currentPage);
    updateURL(currentPage);
  }

  function getCurrentPage() {
    const urlParams = new URLSearchParams(window.location.search);
    let currentPage = parseInt(urlParams.get("page"), 10) || 1;
    if (isNaN(currentPage)) {
      currentPage = 1;
    } else if (currentPage < 1) {
      currentPage = 1;
    } else if (currentPage > totalPages) {
      currentPage = totalPages;
    }

    return currentPage;
  }

  function updateLoadMoreVisibility() {
    const nextIndex = mobileCurrentPage * itemsPerPage;
    loadMoreBtn.style.display =
      nextIndex >= currentImages.length ? "none" : "block";
  }

  darkmode.addEventListener("click", function () {
    document.body.classList.toggle("night-mode");
    if (document.body.classList.contains("night-mode")) {
      darkmode.children[0].classList.remove("fa-moon");
      darkmode.children[0].classList.add("fa-sun");
    } else {
      darkmode.children[0].classList.remove("fa-sun");
      darkmode.children[0].classList.add("fa-moon");
    }
  });

  searchInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      performSearch();
    }
  });

  searchButton.addEventListener("click", performSearch);

  function performSearch() {
    const raw = searchInput.value.trim();
    const terms = raw
      .split(/\s+/)
      .map((t) => t.toLowerCase())
      .filter(Boolean);

    if (!terms.length) {
      currentImages = imageData.slice();
    } else {
      currentImages = imageData.filter((item) =>
        terms.every((term) => item._search.includes(term)),
      );
    }
    totalPages = Math.max(1, Math.ceil(currentImages.length / itemsPerPage));
    mobileCurrentPage = 1;
    updateLoadMoreVisibility();
    displayImagesAndUpdateURL(1);
  }

  firstPageButton.addEventListener("click", function () {
    displayImagesAndUpdateURL(1);
  });

  prevPageButton.addEventListener("click", function () {
    const currentPage = parseInt(currentPageElement.textContent, 10);
    if (currentPage > 1) {
      displayImagesAndUpdateURL(currentPage - 1);
    }
  });

  nextPageButton.addEventListener("click", function () {
    const currentPage = parseInt(currentPageElement.textContent, 10);
    if (currentPage < totalPages) {
      displayImagesAndUpdateURL(currentPage + 1);
    }
  });

  lastPageButton.addEventListener("click", function () {
    displayImagesAndUpdateURL(totalPages);
  });

  currentPageElement.addEventListener("input", function (event) {
    let currentPage;
    try {
      currentPage = parseInt(event.target.textContent, 10);
    } catch (e) {
      currentPage = 1;
    }
    if (isNaN(currentPage)) {
      currentPage = 1;
    } else if (currentPage < 1) {
      currentPage = 1;
    } else if (currentPage > totalPages) {
      currentPage = totalPages;
    }
    displayImagesAndUpdateURL(currentPage);
  });

  document.addEventListener("keydown", function (event) {
    const currentPage = parseInt(currentPageElement.textContent, 10);
    if (event.key === "ArrowLeft" && currentPage > 1) {
      displayImagesAndUpdateURL(currentPage - 1);
    } else if (event.key === "ArrowRight" && currentPage < totalPages) {
      displayImagesAndUpdateURL(currentPage + 1);
    }
  });

  loadMoreBtn.addEventListener("click", function () {
    mobileCurrentPage++;
    const startIndex = (mobileCurrentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageImages = currentImages.slice(startIndex, endIndex);
    renderImages(pageImages, false);
    updateLoadMoreVisibility();
  });

  randomButton.addEventListener("click", function () {
    window.location.href = "random.html";
  });

  let scrollTicking = false;
  window.addEventListener(
    "scroll",
    function () {
      if (!scrollTicking) {
        scrollTicking = true;
        window.requestAnimationFrame(function () {
          if (window.scrollY > 200) {
            scrollTopBtn.classList.add("show");
          } else {
            scrollTopBtn.classList.remove("show");
          }
          scrollTicking = false;
        });
      }
    },
    { passive: true },
  );

  scrollTopBtn.addEventListener("click", function () {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });

  await loadLanguage();
  updateLoadMoreVisibility();
  displayImagesAndUpdateURL(getCurrentPage());
});

async function loadPicture() {
  try {
    const response = await fetch("raw/datas.json", {
      cache: "force-cache",
    });
    let datas = await response.json();
    if (!Array.isArray(datas)) {
      datas = [];
    }
    document.querySelector(".loader-wrapper").style.display = "none";
    return datas;
  } catch (e) {
    console.log(e);
    document.querySelector(".loader-wrapper").style.display = "none";
    return [];
  }
}

async function loadLanguage() {
  let userLanguage = navigator.language || navigator.userLanguage;
  if (
    userLanguage !== "en" &&
    userLanguage !== "zh-CN" &&
    userLanguage !== "ja"
  ) {
    userLanguage = "en";
  }
  const html = document.getElementsByTagName("html");
  html[0].lang = userLanguage;
  try {
    const response = await fetch(`asset/lang/${userLanguage}.json`, {
      cache: "force-cache",
    });
    const data = await response.json();
    document.getElementById("searchButton").textContent = data.search;
    document.getElementById("firstPage").textContent = data.first_page;
    document.getElementById("prevPage").textContent = data.prev_page;
    document.getElementById("nextPage").textContent = data.next_page;
    document.getElementById("lastPage").textContent = data.last_page;
    document.getElementById("randomButton").textContent = data.random;
  } catch (e) {
    console.log(e);
  }
}

function showPageBtn() {
  if (isMobile()) {
    const pagination = document.querySelector(".pagination-container");
    pagination.style.display = "none";
    const mobilePagination = document.querySelector(
      ".mobile-pagination-container",
    );
    mobilePagination.style.display = "block";
  } else {
    const pagination = document.querySelector(".pagination-container");
    pagination.style.display = "flex";
    const mobilePagination = document.querySelector(
      ".mobile-pagination-container",
    );
    mobilePagination.style.display = "none";
  }
}

function isMobile() {
  const userAgent = navigator.userAgent;
  const mobileDeviceRegex =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;

  if (
    mobileDeviceRegex.test(userAgent) ||
    window.matchMedia("only screen and (max-width: 768px)").matches
  ) {
    return true;
  }
  return false;
}
