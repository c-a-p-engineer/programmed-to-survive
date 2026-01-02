export function initDebugPanel({buttonId = "debugBtn", panelId = "debugPanel"} = {}) {
  const dbgBtn = document.getElementById(buttonId);
  const dbgPanel = document.getElementById(panelId);
  let dbgVisible = false;
  const dbgLines = [];

  function dbg(msg) {
    try {
      const t = new Date().toISOString().substr(11, 8);
      dbgLines.push(`[${t}] ${msg}`);
      if (dbgLines.length > 200) {
        dbgLines.shift();
      }
      if (dbgPanel) {
        dbgPanel.textContent = dbgLines.join("\n");
      }
    } catch (e) {
      // noop
    }
  }

  if (dbgBtn) {
    dbgBtn.addEventListener("click", () => {
      dbgVisible = !dbgVisible;
      if (dbgPanel) {
        dbgPanel.style.display = dbgVisible ? "block" : "none";
      }
    });
  }

  window.addEventListener("error", (e) => {
    const msg = (e && e.message) ? e.message : String(e);
    const st = (e && e.error && e.error.stack) ? (`\n${e.error.stack}`) : "";
    dbg(`ERROR: ${msg}${st}`);
  });

  return {dbg};
}
