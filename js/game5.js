(() => {
  if (!window.Promposal.initPage({ pageId: "game5" })) {
    return;
  }

  const targetCode = (window.Promposal.config.finalCode || "TANVI19022026").toUpperCase();
  const partnerName = (window.Promposal.config.partnerName || "TANVI").toUpperCase();
  const eventName = (window.Promposal.config.eventName || "WINTER BALL").toUpperCase();
  const venue = (window.Promposal.config.venue || "ASHOKA UNIVERSITY").toUpperCase();
  const dateDigits = (window.Promposal.config.eventDateLong || "19 February 2026").replace(/\D/g, "");

  const codeInput = document.getElementById("codeInput");
  const submitBtn = document.getElementById("submitBtn");
  const autoUnlockBtn = document.getElementById("autoUnlockBtn");
  const statusNode = document.getElementById("statusText");
  const nextBtn = document.getElementById("nextBtn");

  function openLock(message) {
    window.Promposal.setScore("game5", 1);
    window.Promposal.markCompleted("game5", 1);

    statusNode.textContent = message;
    statusNode.classList.add("success");
    statusNode.classList.remove("error");

    codeInput.disabled = true;
    submitBtn.disabled = true;
    if (autoUnlockBtn) {
      autoUnlockBtn.disabled = true;
    }
    nextBtn.classList.remove("hidden");
  }

  function unlock() {
    const entered = codeInput.value.trim().toUpperCase();
    const compact = entered.replace(/[^A-Z0-9]/g, "");
    const eventCompact = eventName.replace(/[^A-Z0-9]/g, "");
    const venueCompact = venue.replace(/[^A-Z0-9]/g, "");

    const valid =
      compact === targetCode ||
      compact.includes(partnerName) ||
      compact.includes("19022026") ||
      compact.includes(dateDigits) ||
      compact.includes(eventCompact) ||
      compact.includes("WINTERBALL") ||
      compact.includes(venueCompact) ||
      compact.includes("ASHOKA");

    if (valid) {
      openLock("Lock opened. The finale is ready.");
      return;
    }

    statusNode.textContent = "Try a clue word (Tanvi / 19022026) or tap Auto Unlock.";
    statusNode.classList.add("error");
    statusNode.classList.remove("success");
  }

  submitBtn.addEventListener("click", unlock);
  codeInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      unlock();
    }
  });

  if (autoUnlockBtn) {
    autoUnlockBtn.addEventListener("click", () => {
      codeInput.value = targetCode;
      openLock("Auto unlock complete. Finale ready.");
    });
  }

  nextBtn.addEventListener("click", () => {
    window.Promposal.goTo("finale.html");
  });
})();
