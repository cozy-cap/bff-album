import ImageKit from "https://esm.sh/imagekit-javascript";

// Initialize ImageKit (Replace with your actual public key and endpoint)
const imagekit = new ImageKit({
    publicKey: "public_+bidkA27fJVGrKKq8xYge8xiSOU=",
    urlEndpoint: "https://ik.imagekit.io/cozycap"
});

// Helper: Bind the file inputs to your existing plus buttons
function setupUploadTriggers() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.multiple = true;
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);

    const triggerUpload = () => fileInput.click();

    // Attach to your existing plus buttons
    document.querySelector('.main_card-add').onclick = triggerUpload;
    document.querySelector('.adding').onclick = triggerUpload;

    // Handle file selection
    fileInput.addEventListener('change', async (e) => {
        const files = e.target.files;
        if (!files.length) return;

        for (let i = 0; i < files.length; i++) {
            await uploadImage(files[i]);
        }
        fileInput.value = ''; // Reset input
    });
}

// Upload function
async function uploadImage(file) {
    try {
        // You MUST create this endpoint on your backend to return auth parameters safely
        const authResponse = await fetch('/api/imagekit-auth'); 
        const authData = await authResponse.json();

        const result = await imagekit.upload({
            file: file,
            fileName: file.name,
            tags: ["bff-album"], // Helpful for organizing
            signature: authData.signature,
            token: authData.token,
            expire: authData.expire
        });

        // Create the card immediately after successful upload
        createCard(result.url, result.fileId);
        newFunc(); // Update empty state UI
    } catch (error) {
        console.error("Upload failed:", error);
        alert("Failed to upload image.");
    }
}

// Reading: Fetch existing images on load
async function load_js() {
    setupUploadTriggers();

    try {
        // You MUST create this endpoint on your backend to use the ImageKit SDK to list files
        const response = await fetch('/api/get-images'); 
        const images = await response.json();

        images.forEach(img => {
            createCard(img.url, img.fileId);
        });
        newFunc();
    } catch (error) {
        console.log("Waiting for backend connection to load images...");
        // Fallback for testing UI without backend
        // createCard('https://i.pinimg.com/1200x/aa/b5/a0/aab5a0470f6c56f2504574cfe246f918.jpg', 'test-id');
    }
}

// Helper: Create a single image card
function createCard(url, fileId) {
    const parent = document.querySelector('.main');
    
    const card = document.createElement('div');
    card.className = 'main_card';
    card.style.backgroundImage = `url('${url}')`;
    card.dataset.fileId = fileId; // Store the ImageKit file ID for deletion

    // Create the hover trash icon
    const hoverTrash = document.createElement('i');
    hoverTrash.className = 'bi bi-trash card-hover-trash';
    
    // Stop click from opening the card when clicking the trash icon
    hoverTrash.onclick = (e) => {
        e.stopPropagation(); 
        confirmDel(fileId, card, null);
    };

    card.onclick = () => openCard(card);
    
    card.appendChild(hoverTrash);
    
    // Insert before the "Add" button
    const addButton = document.querySelector('.main_card-add');
    parent.insertBefore(card, addButton);
}

function openCard(element) {
    const computedStyle = window.getComputedStyle(element);
    const imgUrlStr = computedStyle.backgroundImage;
    const cleanUrl = imgUrlStr.replace(/^url\((['"]?)(.*?)\1\)/, '$2');
    const fileId = element.dataset.fileId; // Get the ID

    const container = document.createElement('div');
    const image = document.createElement('img');
    const controls = document.createElement('div');
    const trash = document.createElement('i');

    controls.className = 'preview_controls';
    trash.className = 'bi bi-trash';
    
    // Pass everything to confirmDel so we can remove the preview and the main card if confirmed
    trash.onclick = () => confirmDel(fileId, element, container);
    
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

// Delete Logic
function confirmDel(fileId, mainCardElement, previewElement) {
    const wrap = document.createElement('div');
    const container = document.createElement('div');
    const text = document.createElement('span');
    const buttons = document.createElement('div');
    const cancel = document.createElement('button');
    const confirm = document.createElement('button');

    wrap.className = 'confirm_wrap';
    wrap.onclick = (e) => {
        if (e.target === wrap) wrap.remove();
    };

    container.className = 'confirm_container';
    text.className = 'confirm_container_text';
    text.textContent = 'Do you really want to delete this image?';
    
    buttons.className = 'confirm_container_buttons';
    cancel.className = 'confirm_container_buttons_cancel';
    cancel.textContent = 'Cancel';
    
    confirm.className = 'confirm_container_buttons_confirm'; // Fixed typo here
    confirm.textContent = 'Delete';

    // Finish the Cancel action
    cancel.onclick = () => wrap.remove();

    // Finish the Delete action
    confirm.onclick = async () => {
        // Change text to show loading state
        confirm.textContent = 'Deleting...';
        confirm.disabled = true;

        try {
            // You MUST create this endpoint on your backend to handle the actual ImageKit delete
            await fetch(`/api/delete-image/${fileId}`, { method: 'DELETE' });

            // Remove from the DOM
            if (mainCardElement) mainCardElement.remove();
            if (previewElement) previewElement.remove();
            
            // Remove the confirmation popup
            wrap.remove();
            
            // Update the empty message if needed
            newFunc(); 
        } catch (error) {
            console.error("Delete failed", error);
            alert("Failed to delete the image.");
            confirm.textContent = 'Delete';
            confirm.disabled = false;
        }
    };

    document.body.append(wrap);
    wrap.append(container);
    container.append(text, buttons);
    buttons.append(cancel, confirm);
}

function newFunc() {
    const elements = document.getElementsByClassName("main_card");
    const element1 = document.querySelector('.empty-msg');
    const element2 = document.querySelector('.main_card-add');
    // Using > 0 because if we dynamically remove cards, it needs to check correctly
    if (elements.length > 0) { 
        element1.style.setProperty('display', 'none');
        element2.style.setProperty('display', 'flex');
    } else {
        element1.style.setProperty('display', 'inline');
        element2.style.setProperty('display', 'none');
    }
}

// UI State setup
document.addEventListener('DOMContentLoaded', load_js);
document.addEventListener('DOMContentLoaded', setTheme);

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

function applyTheme(theme) {
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

function setCookie(name, value, days) {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (encodeURIComponent(value || "") + expires + "; path=/");
}

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