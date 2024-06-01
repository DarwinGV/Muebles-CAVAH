function abrirModal(producto, filas, encabezados) {
    const modal = document.getElementById('product-modal');
    if (!modal) return;

    // Obtención de índices de las columnas relevantes
    const [indiceID, indiceColor, indiceBaulera, indicePrecio, indicePrecioPROMO, indiceImagen, indiceDescripcionIND] = 
        ["ID", "Color", "Baulera", "Precio", "PrecioPROMO", "x1800", "DescripcionIND"].map(col => encabezados.indexOf(col));

    // Selección de elementos del modal
    const modalNombre = modal.querySelector('#modal-producto-nombre');
    const modalPrecio = modal.querySelector('#modal-producto-precio');
    const modalPrecioPromo = modal.querySelector('#modal-producto-precio-promo');
    const modalImageContainer = modal.querySelector('.imagen-container');
    const modalSelectColores = modal.querySelector('#modal-colores');
    const modalSelectBaulera = modal.querySelector('#modal-baulera');
    const modalDescripcionIND = modal.querySelector('.descripcionIND');

    let currentImageIndex = 0;
    let imagenes = [];

    // Configuración de datos iniciales del producto en el modal
    if (modalNombre) modalNombre.textContent = producto.id;
    if (modalPrecio) modalPrecio.textContent = `$${parseInt(producto.precio).toLocaleString('es-AR')}`;
    if (modalPrecioPromo) modalPrecioPromo.textContent = `$${parseInt(producto.precioPROMO).toLocaleString('es-AR')}`;

    // Función para mostrar una imagen específica y su descripción
    const showImage = (index) => {
        const images = modalImageContainer.querySelectorAll('img');
        images.forEach((img, i) => img.classList.toggle('active', i === index));
        if (modalDescripcionIND && imagenes[index]) {
            modalDescripcionIND.innerHTML = imagenes[index].descripcion;
        }
    };

    // Configuración de imágenes en el modal
    if (modalImageContainer) {
        modalImageContainer.innerHTML = '';
        if (Array.isArray(producto.imagenes)) {
            imagenes = producto.imagenes.map((link, index) => {
                const img = document.createElement('img');
                img.src = link;
                img.alt = producto.id;
                img.dataset.index = index;
                modalImageContainer.appendChild(img);
                return { link, descripcion: producto.descripcion };
            });
            showImage(currentImageIndex);
        }
    }

    // Configuración de opciones de colores en el modal
    if (modalSelectColores) {
        modalSelectColores.innerHTML = '';
        if (producto.colores instanceof Set) {
            producto.colores.forEach(color => {
                const option = document.createElement('option');
                option.value = color;
                option.textContent = color;
                modalSelectColores.appendChild(option);
            });
        }
    }

    // Configuración de opciones de baulera en el modal
    if (modalSelectBaulera) {
        modalSelectBaulera.innerHTML = '';
        if (producto.bauleras instanceof Set) {
            producto.bauleras.forEach(baulera => {
                const option = document.createElement('option');
                option.value = baulera;
                option.textContent = baulera;
                modalSelectBaulera.appendChild(option);
            });
        }
    }

    // Función para actualizar el contenido del modal según las selecciones de color y baulera
    const updateModalContent = () => {
        const colorSeleccionado = modalSelectColores.value;
        const bauleraSeleccionada = modalSelectBaulera.value;
        const filaEncontrada = filas.find(fila => 
            fila[indiceID] === producto.id && fila[indiceColor] === colorSeleccionado && fila[indiceBaulera] === bauleraSeleccionada);
        
        if (filaEncontrada) {
            modalPrecio.textContent = `$${parseInt(filaEncontrada[indicePrecio]).toLocaleString('es-AR')}`;
            modalPrecioPromo.textContent = `$${parseInt(filaEncontrada[indicePrecioPROMO]).toLocaleString('es-AR')}`;
            modalImageContainer.innerHTML = '';
            imagenes = filaEncontrada[indiceImagen].split(',').map((link, index) => {
                const img = document.createElement('img');
                img.src = link;
                img.alt = producto.id;
                img.dataset.index = index;
                modalImageContainer.appendChild(img);
                return { link, descripcion: filaEncontrada[indiceDescripcionIND] };
            });
            currentImageIndex = 0;
            showImage(currentImageIndex);
            modalDescripcionIND.innerHTML = filaEncontrada[indiceDescripcionIND];
        } else {
            modalPrecio.textContent = '$0';
            modalPrecioPromo.textContent = '$0';
            modalImageContainer.innerHTML = '';
            modalDescripcionIND.innerHTML = '';
        }
    };

    // Eventos para cambiar contenido del modal según selecciones
    modalSelectColores.addEventListener('change', updateModalContent);
    modalSelectBaulera.addEventListener('change', updateModalContent);

    // Eventos para cambiar de imagen
    modal.querySelector('.prev').addEventListener('click', () => {
        currentImageIndex = (currentImageIndex - 1 + imagenes.length) % imagenes.length;
        showImage(currentImageIndex);
    });

    modal.querySelector('.next').addEventListener('click', () => {
        currentImageIndex = (currentImageIndex + 1) % imagenes.length;
        showImage(currentImageIndex);
    });

    // Mostrar el modal y actualizar contenido inicial
    modal.style.display = 'block';
    updateModalContent();

    // Cerrar el modal
    document.querySelector('.modal .close').onclick = () => modal.style.display = 'none';
    window.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };
}
