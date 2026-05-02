const data = window.portfolioData;

const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => Array.from(parent.querySelectorAll(selector));

function imageOrFallback(src, alt, fallback) {
  if (!src) return fallback;
  return `<img src="${src}" alt="${alt}" loading="lazy" />`;
}

function renderData() {
  const availability = data.available ? "Available" : "Unavailable";
  $("#header-status").textContent = availability;
  $("#profile-status").textContent = availability;
  document.body.classList.toggle("is-unavailable", !data.available);
  $(".brand-mark").innerHTML = imageOrFallback(data.brand.logo, "Pdv logo", "P");
  $(".avatar-core").innerHTML = imageOrFallback(data.brand.heroImage, "Pdv brand image", "Pdv");
  // Render skill-folder with hover preview of tools and an expandable vertical list on click
  $("#code-gallery").innerHTML = `
    <button class="skill-folder" type="button" aria-expanded="false">
      <span class="folder-back"></span>
      <span class="folder-paper paper-one"></span>
      <span class="folder-paper paper-two"></span>
      <span class="folder-front">
        <span class="folder-tab"></span>
          <strong>Workflow Tools</strong>
          <small>Click to list</small>
      </span>
    </button>
    <div class="code-cards">
      ${data.tools
        .map(
          (tool) => `
            <article class="code-card glass-panel tool-card">
              <div class="code-card-top">
                <span>${tool.name}</span>
              </div>
              <div class="code-visual" aria-hidden="true">
                ${tool.icon ? `<img src="${tool.icon}" alt="${tool.name}" loading="lazy" />` : "<span></span>"}
              </div>
              <strong>${tool.name}</strong>
              <small>Tool in workflow</small>
            </article>
          `
        )
        .join("")}
    </div>
  `;

  $("#tool-grid").innerHTML = data.tools
    .map(
      (tool) => `
        <span class="tool-chip">
          <span class="tool-icon" aria-hidden="true">${imageOrFallback(tool.icon, "", tool.name.slice(0, 1))}</span>
          <span>${tool.name}</span>
        </span>
      `
    )
    .join("");

  $("#project-grid").innerHTML = `
    <div class="project-stack" aria-label="Project stack">
      ${data.projects
        .map(
          (project, index) => `
            <button class="project-stack-card glass-panel" type="button" data-project-toggle style="--stack-index: ${index}">
              <div class="project-art" aria-hidden="true">
                ${
                  project.image
                    ? `<img src="${project.image}" alt="" loading="lazy" />`
                    : "<span></span><span></span><span></span>"
                }
              </div>
              <div class="project-stack-copy">
                <span>${project.status}</span>
                <strong>${project.title}</strong>
              </div>
            </button>
          `
        )
        .join("")}
    </div>
    <div class="project-list" aria-hidden="true">
      <button class="btn btn-special project-collapse" type="button" data-project-toggle>Collapse Projects</button>
      ${data.projects
        .map(
          (project) => `
            <article class="project-card glass-panel">
              <div class="project-art" aria-hidden="true">
                ${
                  project.image
                    ? `<img src="${project.image}" alt="" loading="lazy" />`
                    : "<span></span><span></span><span></span>"
                }
              </div>
              <div class="project-card-body">
                <span class="status-pill">${project.status}</span>
                <h3>${project.title}</h3>
                <p>${project.description}</p>
                <a class="btn btn-special project-action" href="${project.link}" target="_blank">View Game</a>
              </div>
            </article>
          `
        )
        .join("")}
    </div>
  `;

  $("#showcase-track").innerHTML = data.showcases
    .map(
      (item) => `
        <a class="showcase-link glass-panel" href="${item.url}" target="_blank" rel="noreferrer">
          <span class="showcase-art" aria-hidden="true">${imageOrFallback(item.image, "", "<span></span>")}</span>
          <span class="showcase-copy">
            <strong>${item.title}</strong>
            <small>${item.platform} - ${item.description}</small>
          </span>
        </a>
      `
    )
    .join("");

  const reviewItems = [...data.reviews, ...data.reviews];
  $("#reviews-track").innerHTML = reviewItems
    .map(
      (review) => `
        <article class="review-card glass-panel">
          <div class="review-head">
            <span class="review-avatar">${imageOrFallback(review.avatarImage, `${review.name} avatar`, review.avatar)}</span>
            <div>
              <strong>${review.name}</strong>
              <span class="review-stars" aria-label="${review.rating} out of 5 stars">
                ${Array.from({ length: 5 }, (_, index) => `<i>${index < review.rating ? "&#9733;" : "&#9734;"}</i>`).join("")}
              </span>
            </div>
          </div>
          <p>${review.description}</p>
        </article>
      `
    )
    .join("");

  renderPricePanel(0);

  $("#contact-grid").innerHTML = data.contacts
    .map(
      (contact, index) => `
        <a class="contact-button" href="${contact.url}" target="_blank" rel="noreferrer">
          <span>${imageOrFallback(contact.iconImage, `${contact.label} icon`, contact.icon)}</span>
          ${contact.label}
        </a>
      `
    )
    .join("");
}

function renderPricePanel(activeIndex) {
  const activePlan = data.prices[activeIndex];

  $("#price-grid").innerHTML = `
    <div class="price-tabs" role="tablist" aria-label="Pricing systems">
      ${data.prices
        .map(
          (plan, index) => `
            <button
              class="price-tab ${index === activeIndex ? "active" : ""}"
              type="button"
              role="tab"
              aria-selected="${index === activeIndex}"
              data-price-index="${index}"
            >
              ${plan.name}
            </button>
          `
        )
        .join("")}
    </div>
    <article class="price-system">
      <div class="price-main">
        <span>Selected System</span>
        <h3>${activePlan.name}</h3>
        <p>${activePlan.description}</p>
      </div>
      <div class="price-features">
        ${activePlan.features
          .map(
            (feature) => `
              <span>
                <i aria-hidden="true">&#10003;</i>
                <span>${feature}</span>
              </span>
            `
          )
          .join("")}
      </div>
      <div class="price-side">
        <a class="btn btn-special" href="#contact">Request!</a>
        <strong>${activePlan.price}</strong>
      </div>
    </article>
  `;
}

function bindModal() {
  const modal = $("#code-modal");
  const title = $("#modal-title");
  const description = $("#modal-description");
  const code = $("#modal-code");

  $("#code-gallery").addEventListener("click", (event) => {
    const gallery = $("#code-gallery");
    const folder = event.target.closest(".skill-folder");
    if (folder) {
      gallery.classList.toggle("is-open");
      folder.setAttribute("aria-expanded", String(gallery.classList.contains("is-open")));
      return;
    }

    const card = event.target.closest("[data-code-index]");
    if (!card) return;
    if (!gallery.classList.contains("is-open")) {
      gallery.classList.add("is-open");
      $(".skill-folder", gallery).setAttribute("aria-expanded", "true");
      return;
    }

    const sample = data.sourceSamples[Number(card.dataset.codeIndex)];
    title.textContent = sample.title;
    description.textContent = sample.description;
    code.textContent = sample.code;
    modal.setAttribute("aria-hidden", "false");
  });

  $$("[data-close-modal]").forEach((button) => {
    button.addEventListener("click", () => modal.setAttribute("aria-hidden", "true"));
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") modal.setAttribute("aria-hidden", "true");
  });
}

function bindPrices() {
  $("#price-grid").addEventListener("click", (event) => {
    const tab = event.target.closest("[data-price-index]");
    if (!tab) return;
    renderPricePanel(Number(tab.dataset.priceIndex));
    bindScrollReveal();
  });
}

function bindProjects() {
  $("#project-grid").addEventListener("click", (event) => {
    const toggle = event.target.closest("[data-project-toggle]");
    if (!toggle) return;

    const grid = $("#project-grid");
    grid.classList.toggle("is-open");
    $(".project-list", grid).setAttribute("aria-hidden", String(!grid.classList.contains("is-open")));
    bindScrollReveal();
  });
}

function bindTabs() {
  const sections = $$("[data-section]");
  const links = $$(".tab-link");
  const observer = new IntersectionObserver(
    (entries) => {
      const active = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!active) return;

      links.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${active.target.id}`);
      });
    },
    { threshold: [0.35, 0.55] }
  );

  sections.forEach((section) => observer.observe(section));
}

function bindScrollReveal() {
  const revealItems = $$(
    "main .glass-panel, main .code-card, main .skill-folder, main .tool-chip, main .price-system, main .project-stack-card, main .contact-button"
  );

  revealItems.forEach((item, index) => {
    item.classList.add("reveal-item");
    item.style.setProperty("--reveal-delay", `${Math.min(index % 6, 5) * 55}ms`);
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
  );

  revealItems.forEach((item) => observer.observe(item));
}

function initScene() {
  const canvas = $("#scene3d");
  const context = canvas.getContext("2d");
  const particles = Array.from({ length: 78 }, (_, index) => ({
    angle: (Math.PI * 2 * index) / 78,
    radius: 90 + (index % 9) * 18,
    speed: 0.002 + (index % 5) * 0.0008,
    depth: 0.3 + (index % 7) * 0.12,
  }));

  function resize() {
    canvas.width = window.innerWidth * window.devicePixelRatio;
    canvas.height = window.innerHeight * window.devicePixelRatio;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    context.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
  }

  function draw(time) {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const centerX = width * 0.72;
    const centerY = height * 0.28;

    context.clearRect(0, 0, width, height);
    particles.forEach((particle, index) => {
      const angle = particle.angle + time * particle.speed;
      const x = centerX + Math.cos(angle) * particle.radius;
      const y = centerY + Math.sin(angle * 1.4) * particle.radius * 0.48;
      const size = 2 + particle.depth * 5;
      const alpha = 0.18 + particle.depth * 0.18;

      context.beginPath();
      context.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      context.shadowColor = index % 2 ? "rgba(0,0,0,.2)" : "rgba(70,120,255,.35)";
      context.shadowBlur = 18;
      context.arc(x, y, size, 0, Math.PI * 2);
      context.fill();
    });

    requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener("resize", resize);
  requestAnimationFrame(draw);
}

renderData();
bindModal();
bindPrices();
bindProjects();
bindTabs();
bindScrollReveal();
initScene();

function enableSmoothScrolling() {
  document.addEventListener("click", (event) => {
    const link = event.target.closest && event.target.closest('a[href^="#"]');
    if (!link) return;
    const href = link.getAttribute("href");
    if (!href || href === "#") return;
    const id = href.slice(1);
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();

    if ("scrollBehavior" in document.documentElement.style) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    } else if ("scrollTo" in window) {
      const top = target.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({ top, behavior: "smooth" });
    } else {
      target.scrollIntoView();
    }

    try {
      history.replaceState(null, "", href);
    } catch (e) {
      // ignore
    }
  });
}

enableSmoothScrolling();
