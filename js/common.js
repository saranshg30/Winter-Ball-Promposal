(() => {
  const CONFIG = window.PROMPOSAL_CONFIG || {};
  const STATE_KEY = "promposal_state_v1";
  const SCORE_KEYS = ["game1", "game2", "game3", "game4", "game5"];

  let bgAudio = null;
  let pendingAudioSeek = null;
  let lastAudioPersistAt = 0;
  let interactionRegistered = false;

  function defaultState() {
    return {
      completedPages: [],
      scores: {
        game1: 0,
        game2: 0,
        game3: 0,
        game4: 0,
        game5: 0
      },
      noButtonDodges: 0,
      startedAt: new Date().toISOString(),
      audioEnabled: Boolean(CONFIG.audioEnabledByDefault),
      audioTime: 0
    };
  }

  function sanitizeState(raw) {
    const fallback = defaultState();
    const state = raw && typeof raw === "object" ? raw : {};

    const completed = Array.isArray(state.completedPages)
      ? state.completedPages.filter((page) => SCORE_KEYS.includes(page))
      : [];

    const scores = { ...fallback.scores, ...(state.scores || {}) };
    SCORE_KEYS.forEach((key) => {
      const val = Number(scores[key]);
      scores[key] = Number.isFinite(val) ? val : 0;
    });

    const noButtonDodges = Number.isFinite(Number(state.noButtonDodges))
      ? Number(state.noButtonDodges)
      : 0;

    const startedAt = typeof state.startedAt === "string" ? state.startedAt : fallback.startedAt;
    const audioEnabled = typeof state.audioEnabled === "boolean" ? state.audioEnabled : fallback.audioEnabled;
    const audioTime = Number.isFinite(Number(state.audioTime)) && Number(state.audioTime) >= 0
      ? Number(state.audioTime)
      : 0;

    return {
      completedPages: completed,
      scores,
      noButtonDodges,
      startedAt,
      audioEnabled,
      audioTime
    };
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STATE_KEY);
      if (!raw) {
        const fresh = defaultState();
        localStorage.setItem(STATE_KEY, JSON.stringify(fresh));
        return fresh;
      }
      const parsed = JSON.parse(raw);
      const sanitized = sanitizeState(parsed);
      localStorage.setItem(STATE_KEY, JSON.stringify(sanitized));
      return sanitized;
    } catch (_error) {
      const fresh = defaultState();
      localStorage.setItem(STATE_KEY, JSON.stringify(fresh));
      return fresh;
    }
  }

  function saveState(state) {
    localStorage.setItem(STATE_KEY, JSON.stringify(sanitizeState(state)));
  }

  function updateState(mutator) {
    const state = loadState();
    const nextState = mutator({ ...state, scores: { ...state.scores }, completedPages: [...state.completedPages] });
    saveState(nextState);
    updateProgressLabels();
    updateAudioToggleLabels();
    return nextState;
  }

  function setScore(page, score) {
    if (!SCORE_KEYS.includes(page)) {
      return;
    }
    updateState((state) => {
      state.scores[page] = Number(score) || 0;
      return state;
    });
  }

  function markCompleted(page, score) {
    if (!SCORE_KEYS.includes(page)) {
      return;
    }
    updateState((state) => {
      if (!state.completedPages.includes(page)) {
        state.completedPages.push(page);
      }
      if (typeof score === "number") {
        state.scores[page] = score;
      }
      return state;
    });
  }

  function isCompleted(page) {
    return loadState().completedPages.includes(page);
  }

  function allGamesCompleted() {
    const state = loadState();
    return SCORE_KEYS.every((page) => state.completedPages.includes(page));
  }

  function resetProgress() {
    saveState(defaultState());
  }

  function requiredRedirect(pageId) {
    if (!pageId) {
      return null;
    }

    if (pageId === "game1") {
      return null;
    }

    if (pageId === "finale") {
      return allGamesCompleted() ? null : "game5.html";
    }

    const index = SCORE_KEYS.indexOf(pageId);
    if (index <= 0) {
      return null;
    }

    const previous = SCORE_KEYS[index - 1];
    return isCompleted(previous) ? null : `${previous}.html`;
  }

  function requirePageAccess(pageId) {
    const redirect = requiredRedirect(pageId);
    if (!redirect) {
      return true;
    }
    window.location.replace(redirect);
    return false;
  }

  function goTo(url) {
    persistAudioTime(true);
    document.body.classList.add("page-exit");
    window.setTimeout(() => {
      window.location.href = url;
    }, 240);
  }

  function updateConfigText() {
    document.querySelectorAll("[data-partner-name]").forEach((node) => {
      node.textContent = CONFIG.partnerName || "Tanvi";
    });

    document.querySelectorAll("[data-event-name]").forEach((node) => {
      node.textContent = CONFIG.eventName || "Winter Ball";
    });

    document.querySelectorAll("[data-venue]").forEach((node) => {
      node.textContent = CONFIG.venue || "Ashoka University";
    });

    document.querySelectorAll("[data-event-date]").forEach((node) => {
      node.textContent = CONFIG.eventDateLong || "19 February 2026";
    });

    document.querySelectorAll("[data-signature]").forEach((node) => {
      node.textContent = CONFIG.signature || "From me, Wha-";
    });
  }

  function updateProgressLabels() {
    const state = loadState();
    const done = state.completedPages.length;
    const total = SCORE_KEYS.length;

    document.querySelectorAll("[data-progress]").forEach((node) => {
      node.textContent = `${done}/${total} levels cleared`;
    });
  }

  function getAudioPath() {
    return CONFIG.audioPath || "assets/audio/raabta-darasal-2017.mp3";
  }

  function applyPendingAudioSeek() {
    if (!bgAudio || pendingAudioSeek === null) {
      return;
    }

    const hasDuration = Number.isFinite(bgAudio.duration) && bgAudio.duration > 0;
    const target = hasDuration ? Math.min(pendingAudioSeek, Math.max(0, bgAudio.duration - 0.2)) : pendingAudioSeek;

    try {
      bgAudio.currentTime = target;
      pendingAudioSeek = null;
    } catch (_error) {
      // Some browsers throw before metadata is fully ready.
    }
  }

  function restoreAudioTimeFromState() {
    const state = loadState();
    const resumeTime = Number(state.audioTime);
    if (!Number.isFinite(resumeTime) || resumeTime <= 0) {
      return;
    }

    pendingAudioSeek = resumeTime;
    applyPendingAudioSeek();
  }

  function persistAudioTime(force = false) {
    if (!bgAudio || !Number.isFinite(bgAudio.currentTime)) {
      return;
    }

    const now = Date.now();
    if (!force && now - lastAudioPersistAt < 350) {
      return;
    }

    lastAudioPersistAt = now;
    const state = loadState();
    state.audioTime = Math.max(0, Number(bgAudio.currentTime) || 0);
    saveState(state);
  }

  function ensureAudioElement() {
    if (bgAudio) {
      return bgAudio;
    }

    bgAudio = new Audio(getAudioPath());
    bgAudio.loop = true;
    bgAudio.preload = "auto";
    bgAudio.volume = 0.28;

    bgAudio.addEventListener("loadedmetadata", () => {
      applyPendingAudioSeek();
    });
    bgAudio.addEventListener("timeupdate", () => {
      persistAudioTime(false);
    });
    bgAudio.addEventListener("pause", () => {
      persistAudioTime(true);
    });

    window.addEventListener("pagehide", () => {
      persistAudioTime(true);
    });
    window.addEventListener("beforeunload", () => {
      persistAudioTime(true);
    });

    restoreAudioTimeFromState();
    return bgAudio;
  }

  async function setAudioEnabled(enabled) {
    const state = loadState();
    state.audioEnabled = Boolean(enabled);
    saveState(state);

    const audio = ensureAudioElement();
    if (state.audioEnabled) {
      try {
        if (audio.readyState < 1) {
          await new Promise((resolve) => {
            audio.addEventListener("loadedmetadata", resolve, { once: true });
          });
        }
        applyPendingAudioSeek();
        await audio.play();
      } catch (_error) {
        // Browser autoplay policy can block until a user gesture.
      }
    } else {
      audio.pause();
      persistAudioTime(true);
    }

    updateAudioToggleLabels();
  }

  function updateAudioToggleLabels() {
    const enabled = Boolean(loadState().audioEnabled);
    document.querySelectorAll("[data-audio-toggle]").forEach((button) => {
      button.textContent = enabled ? "Sound: On" : "Sound: Off";
      button.setAttribute("aria-pressed", enabled ? "true" : "false");
    });
  }

  function registerFirstInteraction() {
    if (interactionRegistered) {
      return;
    }

    const activate = () => {
      const state = loadState();
      if (state.audioEnabled) {
        void setAudioEnabled(true);
      }
      window.removeEventListener("pointerdown", activate);
      window.removeEventListener("keydown", activate);
    };

    window.addEventListener("pointerdown", activate, { once: true, passive: true });
    window.addEventListener("keydown", activate, { once: true });
    interactionRegistered = true;
  }

  function bindAudioToggles() {
    document.querySelectorAll("[data-audio-toggle]").forEach((button) => {
      button.addEventListener("click", async () => {
        const enabled = !loadState().audioEnabled;
        await setAudioEnabled(enabled);
      });
    });

    updateAudioToggleLabels();
  }

  function bindResetButtons() {
    document.querySelectorAll("[data-reset-progress]").forEach((button) => {
      button.addEventListener("click", () => {
        const confirmReset = window.confirm("Reset quest progress and start over?");
        if (!confirmReset) {
          return;
        }
        const state = loadState();
        const keepAudio = state.audioEnabled;
        resetProgress();
        updateState((fresh) => {
          fresh.audioEnabled = keepAudio;
          return fresh;
        });
        goTo("index.html");
      });
    });
  }

  function initPage(options = {}) {
    const { pageId } = options;

    if (pageId && !requirePageAccess(pageId)) {
      return false;
    }

    updateConfigText();
    updateProgressLabels();
    bindAudioToggles();
    bindResetButtons();
    registerFirstInteraction();

    window.requestAnimationFrame(() => {
      document.body.classList.add("page-ready");
    });

    return true;
  }

  function shuffle(list) {
    const arr = [...list];
    for (let i = arr.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function setNoDodges(count) {
    updateState((state) => {
      state.noButtonDodges = Number(count) || 0;
      return state;
    });
  }

  window.Promposal = {
    STATE_KEY,
    loadState,
    saveState,
    setScore,
    markCompleted,
    isCompleted,
    allGamesCompleted,
    requirePageAccess,
    goTo,
    initPage,
    shuffle,
    setAudioEnabled,
    setNoDodges,
    config: CONFIG
  };
})();
