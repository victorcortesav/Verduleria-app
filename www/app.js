// ---------- Almacenamiento local (sin servidor, sin internet) ----------
const CATALOGO_INICIAL = [
  {name:"Papas",image:"🥔",unit:"kg",price:900},{name:"Tomates",image:"🍅",unit:"kg",price:1200},
  {name:"Lechuga",image:"🥬",unit:"unidad",price:700},{name:"Paltas",image:"🥑",unit:"kg",price:2500},
  {name:"Cebolla",image:"🧅",unit:"kg",price:800},{name:"Zanahoria",image:"🥕",unit:"kg",price:700},
  {name:"Plátano",image:"🍌",unit:"kg",price:1000},{name:"Manzana",image:"🍎",unit:"kg",price:1400},
  {name:"Naranja",image:"🍊",unit:"kg",price:1100},{name:"Limón",image:"🍋",unit:"kg",price:1600},
  {name:"Ajo",image:"🧄",unit:"kg",price:3500},{name:"Choclo",image:"🌽",unit:"unidad",price:500},
  {name:"Pimiento",image:"🫑",unit:"kg",price:1800},{name:"Pepino",image:"🥒",unit:"kg",price:900},
  {name:"Uva",image:"🍇",unit:"kg",price:2200},{name:"Pera",image:"🍐",unit:"kg",price:1500},
  {name:"Sandía",image:"🍉",unit:"unidad",price:3500},{name:"Frutilla",image:"🍓",unit:"kg",price:2800},
  {name:"Zapallo",image:"🎃",unit:"kg",price:700},{name:"Espinaca",image:"🥬",unit:"unidad",price:600},
];

function cargarDeStorage(clave, valorPorDefecto) {
  try {
    const raw = localStorage.getItem(clave);
    return raw ? JSON.parse(raw) : valorPorDefecto;
  } catch (e) { return valorPorDefecto; }
}
function guardarEnStorage(clave, valor) {
  localStorage.setItem(clave, JSON.stringify(valor));
}

let productos = cargarDeStorage("productos", null);
if (!productos) {
  productos = CATALOGO_INICIAL.map((p, i) => ({ id: i + 1, ...p }));
  guardarEnStorage("productos", productos);
}
let nextProductoId = Math.max(0, ...productos.map(p => p.id)) + 1;

let ventas = cargarDeStorage("ventas", []); // [{id, created_at, total, items:[{product_name, unit, quantity, unit_price, subtotal}]}]
let nextVentaId = Math.max(0, ...ventas.map(v => v.id)) + 1;

const BANCO_ICONOS = [
  ["Papas","🥔"],["Camote","🍠"],["Tomate","🍅"],["Tomate cherry","🍅"],
  ["Lechuga","🥬"],["Repollo","🥬"],["Espinaca","🥬"],["Acelga","🥬"],["Kale","🥬"],
  ["Palta","🥑"],["Cebolla","🧅"],["Cebollín","🧅"],["Puerro","🧅"],["Ajo","🧄"],
  ["Zanahoria","🥕"],["Betarraga","🥕"],["Rabanito","🥕"],["Pepino","🥒"],
  ["Zapallo","🎃"],["Zapallo italiano","🥒"],["Choclo","🌽"],["Pimiento","🫑"],
  ["Ají","🌶️"],["Ají cacho de cabra","🌶️"],["Brócoli","🥦"],["Coliflor","🥦"],
  ["Apio","🥬"],["Poroto verde","🫛"],["Arveja","🫛"],["Habas","🫘"],
  ["Berenjena","🍆"],["Alcachofa","🌿"],["Champiñón","🍄"],["Hongo ostra","🍄"],
  ["Jengibre","🫚"],["Cilantro","🌿"],["Perejil","🌿"],["Albahaca","🌿"],
  ["Orégano","🌿"],["Tomillo","🌿"],["Romero","🌿"],["Menta","🌿"],
  ["Manzana roja","🍎"],["Manzana verde","🍏"],["Pera","🍐"],["Naranja","🍊"],
  ["Mandarina","🍊"],["Limón","🍋"],["Limón sutil","🍋"],["Pomelo","🍊"],
  ["Plátano","🍌"],["Uva","🍇"],["Uva verde","🍇"],["Sandía","🍉"],
  ["Melón","🍈"],["Frutilla","🍓"],["Frambuesa","🫐"],["Arándano","🫐"],
  ["Mora","🫐"],["Kiwi","🥝"],["Piña","🍍"],["Mango","🥭"],
  ["Durazno","🍑"],["Nectarina","🍑"],["Ciruela","🍑"],["Chirimoya","🍈"],
  ["Papaya","🍈"],["Higo","🟤"],["Damasco","🍑"],["Coco","🥥"],
  ["Guayaba","🍈"],["Maracuyá","🟡"],["Pepino dulce","🥒"],["Membrillo","🍐"],
  ["Níspero","🍊"],["Cereza","🍒"],["Dátil","🟤"],["Granada","🔴"],
  ["Lenteja","🟤"],["Garbanzo","🟡"],["Poroto","🫘"],["Arroz","🍚"],
  ["Quinoa","🌾"],["Avena","🌾"],["Fideos","🍝"],["Harina","🌾"],
  ["Huevos","🥚"],["Huevos de campo","🥚"],["Leche","🥛"],["Queso","🧀"],
  ["Mantequilla","🧈"],["Yogurt","🥛"],["Pan","🍞"],["Miel","🍯"],
  ["Aceite","🍶"],["Vinagre","🍶"],["Sal","🧂"],["Azúcar","🧂"],
  ["Pimienta","🧂"],["Comino","🌿"],["Canela","🟤"],["Merkén","🌶️"],
  ["Nuez","🌰"],["Almendra","🌰"],["Maní","🥜"],["Pasas","🟣"],
  ["Chocolate","🍫"],["Café","☕"],["Té","🍵"],["Aceituna","🫒"],
];

let carrito = [];
let productoEnSeleccion = null;
let valorDisplay = "0";
let iconoSeleccionado = "🛒";
let unidadSeleccionada = "kg";
let productoEditandoId = null;

function renderImagen(image) {
  if (image && image.startsWith("data:image")) return `<img src="${image}" />`;
  return image || "🛒";
}

// ---------- Grid principal ----------
function renderProductos() {
  const grid = document.getElementById("grid-productos");
  grid.innerHTML = productos.map(p => `
    <div class="producto-card" data-id="${p.id}">
      <div class="foto-cont">${renderImagen(p.image)}</div>
      <div class="nombre">${p.name}</div>
      <div class="precio">$${Math.round(p.price).toLocaleString("es-CL")}</div>
      <div class="unidad">/ ${p.unit === "kg" ? "kilo" : "unidad"}</div>
    </div>
  `).join("");
  grid.querySelectorAll(".producto-card").forEach(card => {
    card.addEventListener("click", () => {
      const id = parseInt(card.dataset.id);
      abrirSelectorMonto(productos.find(p => p.id === id));
    });
  });
}

// ---------- Ingresar monto en pesos ----------
function abrirSelectorMonto(producto) {
  productoEnSeleccion = producto;
  valorDisplay = "0";
  document.getElementById("cantidad-emoji").innerHTML = renderImagen(producto.image);
  document.getElementById("cantidad-nombre").textContent = producto.name;
  document.getElementById("cantidad-precio-unit").textContent =
    `$${Math.round(producto.price).toLocaleString("es-CL")} / ${producto.unit === "kg" ? "kilo" : "unidad"}`;
  actualizarDisplayMonto();
  abrirSheet("overlay-cantidad");
}
function actualizarDisplayMonto() {
  const monto = parseInt(valorDisplay || "0", 10);
  document.getElementById("display-valor").textContent = monto.toLocaleString("es-CL");
  const cantidad = productoEnSeleccion.price > 0 ? monto / productoEnSeleccion.price : 0;
  const unidadTxt = productoEnSeleccion.unit === "kg" ? "kg" : "un.";
  document.getElementById("equivalencia-cantidad").textContent = `≈ ${cantidad.toFixed(2)} ${unidadTxt}`;
}
document.querySelectorAll(".keypad button").forEach(btn => {
  btn.addEventListener("click", () => {
    const key = btn.dataset.key;
    if (key === "back") valorDisplay = valorDisplay.slice(0, -1) || "0";
    else if (key === "000") valorDisplay = valorDisplay === "0" ? "0" : valorDisplay + "000";
    else valorDisplay = valorDisplay === "0" ? key : valorDisplay + key;
    actualizarDisplayMonto();
  });
});
document.getElementById("btn-cancelar-cantidad").addEventListener("click", () => cerrarSheet("overlay-cantidad"));
document.getElementById("btn-confirmar-cantidad").addEventListener("click", () => {
  const monto = parseInt(valorDisplay || "0", 10);
  if (monto <= 0) { cerrarSheet("overlay-cantidad"); return; }
  const cantidad = productoEnSeleccion.price > 0 ? monto / productoEnSeleccion.price : 0;
  const existente = carrito.find(i => i.product_id === productoEnSeleccion.id);
  if (existente) { existente.monto += monto; existente.quantity += cantidad; }
  else carrito.push({
    product_id: productoEnSeleccion.id, product_name: productoEnSeleccion.name,
    image: productoEnSeleccion.image, unit: productoEnSeleccion.unit,
    quantity: cantidad, unit_price: productoEnSeleccion.price, monto: monto,
  });
  cerrarSheet("overlay-cantidad");
  actualizarBarraCarrito();
});

// ---------- Carrito ----------
function actualizarBarraCarrito() {
  const bar = document.getElementById("cart-bar");
  const total = carrito.reduce((s, i) => s + i.monto, 0);
  if (carrito.length === 0) { bar.classList.remove("visible"); return; }
  bar.classList.add("visible");
  document.getElementById("cart-count").textContent = `${carrito.length} producto${carrito.length > 1 ? "s" : ""}`;
  document.getElementById("cart-total").textContent = `$${Math.round(total).toLocaleString("es-CL")}`;
}
document.getElementById("btn-ver-carrito").addEventListener("click", () => { renderCarritoDetalle(); abrirSheet("overlay-carrito"); });
function renderCarritoDetalle() {
  const cont = document.getElementById("lista-carrito-detalle");
  cont.innerHTML = carrito.map((item, i) => `
    <div class="carrito-fila">
      <div class="info">
        <span class="emoji-chico">${renderImagen(item.image)}</span>
        <div class="nombre-cant">
          <div>${item.product_name}</div>
          <div class="cant">≈ ${item.quantity.toFixed(2)} ${item.unit === "kg" ? "kg" : "un."} · $${Math.round(item.unit_price).toLocaleString("es-CL")}/${item.unit === "kg" ? "kg" : "u."}</div>
        </div>
      </div>
      <div style="display:flex;align-items:center;">
        <span class="subtotal">$${Math.round(item.monto).toLocaleString("es-CL")}</span>
        <button class="quitar" data-i="${i}">✕</button>
      </div>
    </div>
  `).join("");
  cont.querySelectorAll(".quitar").forEach(btn => {
    btn.addEventListener("click", () => {
      carrito.splice(parseInt(btn.dataset.i), 1);
      renderCarritoDetalle(); actualizarBarraCarrito();
      if (carrito.length === 0) cerrarSheet("overlay-carrito");
    });
  });
  const total = carrito.reduce((s, i) => s + i.monto, 0);
  document.getElementById("total-final").textContent = `$${Math.round(total).toLocaleString("es-CL")}`;
}
document.getElementById("btn-seguir-comprando").addEventListener("click", () => cerrarSheet("overlay-carrito"));
document.getElementById("btn-finalizar-venta").addEventListener("click", () => {
  const total = carrito.reduce((s, i) => s + i.monto, 0);

  // Se guarda de inmediato en el dispositivo (localStorage) - sin internet
  const nuevaVenta = {
    id: nextVentaId++,
    created_at: new Date().toISOString(),
    total: total,
    items: carrito.map(i => ({
      product_name: i.product_name, unit: i.unit,
      quantity: i.quantity, unit_price: i.unit_price, subtotal: i.monto,
    })),
  };
  ventas.push(nuevaVenta);
  guardarEnStorage("ventas", ventas);

  document.getElementById("monto-confirmado").textContent = `$${Math.round(total).toLocaleString("es-CL")}`;
  cerrarSheet("overlay-carrito");
  abrirSheet("overlay-confirmacion");
});
document.getElementById("btn-nueva-venta").addEventListener("click", () => {
  carrito = [];
  actualizarBarraCarrito();
  cerrarSheet("overlay-confirmacion");
});

// ---------- Gestión de productos ----------
document.getElementById("btn-gestionar-productos").addEventListener("click", () => {
  document.getElementById("buscar-producto-gestion").value = "";
  renderGestionProductos("");
  abrirSheet("overlay-gestion-productos");
});
document.getElementById("btn-cerrar-gestion").addEventListener("click", () => cerrarSheet("overlay-gestion-productos"));
function renderGestionProductos(filtro) {
  const cont = document.getElementById("lista-gestion-productos");
  const lista = productos.filter(p => p.name.toLowerCase().includes(filtro.toLowerCase()));
  cont.innerHTML = lista.map(p => `
    <div class="gestion-fila">
      <div class="foto-chica">${renderImagen(p.image)}</div>
      <div class="info-producto">
        <div class="nombre-g">${p.name}</div>
        <div class="precio-g">$${Math.round(p.price).toLocaleString("es-CL")} / ${p.unit === "kg" ? "kilo" : "unidad"}</div>
      </div>
      <div class="acciones-g">
        <button class="btn-editar-g" data-id="${p.id}">✏️</button>
        <button class="btn-eliminar-g" data-id="${p.id}">🗑️</button>
      </div>
    </div>
  `).join("") || `<p style="padding:16px;color:#888;">No se encontraron productos.</p>`;
  cont.querySelectorAll(".btn-editar-g").forEach(btn => btn.addEventListener("click", () => abrirFormularioProducto(parseInt(btn.dataset.id))));
  cont.querySelectorAll(".btn-eliminar-g").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = parseInt(btn.dataset.id);
      const p = productos.find(x => x.id === id);
      if (confirm(`¿Eliminar "${p.name}" del catálogo?`)) {
        productos = productos.filter(x => x.id !== id);
        guardarEnStorage("productos", productos);
        renderGestionProductos(document.getElementById("buscar-producto-gestion").value);
        renderProductos();
      }
    });
  });
}
document.getElementById("buscar-producto-gestion").addEventListener("input", (e) => renderGestionProductos(e.target.value));
document.getElementById("btn-abrir-nuevo-producto").addEventListener("click", () => abrirFormularioProducto(null));

function abrirFormularioProducto(id) {
  productoEditandoId = id;
  const editando = id !== null;
  document.getElementById("titulo-form-producto").textContent = editando ? "Editar producto" : "Nuevo producto";
  if (editando) {
    const p = productos.find(x => x.id === id);
    iconoSeleccionado = p.image; unidadSeleccionada = p.unit;
    document.getElementById("nuevo-nombre").value = p.name;
    document.getElementById("nuevo-precio").value = p.price;
  } else {
    iconoSeleccionado = "🛒"; unidadSeleccionada = "kg";
    document.getElementById("nuevo-nombre").value = "";
    document.getElementById("nuevo-precio").value = "";
  }
  document.getElementById("foto-preview").innerHTML = renderImagen(iconoSeleccionado);
  document.querySelectorAll(".unidad-btn").forEach(b => b.classList.toggle("active", b.dataset.unit === unidadSeleccionada));
  document.getElementById("buscar-icono").value = "";
  renderBancoIconos("");
  abrirSheet("overlay-nuevo-producto");
}
document.getElementById("btn-cancelar-nuevo").addEventListener("click", () => cerrarSheet("overlay-nuevo-producto"));

function renderBancoIconos(filtro) {
  const cont = document.getElementById("banco-iconos");
  const lista = BANCO_ICONOS.filter(([nombre]) => nombre.toLowerCase().includes(filtro.toLowerCase()));
  cont.innerHTML = lista.map(([nombre, emoji]) => `
    <div class="icono-opcion" data-emoji="${emoji}" data-nombre="${nombre}"><span>${emoji}</span><span class="etiqueta">${nombre}</span></div>
  `).join("") || `<p style="grid-column:1/-1;color:#888;font-size:12px;padding:8px;">Sin resultados.</p>`;
  cont.querySelectorAll(".icono-opcion").forEach(el => {
    el.addEventListener("click", () => {
      iconoSeleccionado = el.dataset.emoji;
      document.getElementById("foto-preview").innerHTML = iconoSeleccionado;
      if (!document.getElementById("nuevo-nombre").value.trim()) document.getElementById("nuevo-nombre").value = el.dataset.nombre;
    });
  });
}
document.getElementById("buscar-icono").addEventListener("input", (e) => renderBancoIconos(e.target.value));
document.getElementById("btn-tomar-foto").addEventListener("click", () => document.getElementById("input-foto").click());
document.getElementById("input-foto").addEventListener("change", (e) => {
  const file = e.target.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = () => { iconoSeleccionado = reader.result; document.getElementById("foto-preview").innerHTML = `<img src="${iconoSeleccionado}" />`; };
  reader.readAsDataURL(file);
});
document.querySelectorAll(".unidad-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".unidad-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active"); unidadSeleccionada = btn.dataset.unit;
  });
});
document.getElementById("btn-guardar-nuevo").addEventListener("click", () => {
  const nombre = document.getElementById("nuevo-nombre").value.trim();
  const precio = parseFloat(document.getElementById("nuevo-precio").value);
  if (!nombre || !precio) { alert("Ingresa nombre y precio del producto."); return; }
  if (productoEditandoId !== null) {
    const p = productos.find(x => x.id === productoEditandoId);
    p.name = nombre; p.image = iconoSeleccionado; p.unit = unidadSeleccionada; p.price = precio;
  } else {
    productos.push({id: nextProductoId++, name: nombre, image: iconoSeleccionado, unit: unidadSeleccionada, price: precio});
  }
  guardarEnStorage("productos", productos);
  cerrarSheet("overlay-nuevo-producto");
  renderProductos();
  renderGestionProductos(document.getElementById("buscar-producto-gestion").value);
  abrirSheet("overlay-gestion-productos");
});

// ---------- Reportes (datos reales guardados en el dispositivo) ----------
document.getElementById("btn-reportes").addEventListener("click", () => {
  const hoy = new Date().toISOString().split("T")[0];
  document.getElementById("reporte-desde").value = hoy;
  document.getElementById("reporte-hasta").value = hoy;
  document.getElementById("resultado-reportes").style.display = "none";
  const nombres = [...new Set(ventas.flatMap(v => v.items.map(i => i.product_name)))];
  document.getElementById("reporte-producto").innerHTML =
    `<option value="todos">Todos los productos</option>` + nombres.map(n => `<option value="${n}">${n}</option>`).join("");
  renderCorreos();
  abrirSheet("overlay-reportes");
});
document.getElementById("btn-cancelar-reportes").addEventListener("click", () => cerrarSheet("overlay-reportes"));

function ventasFiltradas() {
  const desde = new Date(document.getElementById("reporte-desde").value + "T00:00:00");
  const hasta = new Date(document.getElementById("reporte-hasta").value + "T23:59:59");
  const filtroProducto = document.getElementById("reporte-producto").value;
  return ventas
    .filter(v => { const d = new Date(v.created_at); return d >= desde && d <= hasta; })
    .map(v => filtroProducto === "todos" ? v : {...v, items: v.items.filter(i => i.product_name === filtroProducto)})
    .filter(v => v.items.length > 0);
}

document.getElementById("btn-consultar-reportes").addEventListener("click", () => {
  const filtradas = ventasFiltradas();
  const totalPeriodo = filtradas.reduce((s, v) => s + v.items.reduce((s2,i)=>s2+i.subtotal,0), 0);
  document.getElementById("reporte-total-monto").textContent = `$${Math.round(totalPeriodo).toLocaleString("es-CL")}`;
  document.getElementById("reporte-total-cantidad").textContent = `${filtradas.length} venta${filtradas.length===1?"":"s"}`;

  const porProducto = {};
  filtradas.forEach(v => v.items.forEach(i => {
    if (!porProducto[i.product_name]) porProducto[i.product_name] = {cantidad:0, total:0};
    porProducto[i.product_name].cantidad += i.quantity;
    porProducto[i.product_name].total += i.subtotal;
  }));
  document.getElementById("reporte-por-producto").innerHTML = Object.keys(porProducto).length
    ? Object.entries(porProducto).map(([nombre,d]) => `
        <div class="reporte-fila"><span class="izq">${nombre} (${d.cantidad.toFixed(2)})</span><span class="der">$${Math.round(d.total).toLocaleString("es-CL")}</span></div>
      `).join("")
    : `<div class="reporte-fila"><span class="izq">Sin ventas en este período.</span></div>`;

  document.getElementById("reporte-listado-ventas").innerHTML = filtradas.length
    ? filtradas.map(v => {
        const d = new Date(v.created_at);
        return `<div class="reporte-fila">
          <span class="izq">Venta #${v.id}<br><span class="hora-chica">${d.toLocaleDateString("es-CL")} - ${d.toLocaleTimeString("es-CL",{hour:"2-digit",minute:"2-digit"})}</span></span>
          <span class="der">$${Math.round(v.items.reduce((s,i)=>s+i.subtotal,0)).toLocaleString("es-CL")}</span>
        </div>`;
      }).join("")
    : `<div class="reporte-fila"><span class="izq">Sin ventas en este período.</span></div>`;

  document.getElementById("resultado-reportes").style.display = "block";
});

// ---------- Exportar (SheetJS, 100% local, sin internet) ----------
function construirFilasDetalle() {
  const filas = [["Fecha","Hora","N° Venta","Producto","Unidad","Cantidad","Precio Unitario","Subtotal"]];
  ventasFiltradas().forEach(v => {
    const d = new Date(v.created_at);
    const fecha = d.toLocaleDateString("es-CL");
    const hora = d.toLocaleTimeString("es-CL", {hour12:false});
    v.items.forEach(i => filas.push([fecha, hora, v.id, i.product_name, i.unit, i.quantity, i.unit_price, i.subtotal]));
  });
  const total = filas.slice(1).reduce((s,f) => s + f[7], 0);
  filas.push([]);
  filas.push(["","","","","","","TOTAL", total]);
  return filas;
}

function guardarArchivo(nombreArchivo, blob) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = nombreArchivo;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

document.getElementById("btn-descargar-excel").addEventListener("click", () => {
  const filas = construirFilasDetalle();
  const ws = XLSX.utils.aoa_to_sheet(filas);
  ws["!cols"] = [{wch:12},{wch:10},{wch:9},{wch:22},{wch:9},{wch:10},{wch:15},{wch:13}];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Detalle de ventas");
  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([wbout], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const hoy = new Date().toISOString().split("T")[0];
  guardarArchivo(`ventas_${hoy}.xlsx`, blob);
});

document.getElementById("btn-descargar-csv").addEventListener("click", () => {
  const filas = construirFilasDetalle();
  const csv = filas.map(f => f.join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
  const hoy = new Date().toISOString().split("T")[0];
  guardarArchivo(`ventas_${hoy}.csv`, blob);
});

// ---------- Correos predeterminados ----------
let correosPredeterminados = cargarDeStorage("correos_predeterminados", []);

function renderCorreos() {
  const cont = document.getElementById("lista-correos");
  cont.innerHTML = correosPredeterminados.length
    ? correosPredeterminados.map((correo, i) => `
        <button class="chip-correo" data-correo="${correo}">
          ${correo} <span class="quitar-correo" data-i="${i}">✕</span>
        </button>
      `).join("")
    : `<p style="color:#888;font-size:12.5px;">Aún no agregas correos. Escribe uno abajo.</p>`;

  cont.querySelectorAll(".chip-correo").forEach(chip => {
    chip.addEventListener("click", (e) => {
      if (e.target.classList.contains("quitar-correo")) return; // manejado aparte
      copiarCorreo(chip.dataset.correo);
    });
  });
  cont.querySelectorAll(".quitar-correo").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      correosPredeterminados.splice(parseInt(btn.dataset.i), 1);
      guardarEnStorage("correos_predeterminados", correosPredeterminados);
      renderCorreos();
    });
  });
}

function copiarCorreo(correo) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(correo).then(() => {
      alert(`Copiado: ${correo}\n\nAhora presiona "Enviar por correo" y pégalo en el campo "Para".`);
    }).catch(() => {
      alert(`Correo: ${correo}\n\n(No se pudo copiar automáticamente; anótalo o selecciónalo manualmente.)`);
    });
  } else {
    alert(`Correo: ${correo}`);
  }
}

document.getElementById("btn-agregar-correo").addEventListener("click", () => {
  const input = document.getElementById("nuevo-correo");
  const correo = input.value.trim();
  if (!correo || !correo.includes("@")) { alert("Ingresa un correo válido."); return; }
  if (!correosPredeterminados.includes(correo)) {
    correosPredeterminados.push(correo);
    guardarEnStorage("correos_predeterminados", correosPredeterminados);
    renderCorreos();
  }
  input.value = "";
});

// ---------- Compartir el Excel por correo (selector nativo del dispositivo) ----------
function generarExcelBlob() {
  const filas = construirFilasDetalle();
  const ws = XLSX.utils.aoa_to_sheet(filas);
  ws["!cols"] = [{wch:12},{wch:10},{wch:9},{wch:22},{wch:9},{wch:10},{wch:15},{wch:13}];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Detalle de ventas");
  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  return new Blob([wbout], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
}

document.getElementById("btn-enviar-correo").addEventListener("click", async () => {
  const blob = generarExcelBlob();
  const hoy = new Date().toISOString().split("T")[0];
  const nombreArchivo = `ventas_${hoy}.xlsx`;
  const archivo = new File([blob], nombreArchivo, { type: blob.type });

  if (navigator.canShare && navigator.canShare({ files: [archivo] })) {
    try {
      await navigator.share({
        files: [archivo],
        title: "Reporte de ventas - Verdulería",
        text: "Adjunto el reporte de ventas.",
      });
    } catch (e) {
      // el usuario canceló el selector, no hacer nada
    }
  } else {
    guardarArchivo(nombreArchivo, blob);
    alert("Este dispositivo no permite compartir archivos directamente. El Excel se descargó - ábrelo desde tu app de correo y adjúntalo manualmente.");
  }
});

// ---------- Utilidades ----------
function abrirSheet(id) { document.getElementById(id).classList.add("open"); }
function cerrarSheet(id) { document.getElementById(id).classList.remove("open"); }
document.querySelectorAll(".sheet-overlay").forEach(overlay => {
  overlay.addEventListener("click", (e) => { if (e.target === overlay) overlay.classList.remove("open"); });
});

renderProductos();
