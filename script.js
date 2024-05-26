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

        const valoresUnicosID = [...new Set(filas.slice(1).map(fila => fila[indiceID]).filter(valor => valor))];
        const valoresUnicosColor = [...new Set(filas.slice(1).map(fila => fila[indiceColor]).filter(valor => valor))];
        const valoresUnicosBaulera = [...new Set(filas.slice(1).map(fila => fila[indiceBaulera]).filter(valor => valor))];

        const contenedorTarjetas = document.getElementById('contenedor-tarjetas');
        const tarjetaProductoTemplate = document.querySelector('.tarjeta-producto').outerHTML.replace('style="display: none;"', '');

        valoresUnicosID.forEach(id => {
            const nuevaTarjeta = tarjetaProductoTemplate.replace('Nombre del Producto', id);
            const div = document.createElement('div');
            div.innerHTML = nuevaTarjeta;
            const tarjeta = div.firstElementChild;

            const selectColores = tarjeta.querySelector('#colores');
            valoresUnicosColor.forEach(color => {
                const option = document.createElement('option');
                option.value = color;
                option.textContent = color;
                selectColores.appendChild(option);
            });

            const selectBaulera = tarjeta.querySelector('#baulera');
            valoresUnicosBaulera.forEach(baulera => {
                const option = document.createElement('option');
                option.value = baulera;
                option.textContent = baulera;
                selectBaulera.appendChild(option);
            });

            const actualizarContenido = () => {
                const colorSeleccionado = selectColores.value;
                const bauleraSeleccionada = selectBaulera.value;
                const filaEncontrada = filas.find(fila => fila[indiceID] === id && fila[indiceColor] === colorSeleccionado && fila[indiceBaulera] === bauleraSeleccionada);
                if (filaEncontrada) {
                    const precio = filaEncontrada[indicePrecio];
                    const precioPROMO = filaEncontrada[indicePrecioPROMO];
                    tarjeta.querySelector('#producto-precio').textContent = `$${parseInt(precio).toLocaleString('es-AR')}`;
                    tarjeta.querySelector('#producto-precio-promo').textContent = `$${parseInt(precioPROMO).toLocaleString('es-AR')}`;
                    
                    // Update image
                    const imagenLinks = filaEncontrada[indiceImagen].split(',')[0];
                    const productoImagen = tarjeta.querySelector('#producto-imagen');
                    productoImagen.src = imagenLinks;
                    productoImagen.alt = id;
                } else {
                    tarjeta.querySelector('#producto-precio').textContent = '$0';
                    tarjeta.querySelector('#producto-precio-promo').textContent = '$0';
                    tarjeta.querySelector('#producto-imagen').src = '';
                    tarjeta.querySelector('#producto-imagen').alt = '';
                }
            };

            // Initialize content
            actualizarContenido();

            selectColores.addEventListener('change', actualizarContenido);
            selectBaulera.addEventListener('change', actualizarContenido);

            contenedorTarjetas.appendChild(tarjeta);
        });
    })
    .catch(error => console.error('Error fetching data:', error));
