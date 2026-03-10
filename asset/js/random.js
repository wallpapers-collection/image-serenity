document.addEventListener("DOMContentLoaded", async function () {
  const gallery = document.querySelector(".image-gallery");
  const refreshButton = document.getElementById("refreshButton");
  const backButton = document.getElementById("backButton");
  const scrollTopBtn = document.getElementById("scrollTopBtn");
  const darkmode = document.querySelector(".darkmode-btn");
  // modal kept for potential inline view

  let imageData = await loadPicture();
  if (!Array.isArray(imageData)) {
    imageData = [];
  }

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

  function getRandomImages(count = 12) {
    if (!imageData.length) return [];
    const pool = imageData.slice();
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, Math.min(count, pool.length));
  }

  function showRandomImages() {
    const randomImages = getRandomImages();
    const fragment = document.createDocumentFragment();
    randomImages.forEach((el) => {
      fragment.appendChild(createImageItem(el));
    });
    gallery.replaceChildren(fragment);
  }

  refreshButton.addEventListener("click", function () {
    refreshButton.disabled = true;
    refreshButton.textContent = "Refreshing...";
    requestAnimationFrame(() => {
      showRandomImages();
      setTimeout(() => {
        refreshButton.disabled = false;
        refreshButton.textContent = "Refresh";
      }, 150);
    });
  });

  backButton.addEventListener("click", function () {
    window.location.href = "https://wallpapers-collection.github.io/image-serenity";
  });

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
  showRandomImages();
});

async function loadPicture() {
  try {
    const response = await fetch("/raw/datas.json", {
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
  if (userLanguage !== "en" && userLanguage !== "zh-CN" && userLanguage !== "ja") {
    userLanguage = "en";
  }
  const html = document.getElementsByTagName("html");
  html[0].lang = userLanguage;
  try {
    const response = await fetch(`asset/lang/${userLanguage}.json`, {
      cache: "force-cache",
    });
    const data = await response.json();
    document.getElementById("refreshButton").textContent = data.refresh;
    document.getElementById("backButton").textContent = data.back;
  } catch (e) {
    console.log(e);
  }
}
