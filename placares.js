const API_KEY = 'AIzaSyDUh-5jLX1CYpChTGuyEXEObjIL2JyCIuI';
const SHEET_ID = '1j0Q6GEwEec4-kn8o8NWKaNGarh7lzsjge22dalsKkmo';

const prices = {};

fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Mi%20Pagina?key=${API_KEY}`)
    .then(response => response.json())
    .then(data => {
        const rows = data.values;
        rows.forEach(row => {
            const [type, baulera, color, size, price] = row;
            if (!prices[color]) prices[color] = {};
            if (!prices[color][baulera]) prices[color][baulera] = {};
            prices[color][baulera][size] = price;
        });
    })
    .catch(error => console.error('Error fetching data:', error));

document.querySelectorAll('.baulera, .color').forEach(select => {
    select.addEventListener('change', (event) => {
        const product = event.target.dataset.product;
        const baulera = document.querySelector(`.baulera[data-product="${product}"]`).value;
        const color = document.querySelector(`.color[data-product="${product}"]`).value;
        const price = prices[color] && prices[color][baulera] && prices[color][baulera][product];
        if (price) {
            document.getElementById(`price-${product}`).innerText = `$${parseInt(price).toLocaleString()}`;
        } else {
            document.getElementById(`price-${product}`).innerText = 'N/A';
        }
    });
});
