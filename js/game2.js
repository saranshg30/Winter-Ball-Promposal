(() => {
  if (!window.Promposal.initPage({ pageId: "game2" })) {
    return;
  }

  const DURATION = 30;
  const THRESHOLD = 10;

  const arena = document.getElementById("runnerArena");
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
    arena.querySelectorAll(".runner-item").forEach((item) => item.remove());
  }

  function spawnItem() {
    if (!running) {
      return;
    }

    const isGood = Math.random() < 0.98;
    const item = document.createElement("button");
    item.type = "button";
    item.className = `runner-item${isGood ? "" : " bad"}`;
    item.textContent = isGood ? "❤️" : "💔";

    const top = 12 + Math.random() * 76;
    const duration = 10 + Math.random() * 4;

    item.style.left = "-8%";
    item.style.top = `${top}%`;
    item.style.fontSize = `${1.8 + Math.random() * 1.2}rem`;

    item.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      if (!running) {
        return;
      }
      if (isGood) {
        score += 1;
      }
      updateMeta();
      item.remove();

      if (score >= THRESHOLD) {
        finishGame();
      }
    });

    arena.appendChild(item);

    window.requestAnimationFrame(() => {
      item.style.transition = `left ${duration}s linear`;
      item.style.left = "110%";
    });

    window.setTimeout(() => {
      item.remove();
    }, Math.ceil(duration * 1000) + 120);
  }

  function finishGame() {
    running = false;
    window.clearInterval(spawnInterval);
    window.clearInterval(timerInterval);

    clearArena();
    window.Promposal.setScore("game2", score);

    const passed = score >= THRESHOLD;
    if (passed) {
      window.Promposal.markCompleted("game2", score);
      statusNode.textContent = "Heart Runner complete. Memory gate unlocked.";
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

    statusNode.textContent = "Easy mode: catch hearts, and ignore broken hearts.";
    statusNode.classList.remove("success", "error");
    retryBtn.classList.add("hidden");
    nextBtn.classList.add("hidden");
    overlay.classList.add("hidden");

    clearArena();
    updateMeta();

    spawnInterval = window.setInterval(spawnItem, 1300);
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
    window.Promposal.goTo("game3.html");
  });

  updateMeta();
})();
