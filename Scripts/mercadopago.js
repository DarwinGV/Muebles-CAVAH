document.addEventListener('DOMContentLoaded', function () {
    const mp = new MercadoPago('TEST-4946922c-435b-40d4-8acb-1b4d0e7f56dc', {
        locale: 'es-AR'
    });

    document.getElementById('checkout-btn').addEventListener('click', function () {
        // Obtenemos el título y el precio del producto
        const title = document.getElementById('producto-nombre').innerText;
        const unitPriceText = document.getElementById('producto-precio').innerText;
        const unitPrice = parseFloat(unitPriceText.replace('$', '').replace('.', '').replace(',', '.')); // Convertimos el precio a número

        // Configuramos la preferencia de pago
        const preference = {
            items: [
                {
                    title: title,
                    unit_price: unitPrice,
                    quantity: 1,
                }
            ]
        };

        fetch('https://api.mercadopago.com/checkout/preferences', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer TEST-1216538731724104-053120-6ac24b449432f02b09ddf6522e6f0b6e-180397090'
            },
            body: JSON.stringify(preference)
        })
        .then(response => response.json())
        .then(data => {
            mp.checkout({
                preference: {
                    id: data.id
                },
                autoOpen: true
            });
        })
        .catch(error => console.error('Error:', error));
    });
});
