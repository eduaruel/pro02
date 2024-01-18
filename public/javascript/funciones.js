   function initPayPalButton() {
        paypal
            .Buttons({
                style: {
                    shape: 'rect',
                    color: 'gold',
                    layout: 'vertical',
                    label: 'pay',
                },
                createOrder: function (data, actions) {
                    return actions.order.create({
                        purchase_units: [
                            {
                                description: 'DONA PARA REALIZAR TU PUBLICIDAD',
                                amount: { currency_code: 'USD', value: 13 },
                            },
                        ],
                    });
                },
                onApprove: function (data, actions) {
                    return actions.order.capture().then(function (orderData) {
                        console.log('Capture result', orderData, JSON.stringify(orderData, null, 2));
                        actions.redirect('LA URL DE TU PAGINA DE GRACIAS');
                    });
                },
                onError: function (err) {
                    console.log(err);
                },
            })
            .render('#paypal-button-container');
    }
    initPayPalButton();