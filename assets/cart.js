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
        const formData = new FormData();
        formData.append(`updates[${key}]`, quantity);

        fetch('/cart/update.js', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            updateCartUI(data);
        })
        .catch(error => console.error('Error:', error));
    }

    function updateCartUI(cart) {
        // Formatear el total de acuerdo con la configuración de Shopify
        const formattedTotal = Shopify.formatMoney(cart.total_price, "{{ amount }}");

        document.getElementById('cart-subtotal').textContent = formattedTotal;

        cart.items.forEach(item => {
            const itemElement = document.querySelector(`tr[data-key="${item.key}"] .item-price`);
            if (itemElement) {
                const itemPrice = Shopify.formatMoney(item.line_price, "{{ amount }}");
                itemElement.textContent = itemPrice;
            }
        });
    }

    document.querySelectorAll('.btn-decrease').forEach(button => {
        button.addEventListener('click', function() {
            updateQuantity(this, false);
        });
    });

    document.querySelectorAll('.btn-increase').forEach(button => {
        button.addEventListener('click', function() {
            updateQuantity(this, true);
        });
    });

    document.querySelectorAll('.btn-remove').forEach(button => {
        button.addEventListener('click', function() {
            const key = this.getAttribute('data-key');
            updateCart(key, 0);
            document.querySelector(`tr[data-key="${key}"]`).remove();
            checkIfCartIsEmpty();
        });
    });

    function checkIfCartIsEmpty() {
        const remainingItems = document.querySelectorAll('tbody tr').length;
        if (remainingItems === 0) {
            updateCartUI({ item_count: 0 });
        }
    }
});
