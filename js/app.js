// Variables globales de estado
let todasLasNoticias = [];
let favoritos = JSON.parse(localStorage.getItem('noticias_favoritas')) || [];
let categoriaActual = 'todas';

// Al cargar el documento, inicializamos la app
document.addEventListener("DOMContentLoaded", () => {
    cargarNoticiasDesdeJSON();
    actualizarContadorGlobalFavoritos();
});

// 1. Cargar datos dinámicamente usando Fetch API
async function cargarNoticiasDesdeJSON() {
    try {
        const respuesta = await fetch('data/noticias.json');
        todasLasNoticias = await respuesta.json();
        
        // Inicializar vistas con los datos cargados
        renderizarHome();
        renderizarListado(todasLasNoticias);
    } catch (error) {
        console.error("Error cargando el archivo JSON de noticias:", error);
    }
}

// 2. Sistema de Enrutamiento Simple (Cambio de Vistas)
function switchView(viewName) {
    document.querySelectorAll('.view-section').forEach(section => {
        section.style.display = 'none';
    });
    document.getElementById(`view-${viewName}`).style.display = 'block';
    
    // Acciones específicas al entrar a una vista
    if (viewName === 'favoritos') {
        renderizarFavoritos();
    }

    if (viewName === 'admin') {
    renderizarAdmin();
    }    
    window.scrollTo(0, 0);
}

// 3. Renderizar Vista de Inicio (Muestra 4 destacadas)
function renderizarHome() {
    const container = document.getElementById('featured-news-container');
    container.innerHTML = '';
    
    // Tomamos las primeras 4 noticias como destacadas
    const destacadas = todasLasNoticias.slice(0, 4);
    destacadas.forEach(noticia => {
        container.appendChild(crearTarjetaNoticia(noticia));
    });
}

// 4. Renderizar Vista del Catálogo General
function renderizarListado(lista) {
    const container = document.getElementById('general-news-container');
    const contador = document.getElementById('results-counter');
    container.innerHTML = '';
    
    contador.innerText = `Resultados encontrados: ${lista.length}`;
    
    lista.forEach(noticia => {
        container.appendChild(crearTarjetaNoticia(noticia));
    });
}

// 5. Función Reutilizable para Construir Tarjetas de Noticias (DOM Manipulation)
function crearTarjetaNoticia(noticia) {
    const card = document.createElement('div');
    card.className = 'news-card';
    
    const esFav = favoritos.includes(noticia.id);
    
    card.innerHTML = `
        <img src="${noticia.imagen}" alt="${noticia.titulo}">
        <div class="card-body">
            <span class="tag-cat">${noticia.categoria}</span>
            <h3>${noticia.titulo}</h3>
            <p>${noticia.resumen}</p>
            <div class="card-actions">
                <span class="btn-text" onclick="verDetalleNoticia(${noticia.id})">Ver más →</span>
                <button class="btn-fav ${esFav ? 'active' : ''}" onclick="toggleFavorito(${noticia.id}, this)">
                    ❤
                </button>
            </div>
        </div>
    `;
    return card;
}

// 6. Buscador y Filtros Dinámicos combinados
function filterNews() {
    const textoBusqueda = document.getElementById('search-input').value.toLowerCase();
    
    const filtradas = todasLasNoticias.filter(noticia => {
        const matchesCategory = (categoriaActual === 'todas' || noticia.categoria === categoriaActual);
        const matchesText = noticia.titulo.toLowerCase().includes(textoBusqueda) || 
                            noticia.resumen.toLowerCase().includes(textoBusqueda);
        return matchesCategory && matchesText;
    });
    
    renderizarListado(filtradas);
}

function filterByCategory(categoria, botonElemento) {
    categoriaActual = categoria;
    
    // Cambiar estado visual de las pestañas
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    botonElemento.classList.add('active');
    
    filterNews(); // Vuelve a filtrar tomando en cuenta el buscador de texto
}

// 7. Visualizar Detalle de una Noticia en Particular
function verDetalleNoticia(id) {
    const noticia = todasLasNoticias.find(n => n.id === id);
    if (!noticia) return;
    
    const container = document.getElementById('article-detail');
    container.innerHTML = `
        <span class="tag-cat">${noticia.categoria}</span>
        <h1>${noticia.titulo}</h1>
        <div class="meta-info">Por <strong>${noticia.autor}</strong> el ${noticia.fecha}</div>
        <img src="${noticia.imagen}" class="detail-img" alt="${noticia.titulo}">
        <div class="detail-body">
            <p>${noticia.contenido}</p>
        </div>
    `;
    switchView('detalle');
}

// 8. Gestión de Favoritos Persistida (localStorage)
function toggleFavorito(id, boton) {
    if (favoritos.includes(id)) {
        favoritos = favoritos.filter(favId => favId !== id);
        boton.classList.remove('active');
    } else {
        favoritos.push(id);
        boton.classList.add('active');
    }
    
    localStorage.setItem('noticias_favoritas', JSON.stringify(favoritos));
    actualizarContadorGlobalFavoritos();
}

function actualizarContadorGlobalFavoritos() {
    document.getElementById('fav-counter').innerText = `(${favoritos.length})`;
}

function renderizarFavoritos() {
    const container = document.getElementById('favorites-news-container');
    container.innerHTML = '';
    
    const noticiasFavoritas = todasLasNoticias.filter(n => favoritos.includes(n.id));
    
    if (noticiasFavoritas.length === 0) {
        container.innerHTML = `<p style="grid-column: 1/-1; text-align:center; color:#666;">No has agregado noticias favoritas aún.</p>`;
        return;
    }
    
    noticiasFavoritas.forEach(noticia => {
        container.appendChild(crearTarjetaNoticia(noticia));
    });
}

// 9. Validación del Formulario de Contacto
function validateForm(event) {
    event.preventDefault(); // Detener el envío por defecto
    
    let isValid = true;
    
    const nombre = document.getElementById('nombre').value.trim();
    const correo = document.getElementById('correo').value.trim();
    const asunto = document.getElementById('asunto').value;
    const mensaje = document.getElementById('mensaje').value.trim();
    
    // Resetear mensajes de error
    document.querySelectorAll('.error-msg').forEach(msg => msg.style.display = 'none');
    
    if (nombre.length < 3) {
        document.getElementById('err-nombre').style.display = 'block';
        isValid = false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+\$/;
    if (!emailRegex.test(correo)) {
        document.getElementById('err-correo').style.display = 'block';
        isValid = false;
    }
    
    if (asunto === "") {
        document.getElementById('err-asunto').style.display = 'block';
        isValid = false;
    }
    
    if (mensaje.length < 10) {
        document.getElementById('err-mensaje').style.display = 'block';
        isValid = false;
    }
    
    if (isValid) {
        document.getElementById('contact-form').reset();
        const successBox = document.getElementById('form-success');
        successBox.style.display = 'block';
        
        setTimeout(() => {
            successBox.style.display = 'none';
        }, 5000);
    }
}
