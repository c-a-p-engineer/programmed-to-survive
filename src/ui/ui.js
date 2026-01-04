export function $(sel, root=document){ return root.querySelector(sel); }
export function $all(sel, root=document){ return Array.from(root.querySelectorAll(sel)); }

export function openModal(id){
  const el = document.getElementById(id);
  if(!el) return;
  el.classList.add("is-open");
}

export function closeModal(id){
  const el = document.getElementById(id);
  if(!el) return;
  el.classList.remove("is-open");
}

export function toast(title, detail="", ttlMs=2500){
  const wrap = document.getElementById("toast-wrap");
  if(!wrap) return;

  const t = document.createElement("div");
  t.className = "toast";
  t.innerHTML = `${escapeHtml(title)}${detail ? `<small>${escapeHtml(detail)}</small>` : ""}`;
  wrap.appendChild(t);

  const timer = setTimeout(() => {
    t.remove();
    clearTimeout(timer);
  }, ttlMs);
}

function escapeHtml(s){
  return String(s)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}
