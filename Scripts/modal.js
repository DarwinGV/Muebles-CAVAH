function abrirModal(producto, filas, encabezados) {
    const modal = document.getElementById('product-modal');
    if (!modal) return;

    const indiceID = encabezados.indexOf("ID");
    const indiceColor = encabezados.indexOf("Color");
    const indiceBaulera = encabezados.indexOf("Baulera");
    const indicePrecio = encabezados.indexOf("Precio");
    const indicePrecioPROMO = encabezados.indexOf("PrecioPROMO");
    const indiceImagen = encabezados.indexOf("x1800");
    const indiceDescripcionIND = encabezados.indexOf("DescripcionIND");

    const modalNombre = modal.querySelector('#modal-producto-nombre');
    const modalPrecio = modal.querySelector('#modal-producto-precio');
    const modalPrecioPromo = modal.querySelector('#modal-producto-precio-promo');
    const modalImageContainer = modal.querySelector('.imagen-container');
    const modalSelectColores = modal.querySelector('#modal-colores');
    const modalSelectBaulera = modal.querySelector('#modal-baulera');
    const modalDescripcionIND = modal.querySelector('.descripcionIND');

    let currentImageIndex = 0;
    let imagenes = [];

    if (modalNombre) modalNombre.textContent = producto.id;
    if (modalPrecio) modalPrecio.textContent = `$${parseInt(producto.precio).toLocaleString('es-AR')}`;
    if (modalPrecioPromo) modalPrecioPromo.textContent = `$${parseInt(producto.precioPROMO).toLocaleString('es-AR')}`;

    const showImage = (index) => {
        const images = modalImageContainer.querySelectorAll('img');
        images.forEach((img, i) => {
            img.classList.toggle('active', i === index);
        });
        if (modalDescripcionIND && imagenes[index]) {
            modalDescripcionIND.innerHTML = imagenes[index].descripcion; // Mostrar la descripción de la imagen actual
        }
    };

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

    const updateModalContent = () => {
        const colorSeleccionado = modalSelectColores.value;
        const bauleraSeleccionada = modalSelectBaulera.value;
        const filaEncontrada = filas.find(fila => fila[indiceID] === producto.id && fila[indiceColor] === colorSeleccionado && fila[indiceBaulera] === bauleraSeleccionada);
        if (filaEncontrada) {
            const precio = filaEncontrada[indicePrecio];
            const precioPROMO = filaEncontrada[indicePrecioPROMO];
            const descripcionIND = filaEncontrada[indiceDescripcionIND];

            modal.querySelector('#modal-producto-precio').textContent = `$${parseInt(precio).toLocaleString('es-AR')}`;
            modal.querySelector('#modal-producto-precio-promo').textContent = `$${parseInt(precioPROMO).toLocaleString('es-AR')}`;
            modalImageContainer.innerHTML = '';
            const imagenLinks = filaEncontrada[indiceImagen].split(',');
            console.log(imagenLinks)
            imagenes = imagenLinks.map((link, index) => {
                const img = document.createElement('img');
                img.src = link;
                img.alt = producto.id;
                img.dataset.index = index;
                modalImageContainer.appendChild(img);
                return { link, descripcion: descripcionIND }; // Agregar la descripción a cada imagen
            });
            currentImageIndex = 0;
            showImage(currentImageIndex);

            if (modalDescripcionIND) {
                modalDescripcionIND.innerHTML = descripcionIND;
            }
        } else {
            modal.querySelector('#modal-producto-precio').textContent = '$0';
            modal.querySelector('#modal-producto-precio-promo').textContent = '$0';
            modalImageContainer.innerHTML = '';
            if (modalDescripcionIND) {
                modalDescripcionIND.innerHTML = '';
            }
        }
    };

    modalSelectColores.addEventListener('change', updateModalContent);
    modalSelectBaulera.addEventListener('change', updateModalContent);

    modal.querySelector('.prev').addEventListener('click', () => {
        currentImageIndex = (currentImageIndex - 1 + imagenes.length) % imagenes.length;
        showImage(currentImageIndex);
        console.log(currentImageIndex)
    });

    modal.querySelector('.next').addEventListener('click', () => {
        currentImageIndex = (currentImageIndex + 1) % imagenes.length;
        showImage(currentImageIndex);
        console.log(currentImageIndex)
    });

    modal.style.display = 'block';

    updateModalContent();

    document.querySelector('.modal .close').onclick = () => {
        modal.style.display = 'none';
    };

    window.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };
}
