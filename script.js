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
  const url = item.url || item.src || item.embedUrl || item.embedCode || "";
  if (platform.includes("youtube") || /youtu\.?be|youtube\.com/i.test(url)) return "YouTube";
  if (platform === "x" || platform.includes("twitter") || /x\.com|twitter\.com/i.test(url)) return "X";
  if (platform.includes("streamable") || /streamable\.com/i.test(url)) return "Streamable";
  return item.platform || "Video";
}

function getShowcaseEmbed(item) {
  const source = item.src || item.url || "";
  const isVideoFile = /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(source);
  const platform = getShowcasePlatform(item);

  if (item.embedCode) {
    return item.embedCode
      .replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, "")
      .replace(/<script\b[^>]*\/?>/gi, "");
  }

  if (item.embedUrl) {
    return `<iframe src="${item.embedUrl}" title="${item.title}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
  }

  const youtubeId = getYouTubeId(source);
  if (youtubeId) {
    return `<iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(youtubeId)}?rel=0" title="${item.title}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
  }

  if (platform === "X") {
    const postId = source.match(/\/status\/(\d+)/i)?.[1];
    if (postId) {
      const postUrl = source.match(/https?:\/\/(?:www\.)?(?:x|twitter)\.com\/[^/?#]+\/status\/\d+/i)?.[0] || `https://x.com/i/status/${postId}`;
      return `<blockquote class="twitter-tweet" data-theme="light" data-dnt="true"><a href="${postUrl}">View this post on X</a></blockquote>`;
    }
  }

  const streamableId = getStreamableId(source);
  if (streamableId) {
    return `<iframe src="https://streamable.com/e/${encodeURIComponent(streamableId)}" title="${item.title}" loading="lazy" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
  }

  if (isVideoFile) {
    return `<video src="${source}" controls playsinline preload="metadata" poster="${item.thumbnail || item.image || ""}"></video>`;
  }

  return item.thumbnail || item.image
    ? `<img src="${item.thumbnail || item.image}" alt="${item.title} preview" loading="lazy" draggable="false" />`
    : `<span class="showcase-placeholder">${platform}</span>`;
}

let activeProjectIndex = 0;
let activeShowcaseIndex = 0;
let activePriceIndex = 0;
let xWidgetsPromise = null;

function wrapIndex(index, length) {
  return (index + length) % length;
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

  renderProjectCarousel(activeProjectIndex);
  renderShowcaseCarousel(activeShowcaseIndex);

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

function renderProjectCarousel(index) {
  if (!data.projects.length) return;
  const previousIndex = activeProjectIndex;
  activeProjectIndex = wrapIndex(index, data.projects.length);
  const isChanging = activeProjectIndex !== previousIndex;
  const direction = index < previousIndex ? -1 : 1;
  const project = data.projects[activeProjectIndex];
  const count = data.projects.length;

  $("#project-grid").innerHTML = `
    <div class="content-carousel project-carousel">
      <a class="carousel-frame project-frame" href="${project.link}" target="_blank" rel="noreferrer" aria-label="Open ${project.title} in a new tab">
        <div class="carousel-banner ${isChanging ? "is-sliding" : ""}" style="--slide-offset: ${isChanging ? direction * 100 : 0}%">
          ${project.image ? `<img src="${project.image}" alt="" loading="lazy" draggable="false" />` : `<span class="carousel-placeholder">${project.title}</span>`}
        </div>
        <span class="carousel-swipe-zone" aria-hidden="true"></span>
      </a>
      <div class="carousel-footer">
        <div class="carousel-controls" role="group" aria-label="Project navigation">
          <button class="carousel-arrow" type="button" data-carousel-step="-1" aria-label="Previous project"><iconify-icon icon="solar:arrow-left-linear" aria-hidden="true"></iconify-icon></button>
          <button class="carousel-arrow" type="button" data-carousel-step="1" aria-label="Next project"><iconify-icon icon="solar:arrow-right-linear" aria-hidden="true"></iconify-icon></button>
        </div>
        <span class="carousel-footer-page" aria-label="Page ${activeProjectIndex + 1} of ${count}">${activeProjectIndex + 1} / ${count}</span>
        <div class="carousel-copy">
          <h3>${project.title}</h3>
          <span class="carousel-kicker">By @${project.studio}</span>
          <p>${project.description}</p>
        </div>
      </div>
    </div>
  `;
}

function renderShowcaseCarousel(index) {
  if (!data.showcases.length) return;
  const previousIndex = activeShowcaseIndex;
  activeShowcaseIndex = wrapIndex(index, data.showcases.length);
  const isChanging = activeShowcaseIndex !== previousIndex;
  const direction = index < previousIndex ? -1 : 1;
  const item = data.showcases[activeShowcaseIndex];
  const count = data.showcases.length;

  $("#showcase-track").innerHTML = `
    <div class="content-carousel showcase-carousel">
      <div class="carousel-frame showcase-frame" data-platform="${getShowcasePlatform(item)}">
        <div class="carousel-banner ${isChanging ? "is-sliding" : ""}" style="--slide-offset: ${isChanging ? direction * 100 : 0}%">
          ${getShowcaseEmbed(item)}
        </div>
        <span class="carousel-swipe-zone" aria-hidden="true"></span>
      </div>
      <div class="carousel-footer">
        <div class="carousel-controls" role="group" aria-label="Showcase navigation">
          <button class="carousel-arrow" type="button" data-carousel-step="-1" aria-label="Previous showcase"><iconify-icon icon="solar:arrow-left-linear" aria-hidden="true"></iconify-icon></button>
          <button class="carousel-arrow" type="button" data-carousel-step="1" aria-label="Next showcase"><iconify-icon icon="solar:arrow-right-linear" aria-hidden="true"></iconify-icon></button>
        </div>
        <span class="carousel-footer-page" aria-label="Page ${activeShowcaseIndex + 1} of ${count}">${activeShowcaseIndex + 1} / ${count}</span>
        <div class="carousel-copy">
          <span class="carousel-kicker">${getShowcasePlatform(item)}</span>
          <h3>${item.title}</h3>
          <p>${item.description}</p>
        </div>
      </div>
    </div>
  `;

  if (getShowcasePlatform(item) === "X") {
    loadXWidgets($("#showcase-track .showcase-frame"));
  }
}

function loadXWidgets(container) {
  if (!container?.querySelector(".twitter-tweet")) return;
  if (window.twttr?.widgets?.load) {
    window.twttr.widgets.load(container);
    return;
  }

  if (!xWidgetsPromise) {
    xWidgetsPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://platform.x.com/widgets.js";
      script.async = true;
      script.charset = "utf-8";
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  xWidgetsPromise
    .then(() => window.twttr?.widgets?.load(container))
    .catch(() => {});
}

function bindSwipeCarousel(container, getIndex, renderSlide) {
  let pointerStart = null;
  let suppressClickUntil = 0;

  container.addEventListener("click", (event) => {
    const button = event.target.closest("[data-carousel-step]");
    if (button) {
      event.preventDefault();
      renderSlide(getIndex() + Number(button.dataset.carouselStep));
      return;
    }

    if (Date.now() < suppressClickUntil) {
      event.preventDefault();
      event.stopPropagation();
      suppressClickUntil = 0;
    }
  });

  container.addEventListener("pointerdown", (event) => {
    if (event.button !== undefined && event.button !== 0) return;
    if (event.target.closest("button, iframe")) return;
    const frame = event.target.closest(".carousel-frame");
    if (!frame) return;

    pointerStart = { id: event.pointerId, x: event.clientX, y: event.clientY };
  });

  window.addEventListener("pointerup", (event) => {
    if (!pointerStart || pointerStart.id !== event.pointerId) return;
    const deltaX = event.clientX - pointerStart.x;
    const deltaY = event.clientY - pointerStart.y;
    pointerStart = null;

    if (Math.abs(deltaX) < 42 || Math.abs(deltaX) < Math.abs(deltaY) * 1.15) return;
    suppressClickUntil = Date.now() + 500;
    renderSlide(getIndex() + (deltaX < 0 ? 1 : -1));
  });

  const clearPointer = (event) => {
    if (pointerStart?.id === event.pointerId) pointerStart = null;
  };
  window.addEventListener("pointercancel", clearPointer);
}

function bindCarousels() {
  bindSwipeCarousel($("#project-grid"), () => activeProjectIndex, renderProjectCarousel);
  bindSwipeCarousel($("#showcase-track"), () => activeShowcaseIndex, renderShowcaseCarousel);
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
  if (!data.prices.length) return;
  const previousIndex = activePriceIndex;
  activePriceIndex = wrapIndex(activeIndex, data.prices.length);
  const isChanging = activePriceIndex !== previousIndex;
  const direction = activeIndex < previousIndex ? -1 : 1;
  activeIndex = activePriceIndex;
  const activePlan = data.prices[activeIndex];

  $("#price-grid").innerHTML = `
    <article class="price-system" aria-live="polite">
      <div class="price-plan-content ${isChanging ? "is-sliding" : ""}" style="--slide-offset: ${isChanging ? direction * 100 : 0}%">
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
      </div>
    </article>
    <div class="price-navigation" role="group" aria-label="Pricing system navigation">
      <button class="price-arrow" type="button" data-price-step="-1" aria-label="Previous system"><iconify-icon icon="solar:arrow-left-linear" aria-hidden="true"></iconify-icon></button>
      <span class="price-navigation-label" aria-live="polite">${activeIndex + 1} / ${data.prices.length}</span>
      <button class="price-arrow" type="button" data-price-step="1" aria-label="Next system"><iconify-icon icon="solar:arrow-right-linear" aria-hidden="true"></iconify-icon></button>
    </div>
  `;
}

function bindPrices() {
  $("#price-grid").addEventListener("click", (event) => {
    const button = event.target.closest("[data-price-step]");
    if (!button) return;
    renderPricePanel(activePriceIndex + Number(button.dataset.priceStep));
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
bindCarousels();
bindTabs();
bindWorkFlowScroll();
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

    const isContact = target.matches(".contact-section");
    const headerOffset = ($(".site-header")?.offsetHeight || 0) + 24;
    const top = isContact
      ? document.documentElement.scrollHeight - window.innerHeight
      : target.getBoundingClientRect().top + window.pageYOffset - headerOffset;

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
