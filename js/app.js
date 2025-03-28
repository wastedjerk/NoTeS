document.addEventListener("DOMContentLoaded", () => {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("Registriert!");
      })
      .catch((error) => {
        console.error("Registrierung fehlgeschlagen:", error);
      });
  }

  updateOnlineStatus();

  const dynamicCachingEnabled =
    localStorage.getItem("dynamicCachingEnabled") === "true";
  document.getElementById("cache-toggle").checked = dynamicCachingEnabled;
  toggleDynamicCaching(dynamicCachingEnabled);

  window.addEventListener("online", updateOnlineStatus);
  window.addEventListener("offline", updateOnlineStatus);

  const noteForm = document.getElementById("noteForm");
  const noteInput = document.getElementById("noteInput");
  const notesList = document.getElementById("notesList");

  noteForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (noteInput.value.trim() === "") return;
    addNote(noteInput.value.trim());
    noteInput.value = "";
    displayNotes();
  });

  function addNote(text) {
    const notes = JSON.parse(localStorage.getItem("notes") || "[]");
    notes.push(text);
    localStorage.setItem("notes", JSON.stringify(notes));
    syncNotes();
  }

  function deleteNote(index) {
    const notes = JSON.parse(localStorage.getItem("notes") || "[]");
    notes.splice(index, 1);
    localStorage.setItem("notes", JSON.stringify(notes));
    displayNotes();
    syncNotes();
  }

  function displayNotes() {
    const notes = JSON.parse(localStorage.getItem("notes") || "[]");
    notesList.innerHTML = "";
    notes.forEach((note, index) => {
      const noteElement = document.createElement("div");
      noteElement.textContent = note;
      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "X";
      deleteBtn.addEventListener("click", () => deleteNote(index));
      noteElement.appendChild(deleteBtn);
      notesList.appendChild(noteElement);
      console.log("Note added with delete button:", note);
    });
  }

  function syncNotes() {
    if ("serviceWorker" in navigator && "SyncManager" in window) {
      navigator.serviceWorker.ready
        .then((registration) => {
          registration.sync.register("sync-notes");
        })
        .catch((err) => console.error("Sync fehlgeschlagen", err));
    }
  }

  const cachingEnabled =
    localStorage.getItem("dynamicCachingEnabled") === "true";
  document.getElementById("cache-toggle").checked = cachingEnabled;

  if (!cachingEnabled && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      action: "disableDynamicCaching",
    });
  }

  document.getElementById("loadImages").addEventListener("click", async () => {
    const container = document.getElementById("imagesContainer");
    for (let i = 1; i <= 3; i++) {
      const imageUrl = `/images_cats/${i}.jpg`;
      try {
        const response = await fetch(imageUrl);
        const imageBlob = await response.blob();
        const imageUrlBlob = URL.createObjectURL(imageBlob);
        const imgElement = document.createElement("img");
        imgElement.src = imageUrlBlob;
        imgElement.style.width = "30%"; // Ensures that three images are displayed per row
        imgElement.style.marginBottom = "10px";
        container.appendChild(imgElement);
      } catch (error) {
        console.error("Error loading images:", error);
      }
    }
  });

  displayNotes();
});

function updateOnlineStatus() {
  var status = navigator.onLine ? "Online" : "Offline";
  showStatus(status);
}

function showStatus(status) {
  const statusDiv = document.getElementById("status");
  statusDiv.innerHTML = status;
  statusDiv.className = status.toLowerCase();
}

function loadNewContent() {
  fetch("/images/realCat.png")
    .then((response) => response.blob())
    .then((imageBlob) => {
      const imageObjectURL = URL.createObjectURL(imageBlob);
      document.getElementById(
        "fakeCat"
      ).innerHTML = `<img src="${imageObjectURL}" alt="Real Cat Watching Your Notes">`;
      console.log("Image loaded and displayed.");
    })
    .catch((error) => console.error("Error loading the image:", error));
}

function toggleDynamicCaching(enable) {
  localStorage.setItem("dynamicCachingEnabled", enable);
  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      action: enable ? "enableDynamicCaching" : "disableDynamicCaching",
    });
  }
}
