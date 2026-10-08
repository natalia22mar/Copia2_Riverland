"use strict";

/* Programa: horarios y escenarios provisionales por día */
const PROGRAMA = [
  [
    ["Sticky M.A.", "18:00", "El Valle"], ["Yung Beef", "19:15", "El Bosque"],
    ["Kaydy Cain", "20:00", "La Carpa"], ["Khaled", "21:00", "El Valle"],
    ["Soto Asa", "22:00", "El Bosque"], ["8belial", "23:00", "La Carpa"],
    ["yyy891", "00:00", "El Valle"], ["cybernene", "02:00", "El Bosque"],
    ["roomtrash6", "04:00", "La Carpa"]
  ],
  [
    ["El Bugg", "18:00", "El Valle"], ["dsm", "19:00", "El Bosque"],
    ["superreservao", "20:00", "La Carpa"], ["Gloosito", "21:00", "El Valle"],
    ["Guxo", "22:00", "El Bosque"], ["Dlomalo", "23:00", "La Carpa"],
    ["Marce", "00:00", "El Valle"], ["La Zowi", "01:30", "El Bosque"],
    ["Albany", "03:00", "La Carpa"], ["GlorySixVain", "04:30", "El Valle"]
  ],
  [
    ["Al Safir", "18:00", "El Valle"], ["Hard GZ", "19:15", "El Bosque"],
    ["Hoke", "20:30", "La Carpa"], ["Miranda", "21:30", "El Valle"],
    ["Kinky Bwoy", "22:30", "El Bosque"], ["Arce", "23:30", "La Carpa"],
    ["Jarfaiter", "00:30", "El Valle"], ["Ogcale", "02:00", "El Bosque"],
    ["Natos y Waor", "03:30", "La Carpa"], ["Haze", "05:00", "El Valle"]
  ]
];
const DIAS = ["viernes 21", "sábado 22", "domingo 23"];

document.addEventListener("DOMContentLoaded", () => {
  initFooterLayout();
  initMedia();
  initHotspots();
  initMenu();
  initModales();
  initTabs();
  initEntradas();
  initCamping();
  initForm();
  initHint();
  initCoords();
});

/* Mantiene el área visual ajustada a la altura real del footer responsive */
function initFooterLayout() {
  const footer = document.querySelector(".site-footer");
  const actualizarAltura = () => {
    document.documentElement.style.setProperty("--footer-h", `${footer.getBoundingClientRect().height}px`);
  };
  new ResizeObserver(actualizarAltura).observe(footer);
  actualizarAltura();
}

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

/* Proyecta las coordenadas de la imagen sobre el recorte visible del video */
function initHotspots() {
  const stage = document.getElementById("stage");
  const media = stage.querySelector(".media img, .media video");
  const hotspots = [...stage.querySelectorAll(".hotspot")].map(hotspot => ({
    element: hotspot,
    x: parseFloat(hotspot.style.getPropertyValue("--x")) / 100,
    y: parseFloat(hotspot.style.getPropertyValue("--y")) / 100
  }));
  const actualizar = () => {
    const naturalWidth = media.naturalWidth || media.videoWidth;
    const naturalHeight = media.naturalHeight || media.videoHeight;
    if (!naturalWidth || !naturalHeight) return;

    const { width, height } = stage.getBoundingClientRect();
    const scale = Math.max(width / naturalWidth, height / naturalHeight);
    const renderedWidth = naturalWidth * scale;
    const renderedHeight = naturalHeight * scale;
    const positions = getComputedStyle(media).objectPosition.split(" ");
    const positionX = parseFloat(positions[0]) / 100 || 0.5;
    const positionY = parseFloat(positions[1]) / 100 || 0.5;
    const offsetX = (width - renderedWidth) * positionX;
    const offsetY = (height - renderedHeight) * positionY;

    hotspots.forEach(({ element, x, y }) => {
      element.style.setProperty("--hotspot-x", `${(offsetX + x * renderedWidth) / width * 100}%`);
      element.style.setProperty("--hotspot-y", `${(offsetY + y * renderedHeight) / height * 100}%`);
    });
  };

  new ResizeObserver(actualizar).observe(stage);
  media.addEventListener("loadedmetadata", actualizar);
  media.addEventListener("loadeddata", actualizar);
  media.addEventListener("load", actualizar);
  actualizar();
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
  document.addEventListener("keydown", e => {
    if (e.key !== "Escape") return;
    const abiertas = [...document.querySelectorAll("dialog[open]")];
    if (!abiertas.length) return;
    e.preventDefault();
    abiertas[abiertas.length - 1].close();
  });
  document.addEventListener("click", e => {
    const abrir = e.target.closest("[data-open]");
    if (abrir) {
      document.querySelectorAll("dialog[open]").forEach(d => d.close());
      const dialog = document.getElementById(abrir.dataset.open);
      if (dialog.dataset.titleDefault) {
        dialog.querySelector("h2").textContent = abrir.dataset.title || dialog.dataset.titleDefault;
      }
      dialog.showModal();
      return;
    }
    const cerrar = e.target.closest("[data-close]");
    if (cerrar) cerrar.closest("dialog").close();
    else if (e.target instanceof HTMLDialogElement) {
      const rect = e.target.getBoundingClientRect();
      if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) {
        e.target.close();
      }
    }
  });
}

/* Pestañas del programa + ficha de artista */
function initTabs() {
  const tabs = [...document.querySelectorAll(".tab")];
  const panel = document.getElementById("panel");
  const lista = panel.querySelector(".lineup");
  const crearBotonArtista = (nombre, dia) => {
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "artist";
    boton.dataset.artista = nombre;
    boton.dataset.dia = dia;
    return boton;
  };
  const crearArtista = (nombre, dia) => {
    const li = document.createElement("li");
    const boton = crearBotonArtista(nombre, dia);
    boton.textContent = nombre;
    li.appendChild(boton);
    return li;
  };
  const crearArtistaProgramado = (artista, dia) => {
    const li = document.createElement("li");
    const boton = crearBotonArtista(artista[0], dia);
    boton.classList.add("artist-programado");
    const nombre = document.createElement("span");
    nombre.className = "artist-name";
    nombre.textContent = artista[0];
    const hora = document.createElement("span");
    hora.className = "artist-time";
    hora.textContent = artista[1];
    const escenario = document.createElement("span");
    escenario.className = "artist-stage";
    escenario.textContent = artista[2];
    boton.append(nombre, hora, escenario);
    li.appendChild(boton);
    return li;
  };
  const pintar = dia => {
    lista.replaceChildren();
    PROGRAMA[dia].forEach(artista => {
      lista.appendChild(crearArtistaProgramado(artista, dia));
    });
    panel.setAttribute("aria-labelledby", "tab-" + dia);
  };
  document.querySelectorAll("[data-artists-day]").forEach(list => {
    const dia = Number(list.dataset.artistsDay);
    PROGRAMA[dia].forEach(artista => list.appendChild(crearArtista(artista[0], dia)));
  });
  const activar = tab => {
    tabs.forEach(o => {
      const activa = o === tab;
      o.classList.toggle("is-active", activa);
      o.setAttribute("aria-selected", String(activa));
      o.tabIndex = activa ? 0 : -1;
    });
    pintar(Number(tab.dataset.day));
  };
  tabs.forEach((tab, indice) => {
    tab.addEventListener("click", () => activar(tab));
    tab.addEventListener("keydown", e => {
      let destino = indice;
      if (e.key === "ArrowRight") destino = (indice + 1) % tabs.length;
      else if (e.key === "ArrowLeft") destino = (indice - 1 + tabs.length) % tabs.length;
      else if (e.key === "Home") destino = 0;
      else if (e.key === "End") destino = tabs.length - 1;
      else return;
      e.preventDefault();
      tabs[destino].focus();
      activar(tabs[destino]);
    });
  });
  document.addEventListener("click", e => {
    const b = e.target.closest(".artist");
    if (!b) return;
    const artista = PROGRAMA[b.dataset.dia].find(item => item[0] === b.dataset.artista);
    document.getElementById("artista-t").textContent = artista[0];
    document.getElementById("artista-info").textContent =
      `Actúa el ${DIAS[b.dataset.dia]} de agosto en Riverland Fest 2026, Valle de la Música (Arriondas).`;
    document.getElementById("artista").showModal(); // segunda modal sobre la de programa
  });
  pintar(0);
}

/* Reserva de camping de demostración, sin envío a un servidor */
function initCamping() {
  const form = document.getElementById("camping-form");
  form.addEventListener("submit", e => {
    e.preventDefault();
    const plazas = Number(form.elements.plazas.value);
    document.getElementById("camping-status").textContent =
      `Solicitud de ${plazas} ${plazas === 1 ? "plaza" : "plazas"} preparada. Esta demo no la envía ni confirma la reserva.`;
  });
}

/* Entradas: selección y total */
function initEntradas() {
  const catalog = document.getElementById("ticket-catalog");
  const cartSection = document.getElementById("ticket-cart");
  const cartItems = document.getElementById("ticket-cart-items");
  const cartTotal = document.getElementById("ticket-cart-total");
  const checkout = document.getElementById("ticket-checkout");
  const confirmation = document.getElementById("purchase-confirmation");
  const cart = new Map();

  const formatPrice = amount => amount.toLocaleString("es-ES") + " €";
  const renderCart = () => {
    cartItems.replaceChildren();
    let total = 0;

    cart.forEach(item => {
      total += item.price * item.quantity;
      const row = document.createElement("li");
      row.className = "cart-item";

      const details = document.createElement("div");
      details.className = "cart-item-details";
      const name = document.createElement("strong");
      name.textContent = item.name;
      const unitPrice = document.createElement("span");
      unitPrice.textContent = formatPrice(item.price) + " por entrada";
      details.append(name, unitPrice);

      const controls = document.createElement("div");
      controls.className = "cart-item-controls";
      const quantityLabel = document.createElement("label");
      quantityLabel.textContent = "Cantidad";
      const quantity = document.createElement("input");
      quantity.type = "number";
      quantity.min = "1";
      quantity.max = "10";
      quantity.value = String(item.quantity);
      quantity.dataset.cartQuantity = item.name;
      quantity.setAttribute("aria-label", "Cantidad de " + item.name);
      quantityLabel.appendChild(quantity);

      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "btn btn-ghost cart-remove";
      remove.textContent = "Quitar";
      remove.dataset.cartRemove = item.name;
      remove.setAttribute("aria-label", "Quitar " + item.name + " del carrito");
      controls.append(quantityLabel, remove);
      row.append(details, controls);
      cartItems.appendChild(row);
    });

    cartTotal.textContent = formatPrice(total);
    cartSection.hidden = cart.size === 0;
    document.getElementById("checkout-start").disabled = cart.size === 0;
    return total;
  };

  document.querySelectorAll(".buy").forEach(button => button.addEventListener("click", () => {
    const name = button.dataset.ticket;
    const item = cart.get(name) || { name, price: Number(button.dataset.price), quantity: 0 };
    item.quantity = Math.min(10, item.quantity + 1);
    cart.set(name, item);
    renderCart();
  }));

  cartItems.addEventListener("change", e => {
    const input = e.target.closest("[data-cart-quantity]");
    if (!input) return;
    const item = cart.get(input.dataset.cartQuantity);
    if (!item) return;
    item.quantity = Math.min(10, Math.max(1, Number.parseInt(input.value, 10) || 1));
    renderCart();
  });

  cartItems.addEventListener("click", e => {
    const button = e.target.closest("[data-cart-remove]");
    if (!button) return;
    cart.delete(button.dataset.cartRemove);
    renderCart();
  });

  document.getElementById("checkout-start").addEventListener("click", () => {
    if (!cart.size) return;
    catalog.hidden = true;
    cartSection.hidden = true;
    checkout.hidden = false;
    checkout.querySelector("input").focus();
  });

  document.getElementById("checkout-back").addEventListener("click", () => {
    checkout.hidden = true;
    catalog.hidden = false;
    cartSection.hidden = false;
  });

  checkout.addEventListener("submit", e => {
    e.preventDefault();
    if (!cart.size || !checkout.reportValidity()) return;

    const buyerName = checkout.elements.buyerName.value.trim();
    const total = [...cart.values()].reduce((sum, item) => sum + item.price * item.quantity, 0);
    document.getElementById("purchase-message").textContent =
      `¡Pago recibido, ${buyerName}! Bienvenido a Riverland; nos vemos allí.`;
    document.getElementById("purchase-total").textContent = formatPrice(total);
    checkout.reset();
    catalog.hidden = true;
    checkout.hidden = true;
    confirmation.hidden = false;
    confirmation.querySelector("h3").focus();
  });

  document.getElementById("new-purchase").addEventListener("click", () => {
    cart.clear();
    renderCart();
    confirmation.hidden = true;
    catalog.hidden = false;
  });
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
  });
}