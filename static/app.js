const API = "/paradas";

const form = document.getElementById("form-parada");
const lista = document.getElementById("lista-paradas");
const mensaje = document.getElementById("mensaje");
const btnCancelar = document.getElementById("btn-cancelar");
const btnGuardar = document.getElementById("btn-guardar");
const titulo = document.getElementById("titulo-formulario");

// ============================================
// Mapa con Leaflet
// ============================================
const mapa = L.map("mapa").setView([19.0414, -98.2063], 13);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(mapa);

let marcadorSeleccionado = null;
const capaParadas = L.layerGroup().addTo(mapa);

// ============================================
// Utilidades
// ============================================
function escapar(texto) {
  const div = document.createElement("div");
  div.textContent = texto;
  return div.innerHTML;
}

function mostrarMensaje(texto, tipo) {
  mensaje.textContent = texto;
  mensaje.className = tipo;
}

function limpiarFormulario() {
  form.reset();
  document.getElementById("parada-id").value = "";
  btnCancelar.classList.add("oculto");
  btnGuardar.textContent = "Guardar";
  titulo.textContent = "Registrar parada";
}

// ============================================
// Listar paradas + marcadores
// ============================================
async function cargarParadas() {
  try {
    const respuesta = await fetch(API);
    if (!respuesta.ok) {
      throw new Error("No se pudo obtener la lista de paradas");
    }
    const datos = await respuesta.json();

    lista.innerHTML = "";
    capaParadas.clearLayers();

    if (!datos.paradas || datos.paradas.length === 0) {
      lista.innerHTML = "<p>No hay paradas registradas.</p>";
      return;
    }

    datos.paradas.forEach(parada => {
      const rutasTexto = parada.rutas.length > 0 ? parada.rutas.join(", ") : "Sin rutas";

      const tarjeta = document.createElement("article");
      tarjeta.className = "parada";
      tarjeta.innerHTML = `
        <h3>${escapar(parada.nombre)}</h3>
        <p><strong>ID:</strong> ${escapar(parada.id)}</p>
        <p><strong>Colonia:</strong> ${escapar(parada.colonia)}</p>
        <p><strong>Municipio:</strong> ${escapar(parada.municipio)}</p>
        <p><strong>Coordenadas:</strong> ${parada.latitud}, ${parada.longitud}</p>
        <p><strong>Rutas:</strong> ${escapar(rutasTexto)}</p>
        <p><strong>Estado:</strong> ${parada.activa ? "Activa" : "Inactiva"}</p>
        <div class="acciones">
          <button class="btn-editar" data-id="${escapar(parada.id)}">Editar</button>
          <button class="btn-eliminar" data-id="${escapar(parada.id)}">Eliminar</button>
          <button class="btn-ubicar" data-id="${escapar(parada.id)}">Ver en mapa</button>
        </div>
      `;
      lista.appendChild(tarjeta);

      const marcador = L.marker([parada.latitud, parada.longitud]).addTo(capaParadas);
      marcador.bindPopup(`
        <strong>${escapar(parada.nombre)}</strong><br>
        ${escapar(parada.colonia)}<br>
        Rutas: ${escapar(rutasTexto)}
      `);
      marcador.bindTooltip(parada.nombre);
    });
  } catch (error) {
    mostrarMensaje(error.message, "error");
  }
}

// ============================================
// Crear / actualizar
// ============================================
form.addEventListener("submit", async evento => {
  evento.preventDefault();

  const id = document.getElementById("parada-id").value;

  const rutas = document.getElementById("rutas").value
    .split(",")
    .map(ruta => ruta.trim())
    .filter(ruta => ruta !== "");

  const datos = {
    nombre: document.getElementById("nombre").value,
    colonia: document.getElementById("colonia").value,
    municipio: "Puebla",
    latitud: parseFloat(document.getElementById("latitud").value),
    longitud: parseFloat(document.getElementById("longitud").value),
    rutas,
    activa: document.getElementById("activa").value === "true"
  };

  const url = id ? `${API}/${id}` : API;
  const metodo = id ? "PUT" : "POST";

  try {
    const respuesta = await fetch(url, {
      method: metodo,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos)
    });

    if (!respuesta.ok) {
      const error = await respuesta.json();
      throw new Error(
        typeof error.detail === "string" ? error.detail : "Error al guardar"
      );
    }

    mostrarMensaje(
      id ? "Parada actualizada correctamente." : "Parada registrada correctamente.",
      "exito"
    );
    limpiarFormulario();
    cargarParadas();
  } catch (error) {
    mostrarMensaje(error.message, "error");
  }
});

// ============================================
// Editar
// ============================================
async function cargarParadaParaEditar(id) {
  try {
    const respuesta = await fetch(`${API}/${id}`);
    if (!respuesta.ok) {
      throw new Error("No se encontró la parada");
    }
    const parada = await respuesta.json();

    document.getElementById("parada-id").value = parada.id;
    document.getElementById("nombre").value = parada.nombre;
    document.getElementById("colonia").value = parada.colonia;
    document.getElementById("latitud").value = parada.latitud;
    document.getElementById("longitud").value = parada.longitud;
    document.getElementById("rutas").value = parada.rutas.join(", ");
    document.getElementById("activa").value = parada.activa.toString();

    btnCancelar.classList.remove("oculto");
    btnGuardar.textContent = "Actualizar";
    titulo.textContent = "Editar parada";
    form.scrollIntoView({ behavior: "smooth" });
  } catch (error) {
    mostrarMensaje(error.message, "error");
  }
}

// ============================================
// Eliminar
// ============================================
async function eliminarParada(id) {
  if (!confirm("¿Deseas eliminar esta parada?")) return;

  try {
    const respuesta = await fetch(`${API}/${id}`, { method: "DELETE" });
    if (!respuesta.ok) {
      throw new Error("No se pudo eliminar la parada.");
    }
    mostrarMensaje("Parada eliminada correctamente.", "exito");
    cargarParadas();
  } catch (error) {
    mostrarMensaje(error.message, "error");
  }
}

// ============================================
// Ver en mapa
// ============================================
async function ubicarParadaEnMapa(id) {
  try {
    const respuesta = await fetch(`${API}/${id}`);
    if (!respuesta.ok) {
      throw new Error("No se encontró la parada");
    }
    const parada = await respuesta.json();

    if (marcadorSeleccionado) {
      mapa.removeLayer(marcadorSeleccionado);
    }

    marcadorSeleccionado = L.marker([parada.latitud, parada.longitud]).addTo(mapa);
    marcadorSeleccionado
      .bindPopup(`
        <strong>${escapar(parada.nombre)}</strong><br>
        ${escapar(parada.colonia)}<br>
        Rutas: ${escapar(parada.rutas.join(", ") || "Sin rutas")}
      `)
      .openPopup();

    mapa.setView([parada.latitud, parada.longitud], 16);
    document.querySelector(".panel-mapa").scrollIntoView({ behavior: "smooth" });
  } catch (error) {
    mostrarMensaje(error.message, "error");
  }
}

// ============================================
// Eventos
// ============================================
lista.addEventListener("click", evento => {
  const boton = evento.target;
  const id = boton.dataset.id;
  if (!id) return;

  if (boton.classList.contains("btn-editar")) cargarParadaParaEditar(id);
  if (boton.classList.contains("btn-eliminar")) eliminarParada(id);
  if (boton.classList.contains("btn-ubicar")) ubicarParadaEnMapa(id);
});

btnCancelar.addEventListener("click", limpiarFormulario);
document.getElementById("btn-recargar").addEventListener("click", cargarParadas);

cargarParadas();