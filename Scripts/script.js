const apiKey = 'AIzaSyDUh-5jLX1CYpChTGuyEXEObjIL2JyCIuI';
const sheetId = '1j0Q6GEwEec4-kn8o8NWKaNGarh7lzsjge22dalsKkmo';
const sheetName = 'Mi.Pagina';
const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${sheetName}?key=${apiKey}`;

fetch(url)
    .then(response => response.json())
    .then(data => {
        const filas = data.values;
        const encabezados = filas[0];

        const indiceID = encabezados.indexOf("ID");
        const indiceColor = encabezados.indexOf("Color");
        const indiceBaulera = encabezados.indexOf("Baulera");
        const indicePrecio = encabezados.indexOf("Precio");
        const indicePrecioPROMO = encabezados.indexOf("PrecioPROMO");
        const indiceImagen = encabezados.indexOf("x1800");

        const contenedorTarjetas = document.getElementById('contenedor-tarjetas');
        const tarjetaProductoTemplate = document.querySelector('.tarjeta-producto').outerHTML.replace('style="display: none;"', '');

        const productos = {};

        filas.slice(1).forEach(fila => {
            const id = fila[indiceID];
            const color = fila[indiceColor];
            const baulera = fila[indiceBaulera];
            const precio = fila[indicePrecio];
            const precioPROMO = fila[indicePrecioPROMO];
            const imagenLinks = fila[indiceImagen].split(',');

            if (!productos[id]) {
                productos[id] = {
                    id,
                    precio,
                    precioPROMO,
                    imagenes: [],
                    colores: new Set(),
                    bauleras: new Set(),
                };
            }

            productos[id].imagenes.push(...imagenLinks);
            productos[id].colores.add(color);
            productos[id].bauleras.add(baulera);
        });

        Object.values(productos).forEach(producto => {
            const nuevaTarjeta = tarjetaProductoTemplate.replace('Nombre del Producto', producto.id);
            const div = document.createElement('div');
            div.innerHTML = nuevaTarjeta;
            const tarjeta = div.firstElementChild;
            tarjeta.setAttribute('data-id', producto.id);

            const selectColores = tarjeta.querySelector('#colores');
            producto.colores.forEach(color => {
                const option = document.createElement('option');
                option.value = color;
                option.textContent = color;
                selectColores.appendChild(option);
            });

            const selectBaulera = tarjeta.querySelector('#baulera');
            producto.bauleras.forEach(baulera => {
                const option = document.createElement('option');
                option.value = baulera;
                option.textContent = baulera;
                selectBaulera.appendChild(option);
            });

            const updateProductoContent = () => {
                const colorSeleccionado = selectColores.value;
                const bauleraSeleccionada = selectBaulera.value;
                const filaEncontrada = filas.find(fila => fila[indiceID] === producto.id && fila[indiceColor] === colorSeleccionado && fila[indiceBaulera] === bauleraSeleccionada);
                if (filaEncontrada) {
                    const precio = filaEncontrada[indicePrecio];
                    const precioPROMO = filaEncontrada[indicePrecioPROMO];
                    tarjeta.querySelector('#producto-precio').textContent = `$${parseInt(precio).toLocaleString('es-AR')}`;
                    tarjeta.querySelector('#producto-precio-promo').textContent = `$${parseInt(precioPROMO).toLocaleString('es-AR')}`;
                    const productoImagen = tarjeta.querySelector('#producto-imagen');
                    productoImagen.src = filaEncontrada[indiceImagen].split(',')[0];
                    productoImagen.alt = producto.id;
                } else {
                    tarjeta.querySelector('#producto-precio').textContent = '$0';
                    tarjeta.querySelector('#producto-precio-promo').textContent = '$0';
                    tarjeta.querySelector('#producto-imagen').src = '';
                    tarjeta.querySelector('#producto-imagen').alt = '';
                }
            };

            selectColores.addEventListener('change', updateProductoContent);
            selectBaulera.addEventListener('change', updateProductoContent);
            updateProductoContent();

            tarjeta.addEventListener('click', (event) => {
                if (event.target.classList.contains('producto-imagen') || event.target.classList.contains('vista-rapida')) {
                    abrirModal(producto, filas, encabezados);
                }
            });

            contenedorTarjetas.appendChild(tarjeta);
        });
    })
    .catch(error => console.error('Error fetching data:', error));
