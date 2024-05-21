const API_KEY = 'AIzaSyDUh-5jLX1CYpChTGuyEXEObjIL2JyCIuI';
const SHEET_ID = '1j0Q6GEwEec4-kn8o8NWKaNGarh7lzsjge22dalsKkmo';

const bauleraPrices = {};

fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Mi%20Pagina?key=${API_KEY}`)
    .then(response => response.json())
    .then(data => {
        const rows = data.values;
        rows.forEach(row => {
            const [type, color, size, price] = row;
            if (type === 'baulera') {
                if (!bauleraPrices[color]) bauleraPrices[color] = {};
                bauleraPrices[color][size] = price;
            }
        });
    })
    .catch(error => console.error('Error fetching data:', error));

document.querySelectorAll('.color').forEach(select => {
    select.addEventListener('change', (event) => {
        const product = event.target.dataset.product;
        const color = event.target.value;
        const price = bauleraPrices[color] && bauleraPrices[color][product];
        if (price) {
            document.getElementById(`price-baulera-${product}`).innerText = `$${parseInt(price).toLocaleString()}`;
        } else {
            document.getElementById(`price-baulera-${product}`).innerText = 'N/A';
        }
    });
});
