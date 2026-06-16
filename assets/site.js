(function () {
  const CONTACT = window.POYATOS_CONTACT || {};
  const fallbackContact = "/contacto/#solicitar";

  function contactHref(action) {
    if (action === "call" && CONTACT.phone) {
      return `tel:${String(CONTACT.phone).replace(/[^\d+]/g, "")}`;
    }

    if (action === "whatsapp" && CONTACT.whatsapp) {
      const phone = String(CONTACT.whatsapp).replace(/[^\d]/g, "");
      const text = encodeURIComponent("Hola, quiero solicitar un presupuesto para un trabajo de pintura o reforma.");
      return `https://wa.me/${phone}?text=${text}`;
    }

    if (action === "email" && CONTACT.email) {
      return `mailto:${CONTACT.email}`;
    }

    return fallbackContact;
  }

  function initContactLinks() {
    document.querySelectorAll("[data-action]").forEach((link) => {
      link.setAttribute("href", contactHref(link.dataset.action));
    });
  }

  function initMobileMenu() {
    const button = document.querySelector("[data-mobile-menu-toggle]");
    const menu = document.getElementById("mobile-menu");

    if (!button || !menu) {
      return;
    }

    function setOpen(isOpen) {
      menu.hidden = !isOpen;
      button.setAttribute("aria-expanded", String(isOpen));
      const icon = button.querySelector(".material-symbols-outlined");
      if (icon) {
        icon.textContent = isOpen ? "close" : "menu";
      }
    }

    button.addEventListener("click", () => {
      setOpen(menu.hidden);
    });

    menu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setOpen(false));
    });

    setOpen(false);
  }

  function initWorkFilters() {
    const buttons = Array.from(document.querySelectorAll("[data-filter]"));
    const cards = Array.from(document.querySelectorAll("[data-category]"));
    const empty = document.querySelector("[data-filter-empty]");

    if (!buttons.length || !cards.length) {
      return;
    }

    const active = ["bg-primary", "text-on-primary", "border-primary"];
    const inactive = ["bg-surface-container-low", "text-on-surface", "border-outline-variant"];

    function setFilter(filter, updateUrl) {
      let visibleCount = 0;

      cards.forEach((card) => {
        const categories = (card.dataset.category || "").split(/\s+/);
        const visible = filter === "todos" || categories.includes(filter);
        card.hidden = !visible;
        if (visible) {
          visibleCount += 1;
        }
      });

      buttons.forEach((button) => {
        const selected = button.dataset.filter === filter;
        button.setAttribute("aria-pressed", String(selected));
        button.classList.toggle("hover:bg-surface-container", !selected);
        active.forEach((className) => button.classList.toggle(className, selected));
        inactive.forEach((className) => button.classList.toggle(className, !selected));
      });

      if (empty) {
        empty.hidden = visibleCount > 0;
      }

      if (updateUrl) {
        const url = new URL(window.location.href);
        if (filter === "todos") {
          url.searchParams.delete("categoria");
        } else {
          url.searchParams.set("categoria", filter);
        }
        window.history.replaceState({}, "", url);
      }
    }

    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        setFilter(button.dataset.filter, true);
      });
    });

    const initial = new URL(window.location.href).searchParams.get("categoria") || "todos";
    const valid = buttons.some((button) => button.dataset.filter === initial) ? initial : "todos";
    setFilter(valid, false);
  }

  function initContactForm() {
    const form = document.querySelector("[data-contact-form]");
    const result = document.querySelector("[data-contact-result]");
    const messageBox = document.querySelector("[data-contact-message]");
    const copyButton = document.querySelector("[data-copy-contact]");
    const mailLink = document.querySelector("[data-mail-contact]");

    if (!form || !result || !messageBox) {
      return;
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const lines = [
        "Solicitud de presupuesto - Poyatos Martinez Pintores",
        "",
        `Nombre: ${data.get("nombre") || ""}`,
        `Telefono: ${data.get("telefono") || ""}`,
        `Email: ${data.get("email") || ""}`,
        `Servicio: ${data.get("servicio") || ""}`,
        "",
        "Mensaje:",
        data.get("mensaje") || "",
      ];
      const message = lines.join("\n");

      messageBox.value = message;
      result.hidden = false;

      if (mailLink) {
        const email = CONTACT.email || "";
        mailLink.href = `mailto:${email}?subject=${encodeURIComponent("Solicitud de presupuesto")}&body=${encodeURIComponent(message)}`;
      }

      result.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });

    if (copyButton) {
      copyButton.addEventListener("click", async () => {
        messageBox.select();
        try {
          await navigator.clipboard.writeText(messageBox.value);
          copyButton.textContent = "Solicitud copiada";
        } catch (error) {
          document.execCommand("copy");
          copyButton.textContent = "Solicitud copiada";
        }
      });
    }
  }

  function initYear() {
    document.querySelectorAll("[data-current-year]").forEach((node) => {
      node.textContent = String(new Date().getFullYear());
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initContactLinks();
    initMobileMenu();
    initWorkFilters();
    initContactForm();
    initYear();
  });
})();
