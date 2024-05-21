async function fetchData() {
    const apiKey = 'AIzaSyDUh-5jLX1CYpChTGuyEXEObjIL2JyCIuI';
    const sheetId = '1j0Q6GEwEec4-kn8o8NWKaNGarh7lzsjge22dalsKkmo';
    const sheetName = 'Mi.Pagina';
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${sheetName}?key=${apiKey}`;

    console.log('Fetching data from URL:', url);
    const response = await fetch(url);
    const data = await response.json();
    console.log('Data fetched:', data);
    return data.values;
}

function processData(data) {
    const headers = data[0];
    const rows = data.slice(1);
    const productos = {};

    console.log('Processing data:', data);
    rows.forEach(row => {
        const rowData = {};
        headers.forEach((header, index) => {
            rowData[header] = row[index];
        });

        const id = rowData['ID'];
        const baulera = rowData['Baulera'];
        const color = rowData['Color'];
        const tamano = rowData['Tamaño'];
        const nombre = rowData['Nombre'];
        const imagenes = rowData['Imagenes'] ? rowData['Imagenes'].split(', ') : [];
        const precio = parseFloat(rowData['Precio']);

        if (!productos[id]) {
            productos[id] = { con: {}, sin: {} };
        }

        if (baulera === 'con') {
            productos[id]['con'][color] = {
                tamano: tamano,
                nombre: nombre,
                imagenes: imagenes,
                precio: precio
            };
        } else if (baulera === 'sin') {
            productos[id]['sin'][color] = {
                tamano: tamano,
                nombre: nombre,
                imagenes: imagenes,
                precio: precio
            };
        }
    });

    console.log('Processed products:', productos);
    return productos;
}

function createCarousel(images) {
    return `
        <div class="carousel">
            <img class="main-image" src="${images[0]}" alt="Producto">
            <div class="thumbnails">
                ${images.map((img, index) => `<img src="${img}" alt="Producto" class="${index === 0 ? 'selected' : ''}" onclick="changeMainImage(this)">`).join('')}
            </div>
        </div>
    `;
}

function createProductElement(id, product) {
    const conColors = Object.keys(product.con);
    const sinColors = Object.keys(product.sin);
    const defaultBaulera = 'con';
    const defaultColor = conColors.length > 0 ? conColors[0] : (sinColors.length > 0 ? sinColors[0] : null);

    if (!defaultColor || !product[defaultBaulera][defaultColor]) {
        console.warn(`Producto con ID ${id} no tiene datos completos.`);
        return '';
    }

    const defaultProduct = product[defaultBaulera][defaultColor];

    console.log('Creating product element for ID:', id);
    return `
        <article data-id="${id}">
            ${createCarousel(defaultProduct.imagenes)}
            <h2>${defaultProduct.nombre}</h2>
            <p>Precio: $<span class="precio">${defaultProduct.precio}</span></p>
            <label for="baulera-${id}">Baulera</label>
            <select id="baulera-${id}" class="baulera">
                <option value="con">Con Baulera</option>
                <option value="sin">Sin Baulera</option>
            </select>
            <label for="color-${id}">Color</label>
            <select id="color-${id}" class="color">
                ${conColors.map(color => `<option value="${color}">${color}</option>`).join('')}
            </select>
        </article>
    `;
}

function updateProductDetails(product, baulera, color, article) {
    const selectedProduct = product[baulera][color];
    if (!selectedProduct) {
        console.warn(`No se encontraron detalles para el producto con baulera ${baulera} y color ${color}.`);
        return;
    }
    console.log('Updating product details for:', baulera, color, selectedProduct);
    article.querySelector('.precio').innerText = selectedProduct.precio;
    const carousel = article.querySelector('.carousel');
    carousel.innerHTML = createCarousel(selectedProduct.imagenes);
    article.querySelector('h2').innerText = selectedProduct.nombre;
}

function changeMainImage(thumbnail) {
    const carousel = thumbnail.closest('.carousel');
    const mainImage = carousel.querySelector('.main-image');
    const allThumbnails = carousel.querySelectorAll('.thumbnails img');

    allThumbnails.forEach(thumb => thumb.classList.remove('selected'));
    thumbnail.classList.add('selected');
    mainImage.src = thumbnail.src;
}

async function main() {
    const data = await fetchData();
    const productos = processData(data);
    const productosContainer = document.getElementById('productos');

    Object.keys(productos).forEach(id => {
        const product = productos[id];
        const productElement = createProductElement(id, product);
        if (productElement) {
            productosContainer.innerHTML += productElement;
        }
    });

    document.querySelectorAll('article').forEach(article => {
        const id = article.getAttribute('data-id');
        const product = productos[id];
        const bauleraSelect = article.querySelector('.baulera');
        const colorSelect = article.querySelector('.color');

        bauleraSelect.addEventListener('change', () => {
            const baulera = bauleraSelect.value;
            console.log('Baulera seleccionada:', baulera);
            const colors = Object.keys(product[baulera]);
            colorSelect.innerHTML = colors.map(color => `<option value="${color}">${color}</option>`).join('');
            updateProductDetails(product, baulera, colors[0], article);
        });

        colorSelect.addEventListener('change', () => {
            const baulera = bauleraSelect.value;
            const color = colorSelect.value;
            console.log('Color seleccionado:', color);
            updateProductDetails(product, baulera, color, article);
        });

        // Trigger an initial change event to set the correct state
        bauleraSelect.dispatchEvent(new Event('change'));
    });
}

main();
