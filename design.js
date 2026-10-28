(() => {
  "use strict";
  // Manual navigation keeps the photographic cover still until the visitor acts.
  const heroSlides = [
    {
      image: "img/photos/spacious-living.jpg",
      alt: "Sala amplia fotografiada con luz natural, sofás y ventanas grandes",
      heading: "Todo lo que sueñas.",
      accent: "Un lugar para vivirlo.",
      description:
        "Descubre casas y residencias en Lima. El siguiente capítulo de tu vida empieza aquí.",
    },
    {
      image: "img/photos/bright-apartment.jpg",
      alt: "Fotografía de una sala con sofá, ventanas y mobiliario contemporáneo",
      heading: "Más espacio para ti.",
      accent: "Más momentos juntos.",
      description:
        "Ambientes para compartir y disfrutar a tu manera. Explora el espacio que va contigo.",
    },
    {
      image: "img/photos/modern-house.jpg",
      alt: "Fotografía de la fachada de una casa contemporánea con jardín",
      heading: "Imagina tu nueva casa.",
      accent: "Empieza a encontrarla.",
      description:
        "Compara ubicaciones y características. Tu próxima historia puede empezar en un nuevo hogar.",
    },
  ];
  const heroImage = document.querySelector("#hero-image");
  const heroTitle = document.querySelector("#hero-title");
  const dots = [...document.querySelectorAll("[data-slide]")];
  let activeSlide = 0;
  function showSlide(index) {
    activeSlide = (index + heroSlides.length) % heroSlides.length;
    const slide = heroSlides[activeSlide];
    heroImage.src = slide.image;
    heroImage.alt = slide.alt;
    const accent = document.createElement("span");
    accent.textContent = slide.accent;
    heroTitle.replaceChildren(
      document.createTextNode(slide.heading),
      document.createElement("br"),
      accent,
    );
    document.querySelector("#hero-description").textContent = slide.description;
    dots.forEach((dot, i) =>
      dot.setAttribute("aria-pressed", String(i === activeSlide)),
    );
    document.querySelector("#hero-slide-status").textContent =
      `Ambiente ${activeSlide + 1} de ${heroSlides.length}. ${slide.heading} ${slide.accent}`;
  }
  document
    .querySelector("#hero-prev")
    .addEventListener("click", () => showSlide(activeSlide - 1));
  document
    .querySelector("#hero-next")
    .addEventListener("click", () => showSlide(activeSlide + 1));
  dots.forEach((dot) =>
    dot.addEventListener("click", () => showSlide(Number(dot.dataset.slide))),
  );
  const form = document.querySelector("#property-search-form");
  const grid = document.querySelector("#property-grid");
  const cards = [...grid.children];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const scrollTo = (element) =>
    element?.scrollIntoView({
      behavior: reducedMotion.matches ? "instant" : "smooth",
      block: "start",
    });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    scrollTo(document.querySelector("#propiedades"));
  });
  document.querySelectorAll("[data-zone]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelector("#property-search").value = "";
      document.querySelector("#bedroom-filter").value = "all";
      const district = document.querySelector("#district-filter");
      district.value = button.dataset.zone;
      district.dispatchEvent(new Event("input", { bubbles: true }));
      scrollTo(document.querySelector("#propiedades"));
    });
  });
  document
    .querySelector("[data-clear-filters]")
    .addEventListener("click", () => {
      document.querySelector("#clear-filters").click();
      scrollTo(document.querySelector("#propiedades"));
    });
  document
    .querySelector("#property-sort")
    .addEventListener("change", (event) => {
      const value = event.target.value;
      const price = (card) =>
        Number(
          card.querySelector(".precio").textContent.replace(/[^0-9.]/g, ""),
        );
      const area = (card) =>
        Number(
          card
            .querySelector(".property-meta li:last-child")
            .textContent.replace(/[^0-9]/g, ""),
        );
      const sorted = [...cards];
      if (value === "price-asc") sorted.sort((a, b) => price(a) - price(b));
      if (value === "price-desc") sorted.sort((a, b) => price(b) - price(a));
      if (value === "area-desc") sorted.sort((a, b) => area(b) - area(a));
      grid.append(...sorted);
    });

  // Browsing also works when private mode or browser settings restrict storage.
  let saved = [];
  try {
    saved = JSON.parse(localStorage.getItem("premiumhome-favorites") || "[]");
  } catch {
    /* Session-only favorites remain available. */
  }
  if (!Array.isArray(saved)) saved = [];
  cards.forEach((card) => {
    const button = card.querySelector(".favorite-button");
    const name = card.querySelector("h3").textContent.trim();
    const key = card.querySelector("[data-property]").dataset.property;
    const updateLabel = () =>
      button.setAttribute(
        "aria-label",
        `${button.classList.contains("active") ? "Quitar de guardados:" : "Guardar"} ${name}`,
      );
    if (saved.includes(key)) {
      button.classList.add("active");
      button.textContent = "♥";
      button.setAttribute("aria-pressed", "true");
    }
    updateLabel();
    button.addEventListener("click", () => {
      updateLabel();
      const selected = cards
        .filter((item) =>
          item.querySelector(".favorite-button").classList.contains("active"),
        )
        .map((item) => item.querySelector("[data-property]").dataset.property);
      try {
        localStorage.setItem("premiumhome-favorites", JSON.stringify(selected));
      } catch {
        /* Favorites still work for this session. */
      }
    });
  });
  const menu = document.querySelector("#nav-links");
  const toggle = document.querySelector("#menu-toggle");
  toggle.addEventListener("click", () =>
    toggle.setAttribute(
      "aria-label",
      menu.classList.contains("open") ? "Cerrar menú" : "Abrir menú",
    ),
  );
  const closeMenu = () => {
    menu.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Abrir menú");
  };
  menu.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMenu();
  });
  // Keep the form reachable after choosing a visit from the floating assistant.
  const focusContact = () => {
    document.querySelector("#chatbot-close").click();
    document.querySelector("#name").focus({ preventScroll: true });
  };
  document
    .querySelector("#dialog-contact")
    .addEventListener("click", focusContact);
  document
    .querySelector("#chatbot-messages")
    .addEventListener("click", (event) => {
      const action =
        event.target.closest("[data-chat-action]")?.dataset.chatAction;
      if (action === "visit-property" || action === "context-visit") {
        queueMicrotask(() => {
          if (document.querySelector("#property-interest").value)
            focusContact();
        });
      }
    });
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (menu.classList.contains("open")) {
      closeMenu();
      toggle.focus();
    }
    const chat = document.querySelector("#chatbot-box");
    if (!chat.hidden && !document.querySelector("#property-dialog").open) {
      document.querySelector("#chatbot-close").click();
      document.querySelector("#chatbot-toggle").focus();
    }
  });
})();
