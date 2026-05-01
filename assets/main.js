const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const titleIconHref = "./assets/images/at-favicon-zoomed.png";
["icon", "apple-touch-icon"].forEach((rel) => {
  let iconLink = document.querySelector(`link[rel="${rel}"]`);

  if (!iconLink) {
    iconLink = document.createElement("link");
    iconLink.rel = rel;
    document.head.append(iconLink);
  }

  iconLink.href = titleIconHref;
});

const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      navLinks.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    }
  });
}

const revealItems = document.querySelectorAll("[data-reveal]");
if (revealItems.length) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
}

document.querySelectorAll(".glass-card, .feature-card, .book-card, .place-card, .timeline-card, .video-card, .contact-card, .stat-card").forEach((card) => {
  card.addEventListener("pointermove", (event) => {
    const rect = card.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    card.style.setProperty("--cursor-x", `${x}%`);
    card.style.setProperty("--cursor-y", `${y}%`);
  });
});

const featuredGuitarVideoId = "VsbFO2rWAP0";
document.querySelectorAll("#guitarRail .video-card:first-child, #creatorRail .video-card:first-child").forEach((card) => {
  card.dataset.videoId = featuredGuitarVideoId;
  card.dataset.title = "Featured guitar cover";

  const title = card.querySelector(".video-content h3");
  const description = card.querySelector(".video-content p");
  const visual = card.querySelector(".video-visual");

  if (title) title.textContent = "Featured guitar cover";
  if (description) description.textContent = "Click to watch the selected guitar video directly inside the portfolio.";
  if (visual) {
    visual.style.backgroundImage = `linear-gradient(135deg, rgba(5, 8, 20, 0.18), rgba(5, 8, 20, 0.68)), url("https://img.youtube.com/vi/${featuredGuitarVideoId}/hqdefault.jpg")`;
    visual.style.backgroundPosition = "center";
    visual.style.backgroundSize = "cover";
  }
});

if (!prefersReducedMotion) {
  window.addEventListener("pointermove", (event) => {
    const x = (event.clientX / window.innerWidth - 0.5).toFixed(3);
    const y = (event.clientY / window.innerHeight - 0.5).toFixed(3);
    document.documentElement.style.setProperty("--parallax-x", x);
    document.documentElement.style.setProperty("--parallax-y", y);
  });
}

const audio = document.querySelector("#bgm");
const audioToggle = document.querySelector(".audio-toggle");

if (audio && audioToggle) {
  const audioStateKey = "aarnav-bgm-state";
  const audioTimeKey = "aarnav-bgm-time";
  let isLeavingPage = false;

  audio.volume = 0.26;
  audio.preload = "auto";

  const syncAudioButton = (isPlaying) => {
    audioToggle.classList.toggle("is-playing", isPlaying);
    audioToggle.classList.toggle("needs-tap", false);
    audioToggle.setAttribute("aria-label", isPlaying ? "Pause background music" : "Play background music");
  };

  const saveAudioTime = () => {
    if (Number.isFinite(audio.currentTime)) {
      localStorage.setItem(audioTimeKey, String(audio.currentTime));
    }
  };

  const restoreAudioTime = () => {
    const savedTime = Number.parseFloat(localStorage.getItem(audioTimeKey) || "0");
    if (!Number.isFinite(savedTime) || savedTime <= 0) return;

    const duration = Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : null;
    audio.currentTime = duration ? savedTime % duration : savedTime;
  };

  if (audio.readyState >= 1) {
    restoreAudioTime();
  } else {
    audio.addEventListener("loadedmetadata", restoreAudioTime, { once: true });
  }

  const playBackgroundMusic = async ({ fromUser = false } = {}) => {
    try {
      await audio.play();
      localStorage.setItem(audioStateKey, "playing");
      syncAudioButton(true);
    } catch {
      if (fromUser) {
        localStorage.setItem(audioStateKey, "paused");
      }
      syncAudioButton(false);
      audioToggle.classList.toggle("needs-tap", !fromUser);
    }
  };

  audioToggle.addEventListener("click", async () => {
    if (audio.paused) {
      await playBackgroundMusic({ fromUser: true });
    } else {
      saveAudioTime();
      localStorage.setItem(audioStateKey, "paused");
      audio.pause();
      syncAudioButton(false);
    }
  });

  audio.addEventListener("play", () => syncAudioButton(true));
  audio.addEventListener("timeupdate", saveAudioTime);
  audio.addEventListener("pause", () => {
    if (isLeavingPage) return;
    saveAudioTime();
    localStorage.setItem(audioStateKey, "paused");
    syncAudioButton(false);
  });

  window.addEventListener("pagehide", () => {
    isLeavingPage = true;
    saveAudioTime();
    localStorage.setItem(audioStateKey, audio.paused ? "paused" : "playing");
  });

  window.addEventListener("beforeunload", () => {
    isLeavingPage = true;
    saveAudioTime();
    localStorage.setItem(audioStateKey, audio.paused ? "paused" : "playing");
  });

  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[href]");
    if (!link || audio.paused) return;

    const target = link.getAttribute("target");
    const href = link.getAttribute("href") || "";
    if (target === "_blank" || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;

    saveAudioTime();
    localStorage.setItem(audioStateKey, "playing");
  });

  if (localStorage.getItem(audioStateKey) === "playing") {
    playBackgroundMusic();

    const resumeAfterAutoplayBlock = () => {
      if (audio.paused && localStorage.getItem(audioStateKey) === "playing") {
        playBackgroundMusic({ fromUser: true });
      }
    };

    document.addEventListener("pointerdown", resumeAfterAutoplayBlock, { once: true });
    document.addEventListener("keydown", resumeAfterAutoplayBlock, { once: true });
  } else {
    syncAudioButton(false);
  }
}

const instaTrigger = document.querySelector(".instagram-float");
const instaPopover = document.querySelector(".insta-popover");

if (instaTrigger && instaPopover) {
  instaTrigger.addEventListener("click", () => {
    instaPopover.classList.toggle("is-open");
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".floating-actions")) {
      instaPopover.classList.remove("is-open");
    }
  });
}

document.querySelectorAll("[data-rail-prev], [data-rail-next]").forEach((button) => {
  button.addEventListener("click", () => {
    const targetId = button.getAttribute("data-rail-prev") || button.getAttribute("data-rail-next");
    const rail = document.querySelector(targetId);
    if (!rail) return;

    const direction = button.hasAttribute("data-rail-next") ? 1 : -1;
    rail.scrollBy({
      left: direction * rail.clientWidth * 0.82,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  });
});

const videoModal = document.querySelector("#videoModal");
const videoModalBody = document.querySelector("#videoModalBody");

function closeVideoModal() {
  if (!videoModal || !videoModalBody) return;
  videoModal.classList.remove("is-open");
  videoModal.setAttribute("aria-hidden", "true");
  videoModalBody.innerHTML = "";
  document.body.style.overflow = "";
}

function openVideoModal(card) {
  if (!videoModal || !videoModalBody) return;

  const videoId = (card.dataset.videoId || "").trim();
  const title = card.dataset.title || "Featured video";
  const channelUrl = card.dataset.channelUrl || "#";

  if (videoId && !videoId.includes("VIDEO_ID")) {
    const safeId = encodeURIComponent(videoId);
    const videoUrl = `https://www.youtube.com/watch?v=${safeId}`;

    if (window.location.protocol === "file:") {
      videoModalBody.innerHTML = `
        <div class="modal-placeholder">
          <div>
            <h3>${title}</h3>
            <p>YouTube blocks embedded playback from local file previews, which causes Error 153. Open this site through localhost or GitHub Pages and the video will play inside this modal.</p>
            <a class="button primary" href="${videoUrl}" target="_blank" rel="noreferrer">Watch on YouTube</a>
          </div>
        </div>
      `;
      videoModal.classList.add("is-open");
      videoModal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      return;
    }

    const embedParams = new URLSearchParams({
      autoplay: "1",
      enablejsapi: "1",
      rel: "0",
      playsinline: "1",
    });

    embedParams.set("origin", window.location.origin);

    videoModalBody.innerHTML = `
      <div class="modal-frame">
        <iframe
          title="${title}"
          src="https://www.youtube.com/embed/${safeId}?${embedParams.toString()}"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerpolicy="origin-when-cross-origin"
          allowfullscreen></iframe>
      </div>
    `;
  } else {
    videoModalBody.innerHTML = `
      <div class="modal-placeholder">
        <div>
          <h3>${title}</h3>
          <p>This featured slot is prepared for a YouTube clip and will play directly inside the portfolio once a video is selected.</p>
          <a class="button primary" href="${channelUrl}" target="_blank" rel="noreferrer">Open channel</a>
        </div>
      </div>
    `;
  }

  videoModal.classList.add("is-open");
  videoModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

document.querySelectorAll(".video-card").forEach((card) => {
  card.addEventListener("click", () => openVideoModal(card));
  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openVideoModal(card);
    }
  });
});

document.querySelectorAll("[data-close-video]").forEach((item) => {
  item.addEventListener("click", closeVideoModal);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeVideoModal();
    instaPopover?.classList.remove("is-open");
  }
});

const canvas = document.querySelector("#starfield");
const context = canvas?.getContext("2d");

if (canvas && context && !prefersReducedMotion) {
  let width = 0;
  let height = 0;
  let stars = [];
  let shooting = null;

  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    width = canvas.width = window.innerWidth * dpr;
    height = canvas.height = window.innerHeight * dpr;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;

    const count = Math.max(90, Math.round((window.innerWidth * window.innerHeight) / 14000));
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: (Math.random() * 1.4 + 0.2) * dpr,
      alpha: Math.random() * 0.8 + 0.2,
      speed: (Math.random() * 0.22 + 0.03) * dpr,
    }));
  }

  function drawStars() {
    context.clearRect(0, 0, width, height);
    const time = Date.now() * 0.00015;

    for (const star of stars) {
      star.y += star.speed;
      if (star.y > height + 4) {
        star.y = -4;
        star.x = Math.random() * width;
      }

      const twinkle = 0.35 + 0.65 * Math.abs(Math.sin(time + star.x * 0.01));
      context.beginPath();
      context.fillStyle = `rgba(255, 255, 255, ${star.alpha * twinkle})`;
      context.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      context.fill();
    }

    if (!shooting && Math.random() < 0.012) {
      const dpr = window.devicePixelRatio || 1;
      shooting = {
        x: Math.random() * width * 0.8,
        y: Math.random() * height * 0.25,
        vx: (8 + Math.random() * 7) * dpr,
        vy: (4 + Math.random() * 3) * dpr,
        life: 1,
      };
    }

    if (shooting) {
      context.beginPath();
      context.strokeStyle = `rgba(123, 232, 255, ${shooting.life})`;
      context.lineWidth = 2 * (window.devicePixelRatio || 1);
      context.moveTo(shooting.x, shooting.y);
      context.lineTo(shooting.x - shooting.vx * 4, shooting.y - shooting.vy * 4);
      context.stroke();
      shooting.x += shooting.vx;
      shooting.y += shooting.vy;
      shooting.life -= 0.018;
      if (shooting.life <= 0) shooting = null;
    }

    requestAnimationFrame(drawStars);
  }

  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();
  drawStars();
}
