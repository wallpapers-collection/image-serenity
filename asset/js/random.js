document.addEventListener("DOMContentLoaded", async function () {
  // 图片数据数组，包含图片路径、标题和类别
  const imageData = await loadPicture();

  // 随机取出10张图片
  function getRandomImages() {
    const randomImages = [];
    for (let i = 0; i < 10; i++) {
      const randomIndex = Math.floor(Math.random() * imageData.length);
      randomImages.push(imageData[randomIndex]);
    }
    return randomImages;
  }

  // 显示随机图片
  function showRandomImages() {
    const randomImages = getRandomImages();
    const gallery = document.querySelector(".image-gallery");
    while (gallery.firstChild) {
      gallery.removeChild(gallery.firstChild);
    }
    randomImages.forEach((el) => {
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
      img.alt = el.description;
      img.title = el.description;
      img.dataset.id = el.id;
      img.dataset.author_id = el.author_id;
      img.dataset.category = el.category;
      img.dataset.size = el.size;
      img.dataset.datetime = el.date_time;
      img.src = el.src;
      img.loading="lazy";
      img.decoding="async";
      //将图片添加到link
      alink.appendChild(img);
      //到图片项容器到图片项容器
      imageItem.appendChild(alink);
      // 将 loading 和图片元素添加到图片项容器
      imageItem.appendChild(loadingElement);
      //将图片项容器添加到图片显示区域
      gallery.appendChild(imageItem);
    });
  }

  // 刷新按钮点击事件
  document
    .getElementById("refreshButton")
    .addEventListener("click", function () {
      showRandomImages();
    });

  // 返回按钮点击事件
  document.getElementById("backButton").addEventListener("click", function () {
    window.location.href = "https://wallpapers-collection.github.io/image-serenity"; // 返回主页面
  });

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
  // 初始加载时显示随机图片
  showRandomImages();
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
    document.getElementById("refreshButton").textContent = data.refresh;
    document.getElementById("backButton").textContent = data.back;
  } catch (e) {
    console.log(e);
  }
}
