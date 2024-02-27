document.addEventListener("DOMContentLoaded", async function () {
  showPageBtn();
  // 图片数据数组，包含图片路径、标题和类别
  const imageData = await loadPicture();
  //每页显示的件数
  const itemsPerPage = 10;
  //当前页图片
  let currentImages = imageData ? imageData.slice() : imageData;
  // 总页
  let totalPages = Math.ceil(currentImages?.length / itemsPerPage);
  // 移动端当前页面
  let mobileCurrentPage = 1;

  /**
   *  PC版根据当前页数显示图片
   * @param {*} currentPage 当前页面
   */
  function displayImages(currentPage) {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageImages = currentImages.slice(startIndex, endIndex);
    const gallery = document.querySelector(".image-gallery");
    while (gallery.firstChild) {
      gallery.removeChild(gallery.firstChild);
    }
    pageImages.forEach((el) => {
      //创建图片项容器
      const imageItem = document.createElement("div");
      imageItem.classList.add("image-item");
      // 创建 loading 元素
      const loadingElement = document.createElement("div");
      loadingElement.classList.add("image-loading");
      loadingElement.textContent = "Loading...";
      loadingElement.style.display = "block";
      //创建link
      const alink = document.createElement("a");
      alink.href = el.src;
      alink.target = "_blank";
      alink.rel = "noopener noreferrer nofollow";

      // 创建图片元素
      const img = new Image();
      img.onload = function () {
        // 隐藏 loading 元素
        loadingElement.style.display = "none";
      };
      img.onerror = function () {
        img.src = "./asset/images/default.png";
      };
      img.alt = el.description;
      img.title = el.description;
      img.dataset.id = el.id;
      img.dataset.author_id = el.author_id;
      img.dataset.category = el.category;
      img.dataset.size = el.size;
      img.dataset.datetime = el.date_time;
      img.src = el.src;
      img.loading = "lazy";
      img.decoding = "async";
      //将图片添加到link
      alink.appendChild(img);
      //到图片项容器到图片项容器
      imageItem.appendChild(alink);
      // 将 loading 和图片元素添加到图片项容器
      imageItem.appendChild(loadingElement);
      //将图片项容器添加到图片显示区域
      gallery.appendChild(imageItem);
    });
    // 页面设置
    const currentPageElement = document.getElementById("currentPage");
    currentPageElement.textContent = currentPage;
    const totalpageElement = document.getElementById("totalpage");
    totalpageElement.textContent = totalPages;
  }

  /**
   * 更新URL中的page参数
   */
  function updateURL(page) {
    const allPath = window.location.origin + window.location.pathname;
    const newUrl = allPath + "?page=" + page;
    window.history.pushState({ path: newUrl }, "", newUrl);
  }

  /**
   * 翻页操作时更新URL
   * @param currentPage 当前的页面
   */
  function displayImagesAndUpdateURL(currentPage) {
    displayImages(currentPage);
    updateURL(currentPage);
  }

  /**
   * PC版下的获取当前页面
   */
  function getCurrentPage() {
    // 从URL中获取page参数，如果没有则默认为1
    const urlParams = new URLSearchParams(window.location.search);
    let currentPage = parseInt(urlParams.get("page")) || 1;
    if (isNaN(currentPage)) {
      currentPage = 1;
    } else if (currentPage < 1) {
      currentPage = 1;
    } else if (currentPage > totalPages) {
      currentPage = totalPages;
    }

    return currentPage;
  }

  // 切换夜间模式和白天模式
  const darkmode = document.querySelector(".darkmode-btn");
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

  // 搜索功能
  const searchButton = document.getElementById("searchButton");
  const searchInput = document.getElementById("searchInput");
  // 添加enter检索事件
  searchInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      performSearch();
    }
  });

  //检索按钮按下事件
  searchButton.addEventListener("click", performSearch);

  /**
   * 检索函数
   */
  function performSearch() {
    const searchTerm = searchInput.value.toLowerCase();
    if (!searchTerm.trim()) {
      currentImages = imageData.slice();
    } else {
      currentImages = imageData.filter(
        (item) =>
          item.title.toLowerCase().includes(searchTerm) ||
          item.description.toLowerCase().includes(searchTerm) ||
          item.author_id.toLowerCase().includes(searchTerm)
      );
    }
    totalPages = Math.ceil(currentImages.length / itemsPerPage);
    mobileCurrentPage = 1;
    displayImagesAndUpdateURL(1);
  }

  // 点击第一页按钮
  const firstPageButton = document.getElementById("firstPage");
  firstPageButton.addEventListener("click", function () {
    displayImagesAndUpdateURL(1);
  });

  // 点击上一页按钮
  const prevPageButton = document.getElementById("prevPage");
  prevPageButton.addEventListener("click", function () {
    // 获取当前页数
    const currentPage = parseInt(
      document.getElementById("currentPage").textContent
    );
    if (currentPage > 1) {
      displayImagesAndUpdateURL(currentPage - 1);
    }
  });

  // 点击下一页按钮
  const nextPageButton = document.getElementById("nextPage");
  nextPageButton.addEventListener("click", function () {
    // 获取当前页数和总页数
    const currentPage = parseInt(
      document.getElementById("currentPage").textContent
    );
    const totalPages = Math.ceil(currentImages.length / itemsPerPage);
    if (currentPage < totalPages) {
      displayImagesAndUpdateURL(currentPage + 1);
    }
  });

  // 点击最后一页按钮
  const lastPageButton = document.getElementById("lastPage");
  lastPageButton.addEventListener("click", function () {
    displayImagesAndUpdateURL(totalPages);
  });

  //直接修改页数
  const currentPageElement = document.getElementById("currentPage");
  currentPageElement.addEventListener("input", function (event) {
    let currentPage;
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
    displayImagesAndUpdateURL(currentPage);
  });

  // 监听键盘事件
  document.addEventListener("keydown", function (event) {
    const currentPage = parseInt(
      document.getElementById("currentPage").textContent
    );
    const totalPages = Math.ceil(currentImages.length / itemsPerPage);
    if (event.key === "ArrowLeft" && currentPage > 1) {
      displayImagesAndUpdateURL(currentPage - 1);
    } else if (event.key === "ArrowRight" && currentPage < totalPages) {
      displayImagesAndUpdateURL(currentPage + 1);
    }
  });

  // 加载更多按钮点击事件
  const loadMoreBtn = document.getElementById("loadMoreBtn");
  loadMoreBtn.addEventListener("click", function () {
    mobileCurrentPage++;
    const startIndex = (mobileCurrentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageImages = currentImages.slice(startIndex, endIndex);

    const gallery = document.querySelector(".image-gallery");
    pageImages.forEach((el) => {
      //创建图片项容器
      const imageItem = document.createElement("div");
      imageItem.classList.add("image-item");
      // 创建 loading 元素
      const loadingElement = document.createElement("div");
      loadingElement.classList.add("image-loading");
      loadingElement.textContent = "Loading...";
      loadingElement.style.display = "block";
      //创建link
      const alink = document.createElement("a");
      alink.href = el.src;
      alink.target = "_blank";
      alink.rel = "noopener noreferrer nofollow";
      const img = new Image();
      img.onload = function () {
        // 隐藏 loading 元素
        loadingElement.style.display = "none";
      };
      img.onerror = function () {
        img.src = "./asset/images/default.png";
      };
      img.alt = el.description;
      img.title = el.description;
      img.dataset.id = el.id;
      img.dataset.author_id = el.author_id;
      img.dataset.category = el.category;
      img.dataset.size = el.size;
      img.dataset.datetime = el.date_time;
      img.src = el.src;
      img.loading = "lazy";
      img.decoding = "async";
      //将图片添加到link
      alink.appendChild(img);
      //到图片项容器到图片项容器
      imageItem.appendChild(alink);
      // 将 loading 和图片元素添加到图片项容器
      imageItem.appendChild(loadingElement);
      //将图片项容器添加到图片显示区域
      gallery.appendChild(imageItem);
    });

    // 判断是否还有更多图片可以加载，如果没有，隐藏加载更多按钮
    if (itemsPerPage > pageImages.length) {
      loadMoreBtn.style.display = "none";
    }
  });

  // 随机按钮点击事件
  const randomButton = document.getElementById("randomButton");
  randomButton.addEventListener("click", function () {
    window.location.href =
      "https://wallpapers-collection.github.io/image-serenity/random.html";
  });

  // 向上滚动按钮
  const scrollTopBtn = document.getElementById("scrollTopBtn");
  // 当用户滚动页面时，显示或隐藏返回顶部按钮
  window.addEventListener("scroll", function () {
    if (window.scrollY > 200) {
      scrollTopBtn.classList.add("show");
    } else {
      scrollTopBtn.classList.remove("show");
    }
  });

  // 当用户点击返回顶部按钮时，滚动到页面顶部
  scrollTopBtn.addEventListener("click", function () {
    window.scrollTo({
      top: 0,
      behavior: "smooth", // 平滑滚动
    });
  });

  // 加载语言
  await loadLanguage();
  // 初始化显示图片
  displayImagesAndUpdateURL(getCurrentPage());
});

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
    //loading非表示
    document.querySelector(".loader-wrapper").style.display = "none";
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
  if (
    userLanguage !== "en" &&
    userLanguage !== "zh-CN" &&
    userLanguage !== "ja"
  ) {
    userLanguage = "en";
  }
  let html = document.getElementsByTagName("html");
  html[0].lang = userLanguage;
  // 加载对应的 JSON 文件
  try {
    const response = await fetch(`asset/lang/${userLanguage}.json`);
    const data = await response.json();
    // 将文本内容应用到页面上
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

/**
 * 显示翻页按钮
 */
function showPageBtn() {
  if (isMobile()) {
    const pagination = document.querySelector(".pagination-container");
    pagination.style.display = "none";
    const mobilePagination = document.querySelector(
      ".mobile-pagination-container"
    );
    mobilePagination.style.display = "block";
  } else {
    const pagination = document.querySelector(".pagination-container");
    pagination.style.display = "flex";
    const mobilePagination = document.querySelector(
      ".mobile-pagination-container"
    );
    mobilePagination.style.display = "none";
  }
}

/**
 * 判断是否是移动端
 * @returns 移动端flg
 */
function isMobile() {
  var userAgent = navigator.userAgent;
  var mobileDeviceRegex =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;

  if (
    mobileDeviceRegex.test(userAgent) ||
    window.matchMedia("only screen and (max-width: 768px)").matches
  ) {
    return true;
  }
  return false;
}
