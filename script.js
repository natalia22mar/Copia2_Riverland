"use strict";

/* Programa: artistas confirmados por día */
const PROGRAMA = [
  ["Sticky M.A.", "Yung Beef", "Kaydy Cain", "Khaled", "Soto Asa", "8belial","yyy891", "cybernene", "roomtrash6"],
  ["El Bugg", "dsm", "superreservao", "Gloosito", "Guxo", "Dlomalo", "Marce", "La Zowi", "Albany", "GlorySixVain"],
  ["Al Safir", "Hard GZ", "Hoke", "Miranda", "Kinky Bwoy", "Arce", "Jarfaiter", "Ogcale", "Natos y Waor", "Haze"]
];
const DIAS = ["viernes 21", "sábado 22", "domingo 23"];

document.addEventListener("DOMContentLoaded", () => {
  initMedia();
  initMenu();
  initModales();
  initTabs();
  initEntradas();
  initForm();
  initHint();
  initCoords();
});

/* Visual: ajusta la proporción del GIF y oculta el fondo si falla */
function initMedia() {
  const stage = document.getElementById("stage");
  const el = stage.querySelector(".media img, .media video");
  if (!el) { stage.classList.add("no-media"); return; }
  const fijar = (w, h) => { if (w && h) document.documentElement.style.setProperty("--ratio", (w / h).toFixed(4)); };
  if (el.tagName === "VIDEO") {
    el.addEventListener("loadedmetadata", () => fijar(el.videoWidth, el.videoHeight));
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) el.removeAttribute("autoplay");
  } else {
    if (el.complete && el.naturalWidth) fijar(el.naturalWidth, el.naturalHeight);
    el.addEventListener("load", () => fijar(el.naturalWidth, el.naturalHeight));
  }
  el.addEventListener("error", () => stage.classList.add("no-media"));
}

/* Menú desplegable responsive */
function initMenu() {
  const btn = document.querySelector(".nav-toggle");
  const nav = document.getElementById("menu");
  const cerrar = () => {
    nav.classList.remove("is-open");
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-label", "Abrir menú");
  };
  btn.addEventListener("click", () => {
    const abierto = nav.classList.toggle("is-open");
    btn.setAttribute("aria-expanded", String(abierto));
    btn.setAttribute("aria-label", abierto ? "Cerrar menú" : "Abrir menú");
  });
  nav.addEventListener("click", e => { if (e.target.closest("button")) cerrar(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") cerrar(); });
  window.addEventListener("resize", () => { if (window.innerWidth > 900) cerrar(); });
}

/* Ventanas modales: hotspots, menú y footer */
function initModales() {
  document.addEventListener("click", e => {
    const abrir = e.target.closest("[data-open]");
    if (abrir) {
      document.querySelectorAll("dialog[open]").forEach(d => d.close());
      document.getElementById(abrir.dataset.open).showModal();
      return;
    }
    const cerrar = e.target.closest("[data-close]");
    if (cerrar) cerrar.closest("dialog").close();
    else if (e.target.tagName === "DIALOG") e.target.close(); // clic en el fondo
  });
}

/* Pestañas del programa + ficha de artista */
function initTabs() {
  const tabs = [...document.querySelectorAll(".tab")];
  const lista = document.getElementById("panel");
  const pintar = dia => {
    lista.innerHTML = "";
    PROGRAMA[dia].forEach(nombre => {
      const li = document.createElement("li");
      const b = document.createElement("button");
      b.type = "button";
      b.className = "artist";
      b.textContent = nombre;
      b.dataset.dia = dia;
      li.appendChild(b);
      lista.appendChild(li);
    });
    lista.setAttribute("aria-labelledby", "tab-" + dia);
  };
  tabs.forEach(t => t.addEventListener("click", () => {
    tabs.forEach(o => {
      const activa = o === t;
      o.classList.toggle("is-active", activa);
      o.setAttribute("aria-selected", String(activa));
      o.tabIndex = activa ? 0 : -1;
    });
    pintar(Number(t.dataset.day));
  }));
  lista.addEventListener("click", e => {
    const b = e.target.closest(".artist");
    if (!b) return;
    document.getElementById("artista-t").textContent = b.textContent;
    document.getElementById("artista-info").textContent =
      "Actúa el " + DIAS[b.dataset.dia] + " de agosto en Riverland Fest 2026, Valle de la Música (Arriondas).";
    document.getElementById("artista").showModal(); // segunda modal sobre la de programa
  });
  pintar(0);
}

/* Entradas: selección y total */
function initEntradas() {
  const resumen = document.getElementById("resumen");
  const cantidad = document.getElementById("cantidad");
  const total = document.getElementById("resumen-total");
  let precio = 0;
  const calcular = () => {
    const n = Math.min(10, Math.max(1, parseInt(cantidad.value, 10) || 1));
    total.textContent = (n * precio).toLocaleString("es-ES") + " €";
  };
  document.querySelectorAll(".buy").forEach(b => b.addEventListener("click", () => {
    precio = Number(b.dataset.price);
    document.getElementById("resumen-tipo").textContent = b.dataset.ticket + " · " + precio + " € por entrada";
    cantidad.value = 1;
    resumen.hidden = false;
    calcular();
  }));
  cantidad.addEventListener("input", calcular);
}

/* Validación del formulario */
function initForm() {
  const form = document.getElementById("form");
  const reglas = {
    nombre: v => v.trim().length < 2 ? "Escribe tu nombre (mínimo 2 caracteres)." : "",
    email: v => !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? "Introduce un email válido." : "",
    asunto: v => !v ? "Elige un asunto." : "",
    mensaje: v => v.trim().length < 10 ? "El mensaje debe tener al menos 10 caracteres." : "",
    privacidad: (v, el) => !el.checked ? "Debes aceptar la política de privacidad." : ""
  };
  const validar = el => {
    const campo = el.closest(".field");
    const msg = reglas[el.name](el.value, el);
    campo.classList.toggle("invalid", Boolean(msg));
    el.setAttribute("aria-invalid", String(Boolean(msg)));
    campo.querySelector(".error").textContent = msg;
    return !msg;
  };
  const campos = [...form.querySelectorAll("[name]")];
  campos.forEach(el => {
    el.addEventListener("blur", () => validar(el));
    el.addEventListener("input", () => { if (el.closest(".invalid")) validar(el); });
  });
  form.addEventListener("submit", e => {
    e.preventDefault();
    const ok = campos.map(validar).every(Boolean);
    const aviso = document.getElementById("form-ok");
    if (ok) { aviso.textContent = "¡Gracias! Hemos recibido tu mensaje."; form.reset(); }
    else { aviso.textContent = ""; form.querySelector(".invalid input, .invalid select, .invalid textarea").focus(); }
  });
}

/* Aviso "Desliza" en móvil: desaparece al deslizar */
function initHint() {
  const scroller = document.getElementById("visual");
  const hint = document.querySelector(".hint");
  scroller.addEventListener("scroll", () => hint.classList.add("is-hidden"), { once: true });
  setTimeout(() => hint.classList.add("is-hidden"), 6000);
}

/* Ayuda colocar hotspots */
function initCoords() {
  if (location.hash !== "#coords") return;
  const stage = document.getElementById("stage");
  stage.addEventListener("click", e => {
    if (e.target.closest(".hotspot")) return;
    const r = stage.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width * 100).toFixed(1);
    const y = ((e.clientY - r.top) / r.height * 100).toFixed(1);
    console.log(`style="--x:${x}%; --y:${y}%"`);
    alert(`style="--x:${x}%; --y:${y}%"`);
  });
}