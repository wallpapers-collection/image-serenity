document.addEventListener("DOMContentLoaded", async function () {
  // 图片数据数组，包含图片路径、标题和类别
  const imageData = await loadPicture();
  const itemsPerPage = 14;
  let currentPage = 1;
  let currentImages = imageData ? imageData.slice() : imageData;
  const totalPages = Math.ceil(currentImages.length / itemsPerPage);

  const toggleModeCheckbox = document.getElementById("toggleMode");
  toggleModeCheckbox.addEventListener("change", function () {
    toggleNightMode();
  });

  // 根据当前页数显示图片
  function displayImages() {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageImages = currentImages.slice(startIndex, endIndex);

    const gallery = document.querySelector(".image-gallery");
    gallery.innerHTML = "";

    pageImages.forEach((image) => {
      const imageItem = document.createElement("div");
      imageItem.classList.add("image-item");

      const alink = document.createElement("a");
      alink.href = image.src;
      alink.target = "_blank";
      alink.rel = "noopener noreferrer";
      const img = document.createElement("img");
      img.src = image.src;
      img.alt = image.description || image.title;
      img.referrerPolicy = "no-referrer";
      img.loading = "lazy";
      img.decoding = "async";
      img.height = 400;
      alink.appendChild(img);

      imageItem.appendChild(alink);
      gallery.appendChild(imageItem);
    });

    const currentPageElement = document.getElementById("currentPage");
    currentPageElement.textContent = `${currentPage}`;
    const totalpageElement = document.getElementById("totalpage");
    totalpageElement.textContent = `${totalPages}`;
  }

  // 点击第一页按钮
  const firstPageButton = document.getElementById("firstPage");
  firstPageButton.addEventListener("click", function () {
    currentPage = 1;
    displayImages();
  });

  // 点击上一页按钮
  const prevPageButton = document.getElementById("prevPage");
  prevPageButton.addEventListener("click", function () {
    if (currentPage > 1) {
      currentPage--;
      displayImages();
    }
  });

  // 点击下一页按钮
  const nextPageButton = document.getElementById("nextPage");
  nextPageButton.addEventListener("click", function () {
    if (currentPage < totalPages) {
      currentPage++;
      displayImages();
    }
  });

  // 点击最后一页按钮
  const lastPageButton = document.getElementById("lastPage");
  lastPageButton.addEventListener("click", function () {
    currentPage = totalPages;
    displayImages();
  });

  //直接修改页数
  const currentPageElement = document.getElementById("currentPage");
  currentPageElement.addEventListener("input", function (event) {
    try {
      currentPage = parseInt(event.target.textContent);
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
    displayImages();
  });

  // 搜索功能
  const searchButton = document.getElementById("searchButton");
  const searchInput = document.getElementById("searchInput");
  searchButton.addEventListener("click", function () {
    const searchTerm = searchInput.value.toLowerCase();
    if (searchTerm.trim() === "") {
      currentImages = imageData.slice();
    } else {
      currentImages = imageData.filter((item) =>
        item.title.toLowerCase().includes(searchTerm)
      );
    }
    currentPage = 1;
    displayImages();
  });

  await loadLanguage();
  // 初始化显示图片
  displayImages();
});

// 切换夜间模式的函数
function toggleNightMode() {
  document.body.classList.toggle("night-mode");
}

/**
 * 加载所有图片
 * @returns 图片
 */
async function loadPicture() {
  try {
    const response = await fetch(`raw/datas.json`);
    const datas = await response.json();
    if (!datas) {
      datas = [];
    }
    return datas;
  } catch (e) {
    console.log(e);
  }
}

/**
 * 加载语言
 */
async function loadLanguage() {
  // 获取用户的语言首选项
  let userLanguage = navigator.language || navigator.userLanguage;
  if (userLanguage != "en" && userLanguage != "zh-CN" && userLanguage != "ja") {
    userLanguage = "en";
  }
  // 加载对应的 JSON 文件
  try {
    const response = await fetch(`lang/${userLanguage}.json`);
    const data = await response.json();
    // 将文本内容应用到页面上
    document.getElementById("homeLink").textContent = data.home;
    document.getElementById("aboutLink").textContent = data.about;
    document.getElementById("darkMode").textContent = data.dark_mode_label;
    document.getElementById("searchButton").textContent = data.search;
    document.getElementById("firstPage").textContent = data.first_page;
    document.getElementById("prevPage").textContent = data.prev_page;
    document.getElementById("nextPage").textContent = data.next_page;
    document.getElementById("lastPage").textContent = data.last_page;
  } catch (e) {
    console.log(e);
  }
}
