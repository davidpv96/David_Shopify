document.addEventListener('DOMContentLoaded', function() {
    const cartForm = document.getElementById('cart-form');

    function formatMoney(cents, format) {
        if (typeof cents == 'string') { cents = cents.replace('.',''); }
        var value = '';
        var placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
        var formatString = (format || '{{ amount }}');

        function defaultOption(opt, def) {
           return (typeof opt == 'undefined' ? def : opt);
        }

        function formatWithDelimiters(number, precision, thousands, decimal) {
            precision = defaultOption(precision, 2);
            thousands = defaultOption(thousands, ',');
            decimal   = defaultOption(decimal, '.');

            if (isNaN(number) || number == null) { return 0; }

            number = (number/100.0).toFixed(precision);

            var parts   = number.split('.'),
                dollars = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + thousands),
                cents   = parts[1] ? (decimal + parts[1]) : '';

            return dollars + cents;
        }

        switch(formatString.match(placeholderRegex)[1]) {
            case 'amount':
                value = formatWithDelimiters(cents, 2);
                break;
            case 'amount_no_decimals':
                value = formatWithDelimiters(cents, 0);
                break;
            case 'amount_with_comma_separator':
                value = formatWithDelimiters(cents, 2, '.', ',');
                break;
            case 'amount_no_decimals_with_comma_separator':
                value = formatWithDelimiters(cents, 0, '.', ',');
                break;
        }

        return formatString.replace(placeholderRegex, value);
    }

    function updateQuantity(button, isIncrease) {
        const key = button.getAttribute('data-key');
        const stock = parseInt(button.getAttribute('data-stock'));
        const input = document.querySelector(`input[name="updates[${key}]"]`);
        let quantity = parseInt(input.value);

        if (isIncrease && quantity < stock) {
            quantity++;
        } else if (!isIncrease && quantity > 1) {
            quantity--;
        }

        input.value = quantity;

        updateCart(key, quantity);
    }

    function updateCart(key, quantity) {
        fetch('/cart/change.js', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: key,
                quantity: quantity
            })
        })
        .then(response => response.json())
        .then(data => {
            updateCartUI(data);
        })
        .catch(error => console.error('Error:', error));
    }

    function updateCartUI(cart) {
        // Formatear el total de acuerdo con la configuración de Shopify
        const formattedTotal = formatMoney(cart.total_price, shopifyMoneyFormat);
    
        // Actualizar el subtotal en el DOM
        document.getElementById('cart-subtotal').textContent = formattedTotal;
    
        // Actualizar el precio de cada artículo en el carrito
        cart.items.forEach(item => {
            const itemElement = document.querySelector(`tr[data-key="${item.key}"]`);
            if (itemElement) {
                const itemPriceElement = itemElement.querySelector('.item-price');
                const itemQuantityElement = itemElement.querySelector('.item-quantity');
                if (itemPriceElement) {
                    const itemPrice = formatMoney(item.final_line_price, shopifyMoneyFormat);
                    itemPriceElement.textContent = itemPrice;
                }
                if (itemQuantityElement) {
                    itemQuantityElement.value = item.quantity;
                }
            }
        });

        checkIfCartIsEmpty();
    }

    document.querySelectorAll('.btn-decrease, .btn-increase').forEach(button => {
        button.addEventListener('click', function() {
            updateQuantity(this, this.classList.contains('btn-increase'));
        });
    });

    document.querySelectorAll('.btn-remove').forEach(button => {
        button.addEventListener('click', function() {
            const key = this.getAttribute('data-key');
            updateCart(key, 0);
        });
    });

    document.querySelectorAll('.item-quantity').forEach(input => {
        input.addEventListener('change', function() {
            const key = this.getAttribute('data-key');
            const quantity = parseInt(this.value);
            updateCart(key, quantity);
        });
    });

    function checkIfCartIsEmpty() {
        const remainingItems = document.querySelectorAll('tbody tr').length;
        if (remainingItems === 0) {
            location.reload(); // Recargar la página si el carrito está vacío
        }
    }
});