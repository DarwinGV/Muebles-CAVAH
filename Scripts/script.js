// script.js

// Constantes
const apiKey = 'AIzaSyDUh-5jLX1CYpChTGuyEXEObjIL2JyCIuI';
const sheetId = '1j0Q6GEwEec4-kn8o8NWKaNGarh7lzsjge22dalsKkmo';
const sheetName = 'Mi.Pagina';
const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${sheetName}?key=${apiKey}`;

// Inicialización
document.addEventListener('DOMContentLoaded', initialize);

// Función para inicializar la carga de datos
function initialize() {
    fetchData(url).then(processData).catch(handleError);
    setupBuyButtons();
}

// Función para obtener los datos
function fetchData(url) {
    return fetch(url).then(response => response.json());
}

// Función para procesar los datos obtenidos
function processData(data) {
    const { encabezados, filas } = extractHeadersAndRows(data);
    const productos = organizeProducts(filas, encabezados);

    renderProductCards(productos, filas, encabezados);
}

// Función para extraer encabezados y filas
function extractHeadersAndRows(data) {
    const filas = data.values;
    const encabezados = filas[0];
    return { encabezados, filas };
}

// Función para organizar los productos
function organizeProducts(filas, encabezados) {
    const indices = getHeaderIndices(encabezados);
    const productos = {};

    filas.slice(1).forEach(fila => {
        const id = fila[indices.id];
        if (!productos[id]) {
            productos[id] = createProduct(fila, indices);
        }
        updateProduct(productos[id], fila, indices);
    });

    return productos;
}

// Función para crear un producto
function createProduct(fila, indices) {
    return {
        id: fila[indices.id],
        precio: fila[indices.precio],
        precioPROMO: fila[indices.precioPROMO],
        imagenes: [],
        colores: new Set(),
        bauleras: new Set(),
    };
}

// Función para actualizar un producto con nueva información
function updateProduct(producto, fila, indices) {
    producto.imagenes.push(...fila[indices.imagen].split(','));
    producto.colores.add(fila[indices.color]);
    producto.bauleras.add(fila[indices.baulera]);
}

// Función para obtener los índices de los encabezados
function getHeaderIndices(encabezados) {
    return {
        id: encabezados.indexOf("ID"),
        color: encabezados.indexOf("Color"),
        baulera: encabezados.indexOf("Baulera"),
        precio: encabezados.indexOf("Precio"),
        precioPROMO: encabezados.indexOf("PrecioPROMO"),
        imagen: encabezados.indexOf("x1800"),
    };
}

// Función para renderizar las tarjetas de productos
function renderProductCards(productos, filas, encabezados) {
    const contenedorTarjetas = document.getElementById('contenedor-tarjetas');
    const tarjetaProductoTemplate = document.querySelector('.tarjeta-producto').outerHTML.replace('style="display: none;"', '');

    Object.values(productos).forEach(producto => {
        const tarjeta = createProductCard(tarjetaProductoTemplate, producto, filas, encabezados);
        contenedorTarjetas.appendChild(tarjeta);
    });
}

// Función para crear una tarjeta de producto
function createProductCard(template, producto, filas, encabezados) {
    const div = document.createElement('div');
    div.innerHTML = template.replace('Nombre del Producto', producto.id);
    const tarjeta = div.firstElementChild;
    tarjeta.setAttribute('data-id', producto.id);

    setupSelectOptions(tarjeta, '#colores', producto.colores);
    setupSelectOptions(tarjeta, '#baulera', producto.bauleras);
    setupCardEvents(tarjeta, producto, filas, encabezados);

    return tarjeta;
}

// Función para configurar las opciones de los selectores
function setupSelectOptions(tarjeta, selector, options) {
    const select = tarjeta.querySelector(selector);
    options.forEach(optionValue => {
        const option = document.createElement('option');
        option.value = optionValue;
        option.textContent = optionValue;
        select.appendChild(option);
    });
}

// Función para configurar los eventos de la tarjeta
function setupCardEvents(tarjeta, producto, filas, encabezados) {
    const selectColores = tarjeta.querySelector('#colores');
    const selectBaulera = tarjeta.querySelector('#baulera');

    const updateContent = () => updateProductoContent(tarjeta, producto, filas, encabezados, selectColores, selectBaulera);
    selectColores.addEventListener('change', updateContent);
    selectBaulera.addEventListener('change', updateContent);
    updateContent();

    tarjeta.addEventListener('click', (event) => {
        if (event.target.classList.contains('producto-imagen') || event.target.classList.contains('vista-rapida')) {
            abrirModal(producto, filas, encabezados);
        }
    });

    const botonComprar = tarjeta.querySelector('.btn.comprar');
    botonComprar.addEventListener('click', (event) => {
        event.stopPropagation();
        const tarjetaProducto = event.target.closest('.tarjeta-producto');
        copiarProductoAlLocalStorage(tarjetaProducto);
        window.location.href = 'formulario.html';
    });
}

// Función para actualizar el contenido del producto
function updateProductoContent(tarjeta, producto, filas, encabezados, selectColores, selectBaulera) {
    const colorSeleccionado = selectColores.value;
    const bauleraSeleccionada = selectBaulera.value;
    const filaEncontrada = filas.find(fila => fila[encabezados.indexOf("ID")] === producto.id && fila[encabezados.indexOf("Color")] === colorSeleccionado && fila[encabezados.indexOf("Baulera")] === bauleraSeleccionada);

    if (filaEncontrada) {
        const precio = filaEncontrada[encabezados.indexOf("Precio")];
        const precioPROMO = filaEncontrada[encabezados.indexOf("PrecioPROMO")];
        tarjeta.querySelector('#producto-precio').textContent = `$${parseInt(precio).toLocaleString('es-AR')}`;
        tarjeta.querySelector('#producto-precio-promo').textContent = `$${parseInt(precioPROMO).toLocaleString('es-AR')}`;
        const productoImagen = tarjeta.querySelector('#producto-imagen');
        productoImagen.src = filaEncontrada[encabezados.indexOf("x1800")].split(',')[0];
        productoImagen.alt = producto.id;
    } else {
        tarjeta.querySelector('#producto-precio').textContent = '$0';
        tarjeta.querySelector('#producto-precio-promo').textContent = '$0';
        tarjeta.querySelector('#producto-imagen').src = '';
        tarjeta.querySelector('#producto-imagen').alt = '';
    }
}

// Función para manejar errores en la carga de datos
function handleError(error) {
    console.error('Error fetching data:', error);
}

// Función para configurar los botones de compra
function setupBuyButtons() {
    localStorage.removeItem('productoSeleccionado');

    const botonesComprar = document.querySelectorAll('.btn.comprar');
    botonesComprar.forEach(boton => {
        boton.addEventListener('click', (event) => {
            event.stopPropagation();
            let tarjetaProducto;
            const modalContent = document.querySelector('.modal-content');

            if (modalContent && getComputedStyle(modalContent).display === 'block') {
                const descripcionIND = modalContent.querySelector('.descripcionIND');
                if (descripcionIND) {
                    descripcionIND.remove();
                }
                tarjetaProducto = modalContent;
            } else {
                tarjetaProducto = event.target.closest('.tarjeta-producto');
            }

            copiarProductoAlLocalStorage(tarjetaProducto);
            window.location.href = 'formulario.html';
        });
    });
}

// Función para copiar el producto al localStorage
function copiarProductoAlLocalStorage(tarjetaProducto) {
    localStorage.removeItem('productoSeleccionado');
    if (tarjetaProducto) {
        // Reemplazar selectores por párrafos
        const tarjetaClonada = tarjetaProducto.cloneNode(true);
        const selectores = tarjetaClonada.querySelectorAll('select');
        
        selectores.forEach(selector => {
            const p = document.createElement('p');
            p.className = 'opciones-elegidas';
            p.innerText = selector.options[selector.selectedIndex].innerText;
            selector.replaceWith(p);
        });

        const contenido = tarjetaClonada.outerHTML;
        localStorage.setItem('productoSeleccionado', contenido);
    }
}
