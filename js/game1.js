(() => {
  if (!window.Promposal.initPage({ pageId: "game1" })) {
    return;
  }

  const DURATION = 20;
  const THRESHOLD = 8;

  const arena = document.getElementById("snowArena");
  const overlay = document.getElementById("overlay");
  const startBtn = document.getElementById("startBtn");
  const retryBtn = document.getElementById("retryBtn");
  const nextBtn = document.getElementById("nextBtn");
  const scoreNode = document.getElementById("score");
  const timeNode = document.getElementById("timeLeft");
  const statusNode = document.getElementById("statusText");

  let score = 0;
  let timeLeft = DURATION;
  let running = false;
  let spawnInterval = null;
  let timerInterval = null;

  function updateMeta() {
    scoreNode.textContent = String(score);
    timeNode.textContent = String(timeLeft);
  }

  function clearArena() {
    arena.querySelectorAll(".falling-item").forEach((item) => item.remove());
  }

  function spawnSnowflake() {
    if (!running) {
      return;
    }

    const flake = document.createElement("button");
    flake.type = "button";
    flake.className = "falling-item";
    flake.textContent = "❄️";

    const left = 5 + Math.random() * 90;
    const fallTime = 6.8 + Math.random() * 3.4;
    flake.style.left = `${left}%`;
    flake.style.top = "-8%";
    flake.style.fontSize = `${1.1 + Math.random() * 1.3}rem`;

    flake.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      if (!running) {
        return;
      }
      score += 1;
      updateMeta();
      flake.remove();
    });

    arena.appendChild(flake);

    window.requestAnimationFrame(() => {
      flake.style.transition = `top ${fallTime}s linear`;
      flake.style.top = "112%";
    });

    window.setTimeout(() => {
      flake.remove();
    }, Math.ceil(fallTime * 1000) + 120);
  }

  function finishGame() {
    running = false;
    window.clearInterval(spawnInterval);
    window.clearInterval(timerInterval);

    clearArena();
    window.Promposal.setScore("game1", score);

    const passed = score >= THRESHOLD;
    if (passed) {
      window.Promposal.markCompleted("game1", score);
      statusNode.textContent = "Level 1 cleared. Hero energy rising.";
      statusNode.classList.add("success");
      statusNode.classList.remove("error");
      nextBtn.classList.remove("hidden");
    } else {
      statusNode.textContent = `You scored ${score}. Need ${THRESHOLD} to pass. Try again.`;
      statusNode.classList.add("error");
      statusNode.classList.remove("success");
      nextBtn.classList.add("hidden");
    }

    retryBtn.classList.remove("hidden");
    overlay.classList.add("hidden");
  }

  function startGame() {
    score = 0;
    timeLeft = DURATION;
    running = true;

    statusNode.textContent = "Catch as many snowflakes as you can.";
    statusNode.classList.remove("success", "error");
    retryBtn.classList.add("hidden");
    nextBtn.classList.add("hidden");
    overlay.classList.add("hidden");

    clearArena();
    updateMeta();

    spawnInterval = window.setInterval(spawnSnowflake, 780);
    timerInterval = window.setInterval(() => {
      timeLeft -= 1;
      updateMeta();
      if (timeLeft <= 0) {
        finishGame();
      }
    }, 1000);
  }

  startBtn.addEventListener("click", startGame);
  retryBtn.addEventListener("click", startGame);
  nextBtn.addEventListener("click", () => {
    window.Promposal.goTo("game2.html");
  });

  updateMeta();
})();
