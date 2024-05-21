const SPREADSHEET_ID = '1j0Q6GEwEec4-kn8o8NWKaNGarh7lzsjge22dalsKkmo';
const RANGE_CATEGORIES = 'MiPagina.Categoria';
const RANGE_ARTICLES = 'MiPagina.Articulos';
const RANGE_PRICES = [
    'MiPagina.Tarjeta.BlancoSin',
    'MiPagina.Tarjeta.BlancoCon',
    'MiPagina.Tarjeta.ColorSin',
    'MiPagina.Tarjeta.ColorCon',
    'MiPagina.Transferencia.BlancoSin',
    'MiPagina.Transferencia.BlancoCon',
    'MiPagina.Transferencia.ColorSin',
    'MiPagina.Transferencia.ColorCon'
];

function loadClient() {
    gapi.client.setApiKey('AIzaSyDUh-5jLX1CYpChTGuyEXEObjIL2JyCIuI');
    return gapi.client.load("https://sheets.googleapis.com/$discovery/rest?version=v4")
        .then(() => fetchCategories(), (error) => console.error("Error loading GAPI client for API", error));
}

function fetchCategories() {
    gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: RANGE_CATEGORIES,
    }).then(response => {
        const categories = response.result.values;
        fetchArticles(categories);
    }, error => console.error("Error fetching categories", error));
}

function fetchArticles(categories) {
    gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: RANGE_ARTICLES,
    }).then(response => {
        const articles = response.result.values;
        fetchPrices(categories, articles);
    }, error => console.error("Error fetching articles", error));
}

function fetchPrices(categories, articles) {
    const requests = RANGE_PRICES.map(range => {
        return gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: range,
        });
    });

    Promise.all(requests).then(responses => {
        const prices = responses.map(response => response.result.values);
        buildStore(categories, articles, prices);
    }).catch(error => console.error("Error fetching prices", error));
}

function buildStore(categories, articles, prices) {
    const storeContainer = document.getElementById('store-container');

    categories.forEach(category => {
        const categoryElement = document.createElement('div');
        categoryElement.className = 'category';
        categoryElement.innerHTML = `<h2>${category[0]}</h2>`;

        const categoryArticles = articles.filter(article => article[1] === category[0]);
        categoryArticles.forEach(article => {
            const articleElement = document.createElement('div');
            articleElement.className = 'article';
            articleElement.innerHTML = `
                <img src="https://muebles-cavah.com.ar/wp-content/uploads/2022/05/1-28.jpeg" alt="${article[0]}">
                <div class="article-details">
                    <h3>${article[0]}</h3>
                    <div>
                        <label for="baulera-${article[0]}">Baulera:</label>
                        <select id="baulera-${article[0]}" class="baulera">
                            <option value="Sin Baulera">Sin Baulera</option>
                            <option value="Con Baulera">Con Baulera</option>
                        </select>
                    </div>
                    <div>
                        <label for="color-${article[0]}">Color:</label>
                        <select id="color-${article[0]}" class="color">
                            <option value="Blanco">Blanco</option>
                            <option value="Negro">Negro</option>
                            <option value="Textil gris">Textil gris</option>
                            <option value="Wengue">Wengue</option>
                            <option value="Roble">Roble</option>
                        </select>
                    </div>
                    <div class="price" id="price-${article[0]}">Precio: ${prices[0][articles.indexOf(article)][0]}</div>
                    <div class="promo-price" id="promo-price-${article[0]}">Precio PROMO Transferencia: ${prices[4][articles.indexOf(article)][0]}</div>
                </div>
            `;
            categoryElement.appendChild(articleElement);

            const bauleraSelect = articleElement.querySelector('.baulera');
            const colorSelect = articleElement.querySelector('.color');
            bauleraSelect.addEventListener('change', () => updatePrice(article[0], prices));
            colorSelect.addEventListener('change', () => updatePrice(article[0], prices));
        });

        storeContainer.appendChild(categoryElement);
    });
}

function updatePrice(articleId, prices) {
    const baulera = document.getElementById(`baulera-${articleId}`).value;
    const color = document.getElementById(`color-${articleId}`).value;

    let priceIndex, promoPriceIndex;
    if (color === 'Blanco' && baulera === 'Sin Baulera') {
        priceIndex = 0;
        promoPriceIndex = 4;
    } else if (color === 'Blanco' && baulera === 'Con Baulera') {
        priceIndex = 1;
        promoPriceIndex = 5;
    } else if (color !== 'Blanco' && baulera === 'Sin Baulera') {
        priceIndex = 2;
        promoPriceIndex = 6;
    } else if (color !== 'Blanco' && baulera === 'Con Baulera') {
        priceIndex = 3;
        promoPriceIndex = 7;
    }

    const price = prices[priceIndex][articleId][0];
    const promoPrice = prices[promoPriceIndex][articleId][0];

    document.getElementById(`price-${articleId}`).innerText = `Precio: ${price}`;
    document.getElementById(`promo-price-${articleId}`).innerText = `Precio PROMO Transferencia: ${promoPrice}`;
}

gapi.load("client", loadClient);
