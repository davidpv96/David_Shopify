document.addEventListener('DOMContentLoaded', function() {
    const cartForm = document.getElementById('cart-form');

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
        // Obtener el formato de moneda desde el atributo data-money-format
        const moneyFormat = document.getElementById('cart-subtotal').getAttribute('data-money-format');

        // Actualizar el subtotal en el DOM
        const formattedTotal = Shopify.formatMoney(cart.total_price, moneyFormat);
        document.getElementById('cart-subtotal').textContent = formattedTotal;

        // Actualizar el precio de cada artículo en el carrito
        cart.items.forEach(item => {
            const itemElement = document.querySelector(`tr[data-key="${item.key}"]`);
            if (itemElement) {
                const itemPriceElement = itemElement.querySelector('.item-price');
                if (itemPriceElement) {
                    const itemPrice = Shopify.formatMoney(item.final_line_price, moneyFormat);
                    itemPriceElement.textContent = itemPrice;
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