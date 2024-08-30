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
            body: formData,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
        .then(response => response.json())
        .then(data => {
            updateCartUI(data);
        })
        .catch(error => console.error('Error:', error));
    }

    function updateCartUI(cart) {
        if (cart.item_count === 0) {
            document.querySelector('.max-w-7xl').innerHTML = `
                <div class="text-center">
                    <h2 class="text-2xl font-semibold">Your cart is empty</h2>
                    <a href="/" class="inline-block bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 mt-4">Continue shopping</a>
                    <p class="mt-4">Have an account? <a href="/account/login" class="text-green-600 hover:text-green-700 underline">Log in to check out faster.</a></p>
                </div>
            `;
        } else {
            document.getElementById('cart-subtotal').textContent = `S/. ${(cart.total_price / 100).toFixed(2)}`;
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
            updateCart(key, 0); // Enviar una cantidad de 0 para eliminar el producto

            // Después de eliminar, actualizar el carrito desde el servidor para asegurarse de que el estado sea correcto
            fetch('/cart.js')
                .then(response => response.json())
                .then(cart => {
                    updateCartUI(cart);
                    checkIfCartIsEmpty(cart);
                })
                .catch(error => console.error('Error:', error));
        });
    });

    function checkIfCartIsEmpty(cart) {
        if (cart.item_count === 0) {
            updateCartUI({ item_count: 0 });
        }
    }
});
