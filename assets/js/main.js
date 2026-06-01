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

document.querySelectorAll(".channel-avatar img").forEach((image) => {
  image.src = "./assets/images/youtube-play-with-aarnav.jpg";
  image.alt = "Play With Aarnav YouTube channel photo";
});

const currentPage = window.location.pathname.split("/").pop() || "index.html";

if (currentPage === "books.html") {
  document.querySelectorAll(".grid").forEach((grid) => {
    const hasBookCards = grid.querySelector(".book-card");
    const hasTreasureIsland = Array.from(grid.querySelectorAll(".book-card h3")).some((heading) => heading.textContent.trim() === "Treasure Island");
    const hasSherlockHolmes = Array.from(grid.querySelectorAll(".book-card h3")).some((heading) => heading.textContent.trim() === "Sherlock Holmes");

    if (!hasBookCards || !hasTreasureIsland || hasSherlockHolmes) return;

    const card = document.createElement("article");
    card.className = "book-card delay-4";
    card.dataset.reveal = "";
    card.innerHTML = `
      <figure class="book-cover">
        <img src="./assets/images/sherlock homes.jpg" alt="Sherlock Holmes book cover">
      </figure>
      <div class="book-content">
        <span class="book-meta">Arthur Conan Doyle &middot; Mystery</span>
        <h3>Sherlock Holmes</h3>
        <p>A detective classic full of observation, logic, and sharp twists. Holmes makes problem-solving feel clever, calm, and exciting.</p>
      </div>
    `;
    grid.append(card);
  });
}

if (currentPage === "places.html") {
  const placesGrid = document.querySelector(".grid.three");
  const existingPlaces = new Set(Array.from(document.querySelectorAll(".place-card h3")).map((heading) => heading.textContent.trim()));
  const placesToAdd = [
    {
      className: "place-card delay-1",
      image: "./assets/images/belur muth.jpg",
      alt: "Belur Math",
      meta: "Belur Math &middot; Kolkata",
      title: "Belur Math",
      copy: "A peaceful riverside landmark with grand architecture, calm gardens, and a spiritual atmosphere that feels steady and reflective.",
    },
    {
      className: "place-card delay-2",
      image: "./assets/images/daksh mandir.jpg",
      alt: "Dakshineswar Kali Temple",
      meta: "Dakshineswar &middot; Kolkata",
      title: "Dakshineswar Kali Temple",
      copy: "A powerful temple visit with classic Bengal architecture, devotional energy, and the Hooghly river adding a quiet sense of scale.",
    },
    {
      className: "place-card",
      image: "./assets/images/victorial memorial.jpg",
      alt: "Victoria Memorial",
      meta: "Maidan &middot; Kolkata",
      title: "Victoria Memorial",
      copy: "One of Kolkata's most iconic sights, with white marble, open lawns, and a historic mood that feels royal, cinematic, and timeless.",
    },
  ];

  if (placesGrid) {
    placesToAdd.forEach((place) => {
      if (existingPlaces.has(place.title)) return;

      const card = document.createElement("article");
      card.className = place.className;
      card.dataset.reveal = "";
      card.innerHTML = `
        <figure class="place-image">
          <img src="${place.image}" alt="${place.alt}">
        </figure>
        <div class="place-content">
          <span class="place-meta">${place.meta}</span>
          <h3>${place.title}</h3>
          <p>${place.copy}</p>
        </div>
      `;
      placesGrid.append(card);
      existingPlaces.add(place.title);
    });
  }
}

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
let pauseBackgroundMusicForVideo = () => {};
let resumeBackgroundMusicAfterVideo = () => {};

if (audio && audioToggle) {
  const audioPlaylist = [
    { title: "Minecraft Theme", src: "./assets/audio/minecraft-theme.mp3" },
    { title: "Subwoofer Lullaby", src: "./assets/audio/1-03. Subwoofer Lullaby.mp3" },
    { title: "Haggstrom", src: "./assets/audio/1-07. Haggstrom.mp3" },
    { title: "Biome Fest", src: "./assets/audio/2-08. Biome Fest.mp3" },
  ];
  const audioStateKey = "aarnav-bgm-state";
  const audioTrackKey = "aarnav-bgm-track";
  const audioTimeKey = "aarnav-bgm-time";
  let isLeavingPage = false;
  let isChangingTrack = false;
  let isVideoPausingMusic = false;
  let shouldResumeAfterVideo = false;
  const savedAudioTimeOnLoad = Number.parseFloat(localStorage.getItem(audioTimeKey) || "0");
  let hasRestoredAudioTime = !(Number.isFinite(savedAudioTimeOnLoad) && savedAudioTimeOnLoad > 0);

  audio.volume = 0.26;
  audio.preload = "auto";
  audio.loop = false;

  const audioPopover = document.createElement("div");
  audioPopover.className = "audio-popover";
  audioPopover.innerHTML = `
    <strong>Music queue</strong>
    <p>Choose a track. The playlist keeps looping all four songs.</p>
    <div class="audio-track-list"></div>
    <button class="audio-pause-control" type="button">Pause music</button>
  `;
  audioToggle.insertAdjacentElement("afterend", audioPopover);

  const audioTrackList = audioPopover.querySelector(".audio-track-list");
  const audioPauseControl = audioPopover.querySelector(".audio-pause-control");

  const getSavedTrackIndex = () => {
    const savedIndex = Number.parseInt(localStorage.getItem(audioTrackKey) || "0", 10);
    return Number.isInteger(savedIndex) && savedIndex >= 0 && savedIndex < audioPlaylist.length ? savedIndex : 0;
  };

  let currentTrackIndex = getSavedTrackIndex();
  audio.src = audioPlaylist[currentTrackIndex].src;

  const syncAudioButton = (isPlaying) => {
    audioToggle.classList.toggle("is-playing", isPlaying);
    audioToggle.classList.toggle("needs-tap", false);
    audioToggle.setAttribute("aria-label", isPlaying ? "Open music controls" : "Play background music");
  };

  const syncAudioPopover = () => {
    audioPopover.querySelectorAll(".audio-track").forEach((button, index) => {
      button.classList.toggle("is-active", index === currentTrackIndex);
      button.setAttribute("aria-current", index === currentTrackIndex ? "true" : "false");
    });

    if (audioPauseControl) {
      audioPauseControl.textContent = audio.paused ? "Resume music" : "Pause music";
    }
  };

  if (audioTrackList) {
    audioTrackList.innerHTML = audioPlaylist
      .map((track, index) => `<button class="audio-track" type="button" data-track-index="${index}"><span>${String(index + 1).padStart(2, "0")}</span>${track.title}</button>`)
      .join("");
  }

  const openAudioPopover = () => {
    audioPopover.classList.add("is-open");
    syncAudioPopover();
  };

  const closeAudioPopover = () => {
    audioPopover.classList.remove("is-open");
  };

  const toggleAudioPopover = () => {
    audioPopover.classList.toggle("is-open");
    syncAudioPopover();
  };

  const saveAudioTime = () => {
    localStorage.setItem(audioTrackKey, String(currentTrackIndex));

    if (!hasRestoredAudioTime && Number.isFinite(savedAudioTimeOnLoad) && savedAudioTimeOnLoad > 0 && audio.currentTime < 1) {
      return;
    }

    if (Number.isFinite(audio.currentTime)) {
      localStorage.setItem(audioTimeKey, String(audio.currentTime));
    }
  };

  const restoreAudioTime = () => {
    const savedTime = Number.isFinite(savedAudioTimeOnLoad) && savedAudioTimeOnLoad > 0 ? savedAudioTimeOnLoad : Number.parseFloat(localStorage.getItem(audioTimeKey) || "0");
    if (!Number.isFinite(savedTime) || savedTime <= 0) return;

    const duration = Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : null;
    audio.currentTime = duration ? savedTime % duration : savedTime;
    hasRestoredAudioTime = true;
  };

  const loadTrack = (trackIndex, { restoreTime = false } = {}) => {
    isChangingTrack = true;
    currentTrackIndex = (trackIndex + audioPlaylist.length) % audioPlaylist.length;
    audio.src = audioPlaylist[currentTrackIndex].src;
    localStorage.setItem(audioTrackKey, String(currentTrackIndex));

    if (restoreTime) {
      if (audio.readyState >= 1) {
        restoreAudioTime();
      } else {
        audio.addEventListener("loadedmetadata", restoreAudioTime, { once: true });
      }
    } else {
      localStorage.setItem(audioTimeKey, "0");
      hasRestoredAudioTime = true;
    }

    isChangingTrack = false;
    syncAudioPopover();
  };

  if (audio.readyState >= 1) {
    restoreAudioTime();
  } else {
    audio.addEventListener("loadedmetadata", restoreAudioTime, { once: true });
  }

  const playBackgroundMusic = async ({ fromUser = false } = {}) => {
    try {
      if (!hasRestoredAudioTime) {
        restoreAudioTime();
      }

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
      toggleAudioPopover();
    }
  });

  audioTrackList?.addEventListener("click", async (event) => {
    const trackButton = event.target.closest("[data-track-index]");
    if (!trackButton) return;

    loadTrack(Number.parseInt(trackButton.dataset.trackIndex || "0", 10));
    await playBackgroundMusic({ fromUser: true });
    openAudioPopover();
  });

  audioPauseControl?.addEventListener("click", async () => {
    if (audio.paused) {
      await playBackgroundMusic({ fromUser: true });
    } else {
      saveAudioTime();
      localStorage.setItem(audioStateKey, "paused");
      audio.pause();
      syncAudioButton(false);
    }

    syncAudioPopover();
  });

  audio.addEventListener("play", () => {
    syncAudioButton(true);
    syncAudioPopover();
  });
  audio.addEventListener("timeupdate", saveAudioTime);
  audio.addEventListener("ended", () => {
    loadTrack(currentTrackIndex + 1);
    playBackgroundMusic();
  });
  audio.addEventListener("pause", () => {
    syncAudioPopover();
    if (isLeavingPage || isChangingTrack || isVideoPausingMusic || audio.ended) return;
    saveAudioTime();
    localStorage.setItem(audioStateKey, "paused");
    syncAudioButton(false);
  });

  window.addEventListener("pagehide", () => {
    isLeavingPage = true;
    const shouldKeepPlaying = localStorage.getItem(audioStateKey) === "playing" || !audio.paused;
    saveAudioTime();
    localStorage.setItem(audioStateKey, shouldKeepPlaying ? "playing" : "paused");
  });

  window.addEventListener("beforeunload", () => {
    isLeavingPage = true;
    const shouldKeepPlaying = localStorage.getItem(audioStateKey) === "playing" || !audio.paused;
    saveAudioTime();
    localStorage.setItem(audioStateKey, shouldKeepPlaying ? "playing" : "paused");
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

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".audio-toggle") && !event.target.closest(".audio-popover")) {
      closeAudioPopover();
    }
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

  pauseBackgroundMusicForVideo = () => {
    if (audio.paused) return;

    closeAudioPopover();
    shouldResumeAfterVideo = true;
    isVideoPausingMusic = true;
    saveAudioTime();
    audio.pause();
    isVideoPausingMusic = false;
    syncAudioButton(false);
    syncAudioPopover();
  };

  resumeBackgroundMusicAfterVideo = () => {
    if (!shouldResumeAfterVideo || !audio.paused) return;

    shouldResumeAfterVideo = false;
    playBackgroundMusic();
  };

  syncAudioPopover();
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
let youtubePlayer = null;
let youtubeApiPromise = null;

function loadYouTubeApi() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (youtubeApiPromise) return youtubeApiPromise;

  youtubeApiPromise = new Promise((resolve) => {
    const previousReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previousReady?.();
      resolve(window.YT);
    };

    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      document.head.append(script);
    }
  });

  return youtubeApiPromise;
}

async function connectYouTubePlayer(iframeId) {
  const YT = await loadYouTubeApi();
  const iframe = document.querySelector(`#${iframeId}`);
  if (!iframe) return;

  youtubePlayer = new YT.Player(iframeId, {
    events: {
      onStateChange(event) {
        if (event.data === YT.PlayerState.PLAYING) {
          pauseBackgroundMusicForVideo();
        }

        if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) {
          resumeBackgroundMusicAfterVideo();
        }
      },
    },
  });
}

function closeVideoModal() {
  if (!videoModal || !videoModalBody) return;
  youtubePlayer?.destroy?.();
  youtubePlayer = null;
  resumeBackgroundMusicAfterVideo();
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

    pauseBackgroundMusicForVideo();
    videoModalBody.innerHTML = `
      <div class="modal-frame">
        <iframe
          id="youtubePlayerFrame"
          title="${title}"
          src="https://www.youtube.com/embed/${safeId}?${embedParams.toString()}"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerpolicy="origin-when-cross-origin"
          allowfullscreen></iframe>
      </div>
    `;
    connectYouTubePlayer("youtubePlayerFrame");
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
