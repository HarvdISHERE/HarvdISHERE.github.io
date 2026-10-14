(() => {
  "use strict";

  const filterButtons = [...document.querySelectorAll(".filter-button")];
  const projectCards = [...document.querySelectorAll(".work-card")];
  const emptyMessage = document.querySelector(".filter-empty");

  // Filter projects without removing keyboard focus or changing document order.
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;
      filterButtons.forEach((item) => {
        const selected = item === button;
        item.classList.toggle("is-active", selected);
        item.setAttribute("aria-pressed", String(selected));
      });

      let visibleCount = 0;
      projectCards.forEach((card) => {
        const visible = filter === "all" || card.dataset.category === filter;
        card.hidden = !visible;
        if (visible) visibleCount += 1;
      });
      if (emptyMessage) emptyMessage.hidden = visibleCount > 0;
    });
  });

  // Mobile navigation: close after selection, and support Escape.
  const menuToggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector("#primary-nav");
  if (menuToggle && nav) {
    const setMenuOpen = (open) => {
      menuToggle.setAttribute("aria-expanded", String(open));
      menuToggle.setAttribute("aria-label", open ? "关闭导航" : "打开导航");
      nav.classList.toggle("is-open", open);
    };

    menuToggle.addEventListener("click", () => {
      setMenuOpen(menuToggle.getAttribute("aria-expanded") !== "true");
    });
    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setMenuOpen(false));
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuToggle.focus();
      }
    });
    document.addEventListener("click", (event) => {
      if (menuToggle.getAttribute("aria-expanded") === "true" &&
          !nav.contains(event.target) && !menuToggle.contains(event.target)) {
        setMenuOpen(false);
      }
    });
    window.addEventListener("resize", () => {
      if (window.matchMedia("(min-width: 641px)").matches) setMenuOpen(false);
    });
  }

  // Keep the page usable for people who prefer reduced motion.
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (reducedMotion.matches) document.documentElement.classList.add("reduce-motion");
})();