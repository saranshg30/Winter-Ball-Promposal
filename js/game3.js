(() => {
  if (!window.Promposal.initPage({ pageId: "game3" })) {
    return;
  }

  const photoPaths = window.Promposal.config.photoPaths || [];
  const revealSequence = [0, 4, 2].filter((idx) => idx < photoPaths.length);

  const memoryImage = document.getElementById("memoryImage");
  const memoryPrompt = document.getElementById("memoryPrompt");
  const startBtn = document.getElementById("startBtn");
  const thumbGrid = document.getElementById("thumbGrid");
  const selectionZone = document.getElementById("selectionZone");
  const selectedSequence = document.getElementById("selectedSequence");
  const attemptsLeftNode = document.getElementById("attemptsLeft");
  const selectedCountNode = document.getElementById("selectedCount");
  const statusNode = document.getElementById("statusText");
  const retryBtn = document.getElementById("retryBtn");
  const nextBtn = document.getElementById("nextBtn");

  let attemptsLeft = 3;
  let selected = [];
  let acceptingInput = false;

  function updateCounters() {
    attemptsLeftNode.textContent = String(attemptsLeft);
    selectedCountNode.textContent = String(selected.length);
  }

  function clearSelection() {
    selected = [];
    selectedSequence.innerHTML = "";
    selectedCountNode.textContent = "0";
    thumbGrid.querySelectorAll(".badge").forEach((badge) => {
      badge.textContent = "";
      badge.classList.add("hidden");
    });
  }

  function renderSelectedChips() {
    selectedSequence.innerHTML = "";
    selected.forEach((idx, order) => {
      const chip = document.createElement("span");
      chip.className = "sequence-chip";
      chip.textContent = `#${order + 1} · Photo ${idx + 1}`;
      selectedSequence.appendChild(chip);
    });
  }

  function disableThumbs(disabled) {
    thumbGrid.querySelectorAll("button").forEach((btn) => {
      btn.disabled = disabled;
    });
  }

  function showSuccess() {
    const score = attemptsLeft;
    window.Promposal.setScore("game3", score);
    window.Promposal.markCompleted("game3", score);

    statusNode.textContent = "Flashback Blitz cleared. You remembered every beat.";
    statusNode.classList.add("success");
    statusNode.classList.remove("error");
    nextBtn.classList.remove("hidden");
    retryBtn.classList.add("hidden");
    memoryPrompt.textContent = "Perfect recall.";
    disableThumbs(true);
    acceptingInput = false;
  }

  function showFailure() {
    window.Promposal.setScore("game3", 0);
    statusNode.textContent = "Out of attempts. Replay the reel and try again.";
    statusNode.classList.add("error");
    statusNode.classList.remove("success");
    retryBtn.classList.remove("hidden");
    nextBtn.classList.add("hidden");
    memoryPrompt.textContent = "No worries. Replay the reel.";
    acceptingInput = false;
    disableThumbs(true);
  }

  function evaluateSelection() {
    const matched = selected.every((value, index) => value === revealSequence[index]);

    if (matched) {
      showSuccess();
      return;
    }

    attemptsLeft -= 1;
    updateCounters();

    if (attemptsLeft <= 0) {
      showFailure();
      return;
    }

    statusNode.textContent = `Wrong order. ${attemptsLeft} attempt(s) left.`;
    statusNode.classList.add("error");
    statusNode.classList.remove("success");
    acceptingInput = false;
    disableThumbs(true);

    window.setTimeout(() => {
      clearSelection();
      acceptingInput = true;
      disableThumbs(false);
      statusNode.textContent = "Try the sequence again.";
      statusNode.classList.remove("error");
    }, 700);
  }

  function onThumbSelect(index, badge) {
    if (!acceptingInput || selected.length >= revealSequence.length) {
      return;
    }

    selected.push(index);
    badge.textContent = String(selected.length);
    badge.classList.remove("hidden");
    renderSelectedChips();
    updateCounters();

    if (selected.length === revealSequence.length) {
      evaluateSelection();
    }
  }

  function renderThumbs() {
    thumbGrid.innerHTML = "";
    const indexes = window.Promposal.shuffle(photoPaths.map((_path, idx) => idx));

    indexes.forEach((index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "thumb-btn";

      const image = document.createElement("img");
      image.src = photoPaths[index];
      image.alt = `Memory photo ${index + 1}`;
      image.loading = "lazy";

      const badge = document.createElement("span");
      badge.className = "badge hidden";

      button.appendChild(image);
      button.appendChild(badge);
      button.addEventListener("click", () => onThumbSelect(index, badge));

      thumbGrid.appendChild(button);
    });
  }

  function revealFrame(index, step, total) {
    memoryImage.src = photoPaths[index] || photoPaths[0] || "";
    memoryPrompt.textContent = `Memory ${step}/${total}`;
  }

  async function playReel() {
    if (photoPaths.length < 3 || revealSequence.length < 3) {
      statusNode.textContent = "Add at least 3 photos in assets/images to play this level.";
      statusNode.classList.add("error");
      return;
    }

    startBtn.disabled = true;
    retryBtn.classList.add("hidden");
    nextBtn.classList.add("hidden");
    selectionZone.classList.add("hidden");
    clearSelection();
    acceptingInput = false;

    statusNode.textContent = "Watch carefully...";
    statusNode.classList.remove("error", "success");

    for (let i = 0; i < revealSequence.length; i += 1) {
      revealFrame(revealSequence[i], i + 1, revealSequence.length);
      await new Promise((resolve) => window.setTimeout(resolve, 1450));
    }

    memoryPrompt.textContent = "Now tap the same 3 photos in order.";
    renderThumbs();
    selectionZone.classList.remove("hidden");
    disableThumbs(false);
    acceptingInput = true;
    startBtn.disabled = false;
  }

  function resetLevel() {
    attemptsLeft = 3;
    updateCounters();
    clearSelection();
    statusNode.textContent = "This one tests true memory power.";
    statusNode.classList.remove("error", "success");
    nextBtn.classList.add("hidden");
    retryBtn.classList.add("hidden");
    playReel();
  }

  startBtn.addEventListener("click", () => {
    attemptsLeft = 3;
    updateCounters();
    playReel();
  });

  retryBtn.addEventListener("click", resetLevel);

  nextBtn.addEventListener("click", () => {
    window.Promposal.goTo("game4.html");
  });

  updateCounters();
})();
