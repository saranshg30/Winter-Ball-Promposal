(() => {
  if (!window.Promposal.initPage({ pageId: "game5" })) {
    return;
  }

  const targetCode = (window.Promposal.config.finalCode || "TANVI19022026").toUpperCase();

  const codeInput = document.getElementById("codeInput");
  const submitBtn = document.getElementById("submitBtn");
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
    nextBtn.classList.remove("hidden");
  }

  function unlock() {
    const entered = codeInput.value.trim().toUpperCase();
    const compact = entered.replace(/[^A-Z0-9]/g, "");
    const valid = compact === targetCode;

    if (valid) {
      openLock("Lock opened. The finale is ready.");
      return;
    }

    statusNode.textContent = "That code is not right. Try again.";
    statusNode.classList.add("error");
    statusNode.classList.remove("success");
  }

  submitBtn.addEventListener("click", unlock);
  codeInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      unlock();
    }
  });

  nextBtn.addEventListener("click", () => {
    window.Promposal.goTo("finale.html");
  });
})();
