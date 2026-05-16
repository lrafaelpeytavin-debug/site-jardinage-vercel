const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const navToggle = document.querySelector("[data-nav-toggle]");
const contactForm = document.querySelector("[data-contact-form]");
const formStatus = document.querySelector("[data-form-status]");
const photoInput = document.querySelector("[data-photo-input]");
const photoList = document.querySelector("[data-photo-list]");
let selectedPhotos = [];

function syncHeader() {
  header.classList.toggle("is-scrolled", window.scrollY > 12);
}

navToggle.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("is-open");
  header.classList.toggle("is-open", isOpen);
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

nav.addEventListener("click", (event) => {
  if (event.target.matches("a")) {
    nav.classList.remove("is-open");
    header.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  }
});

syncHeader();
window.addEventListener("scroll", syncHeader, { passive: true });

function syncPhotoList() {
  if (!photoList) {
    return;
  }

  if (!selectedPhotos.length) {
    photoList.textContent = "Aucune photo ajoutée.";
    return;
  }

  photoList.textContent = selectedPhotos
    .map((file, index) => `${index + 1}. ${file.name}`)
    .join(" • ");
}

if (photoInput) {
  photoInput.addEventListener("change", () => {
    const incomingFiles = Array.from(photoInput.files || []);
    const mergedFiles = [...selectedPhotos];

    incomingFiles.forEach((file) => {
      const alreadySelected = mergedFiles.some((selectedFile) =>
        selectedFile.name === file.name &&
        selectedFile.size === file.size &&
        selectedFile.lastModified === file.lastModified
      );

      if (!alreadySelected && mergedFiles.length < 3) {
        mergedFiles.push(file);
      }
    });

    selectedPhotos = mergedFiles;
    photoInput.value = "";
    syncPhotoList();
  });
}

if (contactForm && formStatus) {
  function readCompressedImage(file) {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith("image/")) {
        reject(new Error("Seules les images sont acceptées."));
        return;
      }

      if (file.size > 12 * 1024 * 1024) {
        reject(new Error("Une image est trop lourde."));
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const image = new Image();
        image.onload = () => {
          const maxSize = 1600;
          const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
          const canvas = document.createElement("canvas");
          canvas.width = Math.round(image.width * scale);
          canvas.height = Math.round(image.height * scale);

          const context = canvas.getContext("2d");
          context.drawImage(image, 0, 0, canvas.width, canvas.height);

          const dataUrl = canvas.toDataURL("image/jpeg", 0.72);
          resolve({
            filename: file.name.replace(/\.[^.]+$/, "") + ".jpg",
            content: dataUrl.split(",")[1],
            content_type: "image/jpeg",
          });
        };
        image.onerror = () => reject(new Error("Une image n’a pas pu être lue."));
        image.src = reader.result;
      };
      reader.onerror = () => reject(new Error("Une image n’a pas pu être lue."));
      reader.readAsDataURL(file);
    });
  }

  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const submitButton = contactForm.querySelector("button[type='submit']");
    const formData = new FormData(contactForm);
    const payload = Object.fromEntries(formData.entries());
    const photoFiles = selectedPhotos;

    submitButton.disabled = true;
    submitButton.textContent = "Envoi en cours...";
    formStatus.className = "form-note";
    formStatus.textContent = "Votre demande est en cours d’envoi.";

    try {
      if (photoFiles.length > 3) {
        throw new Error("Vous pouvez joindre 3 photos maximum.");
      }

      payload.Photos = await Promise.all(photoFiles.map(readCompressedImage));

      const response = await fetch(contactForm.action, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.message || "L’envoi a échoué.");
      }

      contactForm.reset();
      selectedPhotos = [];
      syncPhotoList();
      formStatus.className = "form-note is-success";
      formStatus.textContent = "Merci, votre demande a bien été envoyée. Nous revenons vers vous rapidement.";
    } catch (error) {
      formStatus.className = "form-note is-error";
      formStatus.textContent = error.message || "Impossible d’envoyer la demande pour le moment. Vous pouvez écrire à lucas.benavenuto@lakle.fr.";
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "Envoyer la demande";
    }
  });
}
