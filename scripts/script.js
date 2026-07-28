import ImageKit from "https://esm.sh/imagekit-javascript";

// Helper function to compress images before uploading
function compressImage(file, maxWidth = 1920, maxHeight = 1920, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      
      img.onload = () => {
        // Calculate new dimensions while keeping the aspect ratio
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        // Draw the resized image onto a hidden HTML canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convert the canvas back into a file we can upload
        canvas.toBlob((blob) => {
          if (blob) {
            // Re-create the file object with the new compressed data
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            resolve(compressedFile);
          } else {
            reject(new Error("Canvas compression failed"));
          }
        }, 'image/jpeg', quality);
      };
      
      img.onerror = (error) => reject(error);
    };
    
    reader.onerror = (error) => reject(error);
  });
}

function setupUploadTriggers() {
  const fileInput = document.querySelector('#fileID');
  const addBtns = document.querySelectorAll('.adding, .main_card-add');
  // 1. Bind the plus buttons to open the file selector
  if (addBtns.length !== 0) {
    addBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        if (fileInput) fileInput.click();
      });
    });
  }
  // 2. Handle the file selection and trigger the upload
  if (fileInput) {
    fileInput.addEventListener('change', async (e) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;
      // Loop through all selected files and upload them
      for (let i = 0; i < files.length; i++) {
        try {
          // 1. Compress the image (max 1920x1920 pixels, 80% JPEG quality)
          if (files[i].type !== 'image/gif') {
            console.log(`Compressing ${files[i].name}...`);
            const compressedFile = await compressImage(files[i], 1920, 1920, 0.8);
          }
          // 2. Upload the new, compressed version instead of the massive original
          await uploadImage(compressedFile);
        } catch (error) {
          console.error("Failed to compress or upload:", error);
          alert(`Failed to process ${files[i].name}`);
        }
      }     
      // Reset the input value so you can select the same file again later if needed
      fileInput.value = '';
    });
  }
}
// Helper function to build the HTML card dynamically
function createCard(url, fileId) {
    const parent = document.querySelector('.main');
    const addButton = document.querySelector('.main_card-add');
    const card = document.createElement('div');
    card.className = 'main_card';
    card.style.backgroundImage = `url('${url}')`;
    card.dataset.fileId = fileId; // Store the ID for the delete function later!
    // Click to open modal preview
    card.onclick = (event) => {
        if (event.target === card) {
            openCard(card);
        }
    };   
    // Insert the new card into the grid right before the "Add" button
    if (parent && addButton) {
        parent.insertBefore(card, addButton);
    }
}

async function load_js() {
    // Run your existing function to bind the upload buttons
    setupUploadTriggers(); 
    try {
        // 1. Ask your Vercel backend for the list of images
        const response = await fetch('https://bff-album.vercel.app/api/get-images');
        const images = await response.json();
        const parent = document.querySelector('.main');
        const addButton = document.querySelector('.main_card-add');
        // 2. Loop through every image returned by ImageKit
        images.forEach(img => {
            const card = document.createElement('div');
            card.className = 'main_card';
            // Set the background image to the URL from ImageKit
            card.style.backgroundImage = `url('${img.url}')`;
            // IMPORTANT: Save the fileId inside the HTML for when we build the delete function!
            card.dataset.fileId = img.fileId; 
            // Attach your existing openCard click event
            card.onclick = () => openCard(card);
            // Insert the new card into the grid right before the "Add" button
            parent.insertBefore(card, addButton);
        });
        // Update the "Storage is empty" text
        newFunc(); 
    } catch (error) {
        console.error("Failed to load images from backend:", error);
    }
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
  setTheme();
  
  // Bind the theme buttons
  const themeBtns = document.querySelectorAll('.header_theme-icon_button1, .header_theme-icon_button2');
  if (themeBtns.length === 2) themeBtns.forEach(btn => btn.addEventListener('click', changeTheme));
  
  // Load the images from Vercel and bind the upload buttons
  load_js(); 
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
  const fileId = element.dataset.fileId; // Get the ID we stored earlier
  // Pass the ID, the main grid card, and the preview overlay to the confirm function
  trash.onclick = () => confirmDel(fileId, element, container);
  container.className = 'preview_container';
  container.onclick = (e) => {
    if (e.target === container) {
      container.remove();
    }
  };
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' || e.key === 'Esc')
  });
  image.className = 'preview_image';
  image.src = cleanUrl;
  // --- START PINCH-TO-ZOOM LOGIC ---
  let currentScale = 1;
  let initialPinchDistance = null;
  let initialX = null;
  let initialY = null;
  let lastX = 0;
  let lastY = 0;

  image.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
      e.preventDefault(); // Stop any leftover browser behavior
      // Calculate the initial distance between the two fingers
      initialPinchDistance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
    } else if (e.touches.length === 1) {
      // 1 Finger: Setup Panning
      initialX = e.touches[0].clientX;
      initialY = e.touches[0].clientY;
    }
  });

  image.addEventListener('touchmove', (e) => {
    if (e.touches.length === 2 && initialPinchDistance !== null) {
      e.preventDefault();
      // Calculate how far the fingers have moved apart/together
      const currentDistance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
            
      const scale = currentDistance / initialPinchDistance;
      let newScale = currentScale * scale;
            
      // Limit the zoom: don't let it shrink smaller than 1x, or grow larger than 4x
      newScale = Math.min(Math.max(1, newScale), 4);
            
            // Apply the visual scale
      image.style.transform = `scale(${newScale})`;
    } else if (e.touches.length === 1 && initialX !== null && initialY !== null) {
      // 1 Finger: Handle Pan (Only if zoomed in)
      const transform = image.style.transform;
      let activeScale = 1;
        
      // Read the current scale from the CSS
      if (transform) {
        const match = transform.match(/scale\(([^)]+)\)/);
        if (match) activeScale = parseFloat(match[1]);
      }
          
      if (activeScale > 1) {
        // Calculate how far the finger moved
        const deltaX = e.touches[0].clientX - initialX;
        const deltaY = e.touches[0].clientY - initialY;
              
        let newX = lastX + deltaX;
        let newY = lastY + deltaY;
              
        // Calculate screen limits so the image doesn't fly off the screen
        const maxX = Math.max(0, (image.clientWidth * activeScale - window.innerWidth) / 2);
        const maxY = Math.max(0, (image.clientHeight * activeScale - window.innerHeight) / 2);
              
        // Clamp the movement to the limits
        newX = Math.min(Math.max(newX, -maxX), maxX);
        newY = Math.min(Math.max(newY, -maxY), maxY);
            
        // Apply the movement
        image.style.transform = `translate(${newX}px, ${newY}px) scale(${activeScale})`;
      }
    }
  });

  image.addEventListener('touchend', (e) => {
    const transform = image.style.transform;
    if (transform) {
      const scaleMatch = transform.match(/scale\(([^)]+)\)/);
      if (scaleMatch) currentScale = parseFloat(scaleMatch[1]);
          
        const translateMatch = transform.match(/translate\(([^p]+)px,\s*([^p]+)px\)/);
        if (translateMatch) {
          lastX = parseFloat(translateMatch[1]);
          lastY = parseFloat(translateMatch[2]);
        }
      }
      
      // Reset 1-finger tracking
      if (e.touches.length === 0) {
        initialX = null;
        initialY = null;
      }
      
      // Reset pinch distance if there are less than 2 fingers
      if (e.touches.length < 2) {
        initialPinchDistance = null;
      }
      
      // Snap the image back to the exact center if the user zooms back out to 1x
      if (currentScale <= 1) {
        lastX = 0;
        lastY = 0;
        image.style.transform = `translate(0px, 0px) scale(1)`;
      }
  });    // --- END PINCH-TO-ZOOM LOGIC ---
  container.append(image, controls);
  document.body.append(container);
  controls.append(trash);
}
function confirmDel(fileId, mainCardElement, previewElement) {
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
  cancel.textContent = 'Cancel'; // Added text
  
  confirm.className = 'confirm_container_buttons_confirm'; // Fixed typo here (was confim,)
  confirm.textContent = 'Delete'; // Added text
  
  // 1. Logic for Cancel Button
  cancel.onclick = () => wrap.remove();
  
  // 2. Logic for Confirm Button
  confirm.onclick = async () => {
    confirm.textContent = 'Deleting...';
    confirm.disabled = true;
    
    try {
      // Ask Vercel to delete the file from ImageKit
      const response = await fetch(`https://bff-album.vercel.app/api/delete-image?fileId=${fileId}`, { 
        method: 'DELETE' 
      });
      
      if (!response.ok) throw new Error('Failed to delete on server');

      // If successful, remove the HTML elements from the screen
      if (mainCardElement) mainCardElement.remove();
      if (previewElement) previewElement.remove();
      wrap.remove();
      
      // Check if the grid is now empty
      newFunc(); 
    } catch (error) {
      console.error("Delete failed:", error);
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
function addCard() {
  const input = document.querySelector('#fileID');
  if (input) {
    input.click(); // Simply open the file dialog
  }
}
function applyImage(card) {
  //TODO: make read image from imagekit
  card.style.backgroundImage = `url('https://i.pinimg.com/1200x/aa/b5/a0/aab5a0470f6c56f2504574cfe246f918.jpg')`;
}
async function uploadImage(file) {
  const imagekit = new ImageKit({
    publicKey: "public_+bidkA27fJVGrKKq8xYge8xiSOU=",
    urlEndpoint: "https://ik.imagekit.io/cozycap"
  });
  try {
      // 1. Ask your Vercel backend for the secure tokens
      // REPLACE THIS with the Production URL Vercel gave you in Step 3!
      const authResponse = await fetch('https://bff-album.vercel.app/api/auth'); 
      const authData = await authResponse.json();

      // 2. Upload to ImageKit using those secure parameters
      const result = await imagekit.upload({
          file: file,
          fileName: file.name,
          tags: ["bff-album"],
          signature: authData.signature,
          token: authData.token,
          expire: authData.expire
      });

      createCard(result.url, result.fileId);
      newFunc(); 
  } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload image.");
  }
}
