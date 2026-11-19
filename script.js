const data = window.portfolioData;

const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => Array.from(parent.querySelectorAll(selector));

function imageOrFallback(src, alt, fallback) {
  if (!src) return fallback;
  return `<img src="${src}" alt="${alt}" loading="lazy" />`;
}

function getYouTubeId(url = "") {
  const patterns = [
    /youtu\.be\/([^?&/]+)/i,
    /youtube\.com\/watch\?v=([^?&/]+)/i,
    /youtube\.com\/shorts\/([^?&/]+)/i,
    /youtube\.com\/embed\/([^?&/]+)/i,
  ];
  const match = patterns.map((pattern) => url.match(pattern)).find(Boolean);
  return match?.[1] || "";
}

function getStreamableId(url = "") {
  const match = url.match(/streamable\.com\/(?:e\/)?([^?&/]+)/i);
  return match?.[1] || "";
}

function getShowcasePlatform(item) {
  const platform = (item.platform || "").toLowerCase();
  const url = item.url || item.src || "";
  if (platform.includes("youtube") || /youtu\.?be|youtube\.com/i.test(url)) return "YouTube";
  if (platform === "x" || platform.includes("twitter") || /x\.com|twitter\.com/i.test(url)) return "X";
  if (platform.includes("streamable") || /streamable\.com/i.test(url)) return "Streamable";
  return item.platform || "Video";
}

function getShowcaseThumbnail(item) {
  const platform = getShowcasePlatform(item);
  const source = item.src || item.url || "";
  const isVideoFile = /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(source);

  if (item.thumbnail) {
    return `<img src="${item.thumbnail}" alt="${item.title} thumbnail" loading="lazy" />`;
  }

  const youtubeId = getYouTubeId(source);
  if (youtubeId) {
    return `<img src="https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg" alt="${item.title} thumbnail" loading="lazy" />`;
  }

  const streamableId = getStreamableId(source);
  if (streamableId) {
    return `<img src="https://cdn-cf-east.streamable.com/image/${streamableId}.jpg" alt="${item.title} thumbnail" loading="lazy" />`;
  }

  if (isVideoFile) {
    return `<video src="${source}" muted playsinline preload="metadata" poster="${item.image || ""}"></video>`;
  }

  if (item.image) {
    return `<img src="${item.image}" alt="${platform} thumbnail" loading="lazy" />`;
  }

  return `<span class="showcase-placeholder">${platform}</span>`;
}

function renderData() {
  $(".avatar-core").innerHTML = imageOrFallback(data.brand.heroImage, "Pdv brand image", "Pdv");
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

  $("#project-grid").innerHTML = data.projects
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
            <h3>${project.title}</h3>
            <p>By <strong>@${project.studio}</strong></p>
            <p>${project.description}</p>
            <a class="btn btn-special project-action" href="${project.link}" target="_blank" rel="noreferrer">View Game</a>
          </div>
        </article>
      `
    )
    .join("");

  $("#showcase-track").innerHTML = data.showcases
    .map(
      (item) => `
        <a class="showcase-link" href="${item.url || item.src}" target="_blank" rel="noreferrer" data-platform="${getShowcasePlatform(item)}">
          <span class="showcase-art" aria-hidden="true">
            ${getShowcaseThumbnail(item)}
            <span class="play-badge"></span>
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
  renderWorkFlow();

  $("#contact-grid").innerHTML = data.contacts
    .map(
      (contact, index) => `
        <a class="contact-button" href="${contact.url}" target="_blank" rel="noreferrer" aria-label="${contact.label}">
          <span class="contact-icon">${imageOrFallback(contact.iconImage, `${contact.label} icon`, contact.icon)}</span>
        </a>
      `
    )
    .join("");
}

function renderWorkFlow() {
  const steps = data.workSteps || [];
  const stepsContainer = $("#work-steps");
  if (!stepsContainer) return;

  stepsContainer.innerHTML = steps
    .map(
      (step, index) => `
        <article class="work-step ${index % 2 ? "is-right" : "is-left"}" data-work-step="${index}">
          <span class="work-node" aria-hidden="true">${String(index + 1).padStart(2, "0")}</span>
          <div class="work-card">
            <span>${step.phase}</span>
            <h3>${step.title}</h3>
            <p>${step.description}</p>
          </div>
        </article>
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
        <a class="btn btn-special" href="#contact">Request</a>
        <strong>${activePlan.price}</strong>
      </div>
    </article>
  `;
}

function bindPrices() {
  $("#price-grid").addEventListener("click", (event) => {
    const tab = event.target.closest("[data-price-index]");
    if (!tab) return;
    renderPricePanel(Number(tab.dataset.priceIndex));
    bindMagneticButtons();
    bindCardTilt();
    bindScrollReveal();
  });
}

function bindTabs() {
  const sections = $$("[data-section]");
  const links = $$(".tab-link");
  let frame = null;

  function setActive() {
    const headerHeight = $(".site-header")?.offsetHeight || 0;
    const marker = headerHeight + 42;
    let activeSection = sections[0];

    sections.forEach((section) => {
      if (section.getBoundingClientRect().top <= marker) {
        activeSection = section;
      }
    });

    const activeHref = `#${activeSection.id}`;
    links.forEach((link) => link.classList.toggle("active", link.getAttribute("href") === activeHref));

    const activeLink = links.find((link) => link.getAttribute("href") === activeHref);
    activeLink?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    frame = null;
  }

  function requestSetActive() {
    if (frame) return;
    frame = requestAnimationFrame(setActive);
  }

  window.addEventListener("scroll", requestSetActive, { passive: true });
  window.addEventListener("resize", requestSetActive);
  links.forEach((link) => link.addEventListener("click", () => window.setTimeout(setActive, 350)));
  setActive();
}

function bindWorkFlowScroll() {
  const flow = $("#work-flow");
  if (!flow) return;

  const path = $(".work-path", flow);
  const steps = $$(".work-step", flow);
  let frame = null;

  function update() {
    const pathRect = path.getBoundingClientRect();
    const viewportCenter = window.innerHeight / 2;
    const progress = Math.min(Math.max((viewportCenter - pathRect.top) / pathRect.height, 0), 1);
    const activeIndex = Math.min(steps.length - 1, Math.floor(progress * steps.length));

    flow.style.setProperty("--work-progress", `${progress * 100}%`);
    steps.forEach((step, index) => {
      step.classList.toggle("is-active", index <= activeIndex);
    });
    frame = null;
  }

  function requestUpdate() {
    if (frame) return;
    frame = requestAnimationFrame(update);
  }

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
  update();
}

function bindMagneticButtons() {
  $$(".btn-special, .tab-special").forEach((button) => {
    if (button.dataset.magneticBound) return;
    button.dataset.magneticBound = "true";

    button.addEventListener("pointermove", (event) => {
      if (window.matchMedia("(pointer: coarse)").matches) return;
      const rect = button.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      button.style.setProperty("--magnet-x", `${Math.max(Math.min(x * 0.16, 8), -8)}px`);
      button.style.setProperty("--magnet-y", `${Math.max(Math.min(y * 0.22, 7), -7)}px`);
    });

    button.addEventListener("pointerleave", () => {
      button.style.setProperty("--magnet-x", "0px");
      button.style.setProperty("--magnet-y", "0px");
    });
  });
}

function bindCardTilt() {
  const cards = $$(".price-system");

  cards.forEach((card) => {
    if (card.dataset.tiltBound) return;
    card.dataset.tiltBound = "true";

    card.addEventListener("pointermove", (event) => {
      if (window.matchMedia("(pointer: coarse)").matches) return;
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.setProperty("--tilt-x", `${Math.max(Math.min(-y * 7, 5), -5)}deg`);
      card.style.setProperty("--tilt-y", `${Math.max(Math.min(x * 8, 6), -6)}deg`);
    });

    card.addEventListener("pointerleave", () => {
      card.style.setProperty("--tilt-x", "0deg");
      card.style.setProperty("--tilt-y", "0deg");
    });
  });
}

function bindScrollReveal() {
  const revealItems = $$(
    "main .glass-panel, main .code-card, main .tool-chip, main .price-system, .contact-button"
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
  if (!canvas || getComputedStyle(canvas).display === "none") return;
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
bindPrices();
bindTabs();
bindWorkFlowScroll();
bindMagneticButtons();
bindCardTilt();
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

    const headerOffset = ($(".site-header")?.offsetHeight || 0) + 24;
    const top = target.getBoundingClientRect().top + window.pageYOffset - headerOffset;

    if ("scrollTo" in window) {
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
