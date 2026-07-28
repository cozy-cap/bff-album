import ImageKit from "https://esm.sh/imagekit-javascript";

function load_js() {
  let elements = document.querySelectorAll(".main_card");
  elements.forEach(element => {
    let randomSeed = Math.random();
    element.style.backgroundImage = `url('https://i.pinimg.com/1200x/aa/b5/a0/aab5a0470f6c56f2504574cfe246f918.jpg')`;
  });
}

function newFunc() {
  const elements = document.getElementsByClassName("main_card");
  const element1 = document.querySelector('.empty-msg');
  const element2 = document.querySelector('.main_card-add');
  if (elements.length !== 0) {
    element1.style.setProperty('display', 'none');
    element2.style.setProperty('display', 'flex');
  }
  else if (element1 !== null && element2 !== null) {
    element1.style.setProperty('display', 'inline');
    element2.style.setProperty('display', 'none');
  }
}
document.addEventListener('DOMContentLoaded', () => {
  load_js();
  setTheme();
  newFunc();
  const themeBtns = document.querySelectorAll('.header_theme-icon_button1, .header_theme-icon_button2');
  if (themeBtns.length === 2) themeBtns.forEach(btn => btn.addEventListener('click', changeTheme));
  const addBtns = document.querySelectorAll('.adding, .main_card-add');
  if (addBtns.length !== 0) addBtns.forEach(btn => btn.addEventListener('click', addCard));
});
// SetTheme
function setTheme() {
  const theme = getCookie("theme") || "light";
  applyTheme(theme);
}
function changeTheme() {
  const currentTheme = getCookie("theme") || "light";
  const newTheme = currentTheme === "light" ? "dark" : "light";
  applyTheme(newTheme);
  setCookie("theme", newTheme, 400);
}
function applyTheme(theme, first, second) {
  const root = document.querySelector(':root');
  const lightIcons = document.getElementsByClassName("header_theme-icon_button1");
  const darkIcons = document.getElementsByClassName("header_theme-icon_button2");
  if (theme === 'light') {
    root.style.setProperty('--background-main', '#f2f2f2');
    root.style.setProperty('--background-second', '#e4e4e4');
    root.style.setProperty('--accent-color-main', '#333');
    if (lightIcons[0]) lightIcons[0].style.display = 'none';
    if (darkIcons[0]) darkIcons[0].style.display = 'block';
  } else {
    root.style.setProperty('--background-main', '#121212');
    root.style.setProperty('--background-second', '#252525');
    root.style.setProperty('--accent-color-main', '#e8e8c9');
    if (lightIcons[0]) lightIcons[0].style.display = 'block';
    if (darkIcons[0]) darkIcons[0].style.display = 'none';
  }
}
// Set Cookie
function setCookie(name, value, days) {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (encodeURIComponent(value || "") + expires + "; path=/");
}
// Get Cookie
function getCookie(name) {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
  }
  return null;
}
function openCard(element) {
  const computedStyle = window.getComputedStyle(element);
  const imgUrlStr = computedStyle.backgroundImage;
  const cleanUrl = imgUrlStr.replace(/^url\((['"]?)(.*?)\1\)/, '$2');
  const container = document.createElement('div');
  const image = document.createElement('img');
  const controls = document.createElement('div');
  const trash = document.createElement('i');
  controls.className = 'preview_controls';
  trash.className = 'bi bi-trash';
  trash.onclick = () => confirmDel();
  container.className = 'preview_container';
  container.onclick = (e) => {
    if (e.target === container) {
      container.remove();
    }
  };
  image.className = 'preview_image';
  image.src = cleanUrl;
  container.append(image, controls);
  document.body.append(container);
  controls.append(trash);
}
function confirmDel() {
  const wrap = document.createElement('div');
  const container = document.createElement('div');
  const text = document.createElement('span');
  const buttons = document.createElement('div');
  const cancel = document.createElement('button');
  const confirm = document.createElement('button');
  wrap.className = 'confirm_wrap';
  wrap.onclick = (e) => {
    if (e.target === wrap) {
      wrap.remove();
    }
  };
  container.className = 'confirm_container';
  text.className = 'confirm_container_text';
  text.textContent = 'Do you really want to delete this image?';
  buttons.className = 'confirm_container_buttons';
  cancel.className = 'confirm_container_buttons_cancel';
  confirm.className = 'confirm_container_buttons_confim,';
  document.body.append(wrap);
  wrap.append(container);
  container.append(text, buttons);
  buttons.append(cancel, confirm);
}
function addCard() {
  const input = document.querySelector('#fileID');
  const parent = document.querySelector('.main');
  const card = document.createElement('div');
  input.click;
  input.addEventListener('change', function (e) {
    for (let i = 0; i < input.files.length; i++) {
      var fileName = e.target.files[i].name;
      card.className = 'main_card_' + fileName;
      imageUpload(input.files[i], fileName);
      card.onclick = (e) => {
        if (e.target === card) {
          openCard(card);
        }
      };
      parent.append(card);
    }
  })
  /*card.className = 'main_card' + name;
  card.onclick = (e) => {
    if (e.target === card) {
      openCard(card);
    }
  };
  applyImage(card);
  parent.append(card);*/
}
function applyImage(card) {
  //TODO: make read image from imagekit
  card.style.backgroundImage = `url('https://i.pinimg.com/1200x/aa/b5/a0/aab5a0470f6c56f2504574cfe246f918.jpg')`;
}
imageUpload(file, name) {
  var imagekit = new ImageKit({
    publicKey: "public_+bidkA27fJVGrKKq8xYge8xiSOU=",
    urlEndpoint: "https://ik.imagekit.io/cozycap",
  });
  imagekit.upload({
    file: file,
    fileName: name,
    expire: 1616161616,
  }).then(result => {
    console.log(result);
  }).catch(error => {
    console.error(error);
  });
}
