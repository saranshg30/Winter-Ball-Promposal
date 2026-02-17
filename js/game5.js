(() => {
  if (!window.Promposal.initPage({ pageId: "game5" })) {
    return;
  }

  const targetCode = (window.Promposal.config.finalCode || "TANVI19022026").toUpperCase();

  const codeInput = document.getElementById("codeInput");
  const submitBtn = document.getElementById("submitBtn");
  const statusNode = document.getElementById("statusText");
  const nextBtn = document.getElementById("nextBtn");

  function unlock() {
    const entered = codeInput.value.trim().toUpperCase();
    if (entered === targetCode) {
      window.Promposal.setScore("game5", 1);
      window.Promposal.markCompleted("game5", 1);

      statusNode.textContent = "Lock opened. The finale is ready.";
      statusNode.classList.add("success");
      statusNode.classList.remove("error");

      codeInput.disabled = true;
      submitBtn.disabled = true;
      nextBtn.classList.remove("hidden");
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
