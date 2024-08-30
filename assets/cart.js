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
        const moneyFormat = document.getElementById('cart-subtotal').getAttribute('data-money-format');

        if (cart.item_count === 0) {
            document.querySelector('.max-w-7xl').innerHTML = `
                <div class="text-center">
                    <h2 class="text-2xl font-semibold">Your cart is empty</h2>
                    <a href="/" class="inline-block bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 mt-4">Continue shopping</a>
                    <p class="mt-4">Have an account? <a href="/account/login" class="text-green-600 hover:text-green-700 underline">Log in to check out faster.</a></p>
                </div>
            `;
        } else {
            const formattedTotal = moneyFormat
                .replace(/{{amount_with_comma_separator}}/g, (cart.total_price / 100).toLocaleString())
                .replace(/{{amount}}/g, (cart.total_price / 100).toFixed(2));

            document.getElementById('cart-subtotal').textContent = formattedTotal;

            cart.items.forEach(item => {
                const itemElement = document.querySelector(`tr[data-key="${item.key}"] .item-price`);
                if (itemElement) {
                    const itemPrice = moneyFormat
                        .replace(/{{amount_with_comma_separator}}/g, (item.line_price / 100).toLocaleString())
                        .replace(/{{amount}}/g, (item.line_price / 100).toFixed(2));
                    itemElement.textContent = itemPrice;
                }
            });
        }
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
