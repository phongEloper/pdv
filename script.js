const data = window.portfolioData;

const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => Array.from(parent.querySelectorAll(selector));

function imageOrFallback(src, alt, fallback) {
  if (!src) return fallback;
  return `<img src="${src}" alt="${alt}" loading="lazy" />`;
}

function renderMediaPreview(item) {
  if (!item.src) {
    if (item.markdown || item.markdownSrc) return "";
    return `
      <div class="media-placeholder">
        <strong>${item.type}</strong>
        <span>Add a file path or URL in data.js to preview this ${item.type}.</span>
      </div>
    `;
  }

  if (item.type === "video") {
    return `<video src="${item.src}" controls playsinline poster="${item.thumbnail || ""}"></video>`;
  }

  return `<img src="${item.src}" alt="${item.title}" loading="lazy" />`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderInlineMarkdown(value) {
  const linkPattern = /\[([^\]]+)\]\((<[^>]+>|[^)]+)\)/g;
  return escapeHtml(value)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(linkPattern, (_match, text, rawHref) => {
      let href = rawHref.trim().replace(/^<|>$/g, "");
      if (/^www\./i.test(href)) href = `https://${href}`;

      const safeHref = escapeHtml(href);
      const safeText = renderInlineMarkdown(text);
      const external = /^(https?:)?\/\//i.test(href);
      const target = external ? ' target="_blank" rel="noreferrer"' : "";
      return `<a href="${safeHref}"${target}>${safeText}</a>`;
    });
}

function renderMarkdown(markdown) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const html = [];
  let inCode = false;
  let codeLines = [];
  let inList = false;

  function closeList() {
    if (!inList) return;
    html.push("</ul>");
    inList = false;
  }

  lines.forEach((line) => {
    if (line.trim().startsWith("```")) {
      if (inCode) {
        html.push(`<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
        codeLines = [];
        inCode = false;
      } else {
        closeList();
        inCode = true;
      }
      return;
    }

    if (inCode) {
      codeLines.push(line);
      return;
    }

    if (!line.trim()) {
      closeList();
      return;
    }

    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      closeList();
      const level = heading[1].length + 2;
      html.push(`<h${level}>${renderInlineMarkdown(heading[2])}</h${level}>`);
      return;
    }

    const listItem = line.match(/^\s*[-*]\s+(.+)$/);
    if (listItem) {
      if (!inList) {
        html.push("<ul>");
        inList = true;
      }
      html.push(`<li>${renderInlineMarkdown(listItem[1])}</li>`);
      return;
    }

    const quote = line.match(/^>\s+(.+)$/);
    if (quote) {
      closeList();
      html.push(`<blockquote>${renderInlineMarkdown(quote[1])}</blockquote>`);
      return;
    }

    closeList();
    html.push(`<p>${renderInlineMarkdown(line)}</p>`);
  });

  closeList();
  if (inCode) html.push(`<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
  return html.join("");
}

async function getMarkdownDetails(item) {
  if (item.markdown) return item.markdown;
  if (!item.markdownSrc) return "";

  const response = await fetch(item.markdownSrc);
  if (!response.ok) throw new Error(`Unable to load markdown: ${item.markdownSrc}`);
  return response.text();
}

function formatStat(value) {
  if (value === null || value === undefined || value === "") return "...";
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(Number(value));
}

function projectStatsMarkup(project, index) {
  const stats = project.stats || {};
  return `
    <div class="project-stats" data-project-stats="${index}">
      <span><strong data-stat="playing">${formatStat(stats.playing)}</strong><small>Playing</small></span>
      <span><strong data-stat="likes">${formatStat(stats.likes)}</strong><small>Likes</small></span>
      <span><strong data-stat="favorites">${formatStat(stats.favorites)}</strong><small>Favourites</small></span>
    </div>
  `;
}

function getPlaceId(project) {
  if (project.placeId) return String(project.placeId);
  const match = project.link?.match(/\/games\/(\d+)/);
  return match?.[1] || "";
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
          <strong>Works</strong>
          <small>Click to view my works</small>
      </span>
    </button>
    <div class="code-cards">
      ${data.skillMedia
        .map(
          (item, index) => `
            <button class="code-card glass-panel skill-media-card" type="button" data-skill-index="${index}">
              <div class="code-visual" aria-hidden="true">
                ${
                  item.thumbnail || item.src
                    ? `<img src="${item.thumbnail || item.src}" alt="" loading="lazy" />`
                    : "<i></i><i></i><i></i><i></i><i></i>"
                }
              </div>
              <strong>${item.title}</strong>
              <small>${item.description}</small>
            </button>
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
                ${projectStatsMarkup(project, index)}
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
          (project, index) => `
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
                ${projectStatsMarkup(project, index)}
                <a class="btn btn-special project-action" href="${project.link}" target="_blank">View Game</a>
              </div>
            </article>
          `
        )
        .join("")}
    </div>
  `;

  hydrateProjectStats();
  window.setInterval(hydrateProjectStats, 120000);

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
  const media = $("#modal-media");
  const markdown = $("#modal-markdown");

  $("#code-gallery").addEventListener("click", async (event) => {
    const gallery = $("#code-gallery");
    const folder = event.target.closest(".skill-folder");
    if (folder) {
      gallery.classList.toggle("is-open");
      folder.setAttribute("aria-expanded", String(gallery.classList.contains("is-open")));
      return;
    }

    const mediaCard = event.target.closest("[data-skill-index]");
    if (mediaCard) {
      if (!gallery.classList.contains("is-open")) {
        gallery.classList.add("is-open");
        $(".skill-folder", gallery).setAttribute("aria-expanded", "true");
        return;
      }

      const item = data.skillMedia[Number(mediaCard.dataset.skillIndex)];
      title.textContent = item.title;
      description.textContent = "";
      description.hidden = true;
      media.hidden = false;
      media.innerHTML = renderMediaPreview(item);
      markdown.innerHTML = "";
      markdown.hidden = true;
      modal.setAttribute("aria-hidden", "false");

      try {
        const details = await getMarkdownDetails(item);
        if (details) {
          markdown.hidden = false;
          markdown.innerHTML = renderMarkdown(details);
        }
      } catch (error) {
        markdown.hidden = false;
        markdown.innerHTML = `<p class="markdown-error">Markdown details could not be loaded.</p>`;
      }
      return;
    }
  });

  $$("[data-close-modal]").forEach((button) => {
    button.addEventListener("click", () => {
      modal.setAttribute("aria-hidden", "true");
      media.innerHTML = "";
      markdown.innerHTML = "";
      description.hidden = false;
    });
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      modal.setAttribute("aria-hidden", "true");
      media.innerHTML = "";
      markdown.innerHTML = "";
      description.hidden = false;
    }
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

async function getUniverseId(project) {
  if (project.universeId) return String(project.universeId);

  const placeId = getPlaceId(project);
  if (!placeId) return "";

  const response = await fetch(`https://apis.roblox.com/universes/v1/places/${placeId}/universe`);
  if (!response.ok) throw new Error(`Universe lookup failed for place ${placeId}`);
  const payload = await response.json();
  project.universeId = String(payload.universeId || payload.UniverseId || "");
  return project.universeId;
}

async function hydrateProjectStats() {
  const projectsWithUniverse = await Promise.all(
    data.projects.map(async (project, index) => {
      try {
        const universeId = await getUniverseId(project);
        return universeId ? { project, index, universeId } : null;
      } catch (error) {
        return null;
      }
    })
  );

  const validProjects = projectsWithUniverse.filter(Boolean);
  if (!validProjects.length) return;

  const universeIds = validProjects.map((item) => item.universeId);

  try {
    const [gamesResponse, votesResponse, favoritesResults] = await Promise.all([
      fetch(`https://games.roblox.com/v1/games?universeIds=${universeIds.join(",")}`),
      fetch(`https://games.roblox.com/v1/games/votes?universeIds=${universeIds.join(",")}`),
      Promise.all(
        validProjects.map((item) =>
          fetch(`https://games.roblox.com/v1/games/${item.universeId}/favorites/count`)
            .then((response) => (response.ok ? response.json() : null))
            .catch(() => null)
        )
      ),
    ]);

    const gamesPayload = gamesResponse.ok ? await gamesResponse.json() : { data: [] };
    const votesPayload = votesResponse.ok ? await votesResponse.json() : { data: [] };

    validProjects.forEach((item, favoriteIndex) => {
      const game = gamesPayload.data?.find((entry) => String(entry.id) === item.universeId);
      const vote = votesPayload.data?.find((entry) => String(entry.id) === item.universeId);
      const favorites = favoritesResults[favoriteIndex]?.favoritesCount ?? favoritesResults[favoriteIndex]?.count;

      item.project.stats = {
        playing: game?.playing ?? item.project.stats?.playing ?? null,
        likes: vote?.upVotes ?? game?.upVotes ?? item.project.stats?.likes ?? null,
        favorites: favorites ?? game?.favoritedCount ?? item.project.stats?.favorites ?? null,
      };

      updateProjectStats(item.index, item.project.stats);
    });
  } catch (error) {
    data.projects.forEach((project, index) => updateProjectStats(index, project.stats || {}));
  }
}

function updateProjectStats(index, stats) {
  $$(`[data-project-stats="${index}"]`).forEach((container) => {
    const playing = container.querySelector('[data-stat="playing"]');
    const likes = container.querySelector('[data-stat="likes"]');
    const favorites = container.querySelector('[data-stat="favorites"]');
    if (playing) playing.textContent = formatStat(stats.playing);
    if (likes) likes.textContent = formatStat(stats.likes);
    if (favorites) favorites.textContent = formatStat(stats.favorites);
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
