function fmtHMSms(ms) {
  ms = Math.max(0, ms | 0);
  const h = Math.floor(ms / 3600000);
  ms -= h * 3600000;
  const m = Math.floor(ms / 60000);
  ms -= m * 60000;
  const s = Math.floor(ms / 1000);
  const r = ms - s * 1000;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(r).padStart(3, "0")}`;
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"]/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;"
  }[c]));
}

export function initMechLog({panelId = "mechLogPanel", linesId = "mechLogLines"} = {}) {
  const mechLogPanel = document.getElementById(panelId);
  const mechLogLinesEl = document.getElementById(linesId);

  function pushMechLog(type, timeMs, msg) {
    try {
      if (!mechLogPanel) return;
      mechLogPanel.style.display = "block";
      window.__mechLog = window.__mechLog || [];
      const cls = `c-${type || "sys"}`;
      window.__mechLog.push({t: timeMs | 0, cls, msg});
      if (window.__mechLog.length > 10) {
        window.__mechLog.shift();
      }
      if (mechLogLinesEl) {
        mechLogLinesEl.innerHTML = window.__mechLog.map((line) => (
          `<div class='line ${line.cls}'>${fmtHMSms(line.t)} ${escapeHtml(line.msg)}</div>`
        )).join("");
      }
    } catch (e) {
      // noop
    }
  }

  return {pushMechLog, fmtHMSms};
}
