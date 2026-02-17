(() => {
  if (!window.Promposal.initPage({ pageId: null })) {
    return;
  }

  const beginBtn = document.getElementById("beginQuest");

  beginBtn.addEventListener("click", async () => {
    await window.Promposal.setAudioEnabled(window.Promposal.loadState().audioEnabled);
    window.Promposal.goTo("game1.html");
  });
})();
