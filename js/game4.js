(() => {
  if (!window.Promposal.initPage({ pageId: "game4" })) {
    return;
  }

  const TOTAL_BEATS = 12;
  const BEAT_INTERVAL = 900;
  const START_DELAY = 1000;
  const GREAT_WINDOW = 180;
  const PASS_THRESHOLD = 8;

  const startBtn = document.getElementById("startBtn");
  const tapBtn = document.getElementById("tapBtn");
  const retryBtn = document.getElementById("retryBtn");
  const nextBtn = document.getElementById("nextBtn");
  const beatTrack = document.getElementById("beatTrack");
  const ring = document.getElementById("ring");
  const statusNode = document.getElementById("statusText");
  const greatNode = document.getElementById("greatHits");
  const beatCountNode = document.getElementById("beatCount");

  let dots = [];
  let running = false;
  let beatPulseCount = 0;
  let greatHits = 0;
  let consumedBeats = new Set();
  let startTime = 0;
  let pulseTimer = null;

  function createTrack() {
    beatTrack.innerHTML = "";
    dots = [];

    for (let i = 0; i < TOTAL_BEATS; i += 1) {
      const dot = document.createElement("span");
      dot.className = "beat-dot";
      beatTrack.appendChild(dot);
      dots.push(dot);
    }
  }

  function updateMeta() {
    greatNode.textContent = String(greatHits);
    beatCountNode.textContent = String(beatPulseCount);
  }

  function markDot(index, type) {
    const dot = dots[index];
    if (!dot) {
      return;
    }
    dot.classList.remove("hit", "miss");
    dot.classList.add(type);
  }

  function clearRun() {
    running = false;
    consumedBeats = new Set();
    beatPulseCount = 0;
    greatHits = 0;
    updateMeta();
    if (pulseTimer) {
      window.clearTimeout(pulseTimer);
      pulseTimer = null;
    }
    tapBtn.disabled = true;
    startBtn.disabled = false;
  }

  function evaluateRun() {
    running = false;
    tapBtn.disabled = true;
    startBtn.disabled = false;

    for (let i = 0; i < TOTAL_BEATS; i += 1) {
      if (!consumedBeats.has(i)) {
        markDot(i, "miss");
      }
    }

    window.Promposal.setScore("game4", greatHits);

    if (greatHits >= PASS_THRESHOLD) {
      window.Promposal.markCompleted("game4", greatHits);
      statusNode.textContent = `Rhythm perfect. ${greatHits} Great hits.`;
      statusNode.classList.add("success");
      statusNode.classList.remove("error");
      nextBtn.classList.remove("hidden");
    } else {
      statusNode.textContent = `You got ${greatHits} Great hits. Need ${PASS_THRESHOLD}.`;
      statusNode.classList.add("error");
      statusNode.classList.remove("success");
      nextBtn.classList.add("hidden");
    }

    retryBtn.classList.remove("hidden");
  }

  function pulseBeat() {
    if (!running) {
      return;
    }

    ring.classList.remove("pulse");
    // Force restart animation frame for pulse effect.
    void ring.offsetWidth;
    ring.classList.add("pulse");

    beatPulseCount += 1;
    updateMeta();

    if (beatPulseCount >= TOTAL_BEATS) {
      pulseTimer = window.setTimeout(evaluateRun, BEAT_INTERVAL - 120);
      return;
    }

    pulseTimer = window.setTimeout(pulseBeat, BEAT_INTERVAL);
  }

  function startRun() {
    clearRun();
    createTrack();

    running = true;
    tapBtn.disabled = false;
    startBtn.disabled = true;
    retryBtn.classList.add("hidden");
    nextBtn.classList.add("hidden");
    statusNode.textContent = "Catch the pulse. Tap close to each beat.";
    statusNode.classList.remove("success", "error");

    startTime = performance.now() + START_DELAY;
    pulseTimer = window.setTimeout(pulseBeat, START_DELAY);
  }

  function onTap() {
    if (!running) {
      return;
    }

    const now = performance.now();
    const relative = now - startTime;
    const beatIndex = Math.round(relative / BEAT_INTERVAL);

    if (beatIndex < 0 || beatIndex >= TOTAL_BEATS || consumedBeats.has(beatIndex)) {
      return;
    }

    const targetTime = startTime + beatIndex * BEAT_INTERVAL;
    const delta = Math.abs(now - targetTime);

    consumedBeats.add(beatIndex);
    if (delta <= GREAT_WINDOW) {
      greatHits += 1;
      markDot(beatIndex, "hit");
      statusNode.textContent = "Great timing!";
      statusNode.classList.remove("error");
      statusNode.classList.add("success");
    } else {
      markDot(beatIndex, "miss");
      statusNode.textContent = "Missed the timing window.";
      statusNode.classList.remove("success");
      statusNode.classList.add("error");
    }

    updateMeta();
  }

  startBtn.addEventListener("click", startRun);
  retryBtn.addEventListener("click", startRun);
  tapBtn.addEventListener("click", onTap);

  nextBtn.addEventListener("click", () => {
    window.Promposal.goTo("game5.html");
  });

  createTrack();
  updateMeta();
})();
