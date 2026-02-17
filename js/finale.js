(() => {
  if (!window.Promposal.initPage({ pageId: "finale" })) {
    return;
  }

  const yesBtn = document.getElementById("yesBtn");
  const noBtn = document.getElementById("noBtn");
  const choiceButtons = document.getElementById("choiceButtons");
  const statusNode = document.getElementById("statusText");
  const celebration = document.getElementById("celebration");
  const confettiLayer = document.getElementById("confettiLayer");
  const questionText = document.getElementById("questionText");
  const noChallenge = document.getElementById("noChallenge");

  let dodges = window.Promposal.loadState().noButtonDodges || 0;

  function updateNoButtonLabel() {
    if (dodges >= 5) {
      noBtn.textContent = `Nice try, ${window.Promposal.config.partnerName || "Tanvi"} 😄`;
      if (noChallenge) {
        noChallenge.textContent = "You caught it. Challenge complete.";
      }
    } else {
      noBtn.textContent = "No";
      if (noChallenge) {
        noChallenge.textContent = "Click NO if you can.";
      }
    }
  }

  function moveNoButton() {
    const containerRect = choiceButtons.getBoundingClientRect();
    const buttonRect = noBtn.getBoundingClientRect();

    const maxLeft = Math.max(0, containerRect.width - buttonRect.width - 10);
    const maxTop = Math.max(0, containerRect.height - buttonRect.height - 10);

    const nextLeft = 5 + Math.random() * maxLeft;
    const nextTop = 5 + Math.random() * maxTop;

    noBtn.style.left = `${nextLeft}px`;
    noBtn.style.top = `${nextTop}px`;
    noBtn.style.transform = "none";
  }

  function registerDodge(event) {
    if (dodges >= 5) {
      return;
    }

    event.preventDefault();
    dodges += 1;
    window.Promposal.setNoDodges(dodges);

    if (dodges >= 5) {
      updateNoButtonLabel();
      statusNode.textContent = `No button is done running. It says: Nice try, ${window.Promposal.config.partnerName || "Tanvi"} 😄`;
      statusNode.classList.remove("error");
      statusNode.classList.add("success");
      return;
    }

    statusNode.textContent = "Nope. You have to catch it first.";
    statusNode.classList.remove("success");
    statusNode.classList.add("error");

    moveNoButton();
  }

  function burstConfetti(count) {
    const colors = ["#ffd38c", "#d85563", "#54d07d", "#8fd0ff", "#fff2d2"];

    for (let i = 0; i < count; i += 1) {
      const piece = document.createElement("span");
      piece.className = "confetti";
      piece.style.left = `${Math.random() * 100}vw`;
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      piece.style.animationDuration = `${2.8 + Math.random() * 2.2}s`;
      piece.style.animationDelay = `${Math.random() * 0.5}s`;
      piece.style.transform = `translateY(-30px) rotate(${Math.random() * 80}deg)`;
      confettiLayer.appendChild(piece);

      window.setTimeout(() => {
        piece.remove();
      }, 5300);
    }
  }

  function celebrateYes() {
    statusNode.textContent = "Best choice made.";
    statusNode.classList.add("success");
    statusNode.classList.remove("error");

    celebration.classList.remove("hidden");
    yesBtn.disabled = true;
    noBtn.disabled = true;
    yesBtn.textContent = "Yesss 💛";
    if (noChallenge) {
      noChallenge.classList.add("hidden");
    }

    questionText.style.textShadow = "0 0 28px rgba(232,168,61,0.55)";
    questionText.style.transform = "scale(1.02)";
    questionText.style.transition = "transform 0.35s ease, text-shadow 0.35s ease";

    burstConfetti(140);
    window.setTimeout(() => burstConfetti(90), 580);
  }

  noBtn.addEventListener("mouseenter", registerDodge);
  noBtn.addEventListener("pointerdown", registerDodge);
  noBtn.addEventListener("click", registerDodge);

  yesBtn.addEventListener("click", celebrateYes);

  updateNoButtonLabel();
  if (dodges < 5) {
    statusNode.textContent = "Click NO if you can, or hit Yes.";
  }
})();
