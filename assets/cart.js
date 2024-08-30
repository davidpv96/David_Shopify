document.addEventListener('DOMContentLoaded', function() {
    // Función para enviar la actualización del carrito al servidor
    function updateCart(key, quantity) {
        const formData = new FormData();
        formData.append('updates[' + key + ']', quantity);

        fetch('/cart/update.js', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            // Actualizar la UI del carrito con los nuevos datos
            updateCartUI(data);
        })
        .catch(error => console.error('Error:', error));
    }

    // Función para actualizar la cantidad
    function updateQuantity(button, isIncrease) {
        const key = button.getAttribute('data-key');
        const stock = parseInt(button.getAttribute('data-stock'));
        const input = document.querySelector(`input[name="updates[${key}]"]`);
        let quantity = parseInt(input.value);

        // Aumentar o disminuir la cantidad
        if (isIncrease && quantity < stock) {
            quantity++;
        } else if (!isIncrease && quantity > 1) {
            quantity--;
        }

        // Actualizar el valor del input
        input.value = quantity;

        // Enviar actualización al servidor
        updateCart(key, quantity);
    }

    // Función para actualizar la interfaz de usuario del carrito
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
            // Actualizar el subtotal usando el valor formateado en Liquid
            document.getElementById('cart-subtotal').textContent = cart.total_price.toLocaleString('en-US', {
                style: 'currency',
                currency: cart.currency
            });

            // Actualizar cada línea del carrito
            cart.items.forEach(item => {
                const priceElement = document.querySelector(`.item-price[data-key="${item.key}"]`);
                if (priceElement) {
                    priceElement.textContent = item.line_price.toLocaleString('en-US', {
                        style: 'currency',
                        currency: cart.currency
                    });
                }
            });
        }
    }

    // Asignar eventos a los botones de decremento
    document.querySelectorAll('.btn-decrease').forEach(button => {
        button.addEventListener('click', function() {
            updateQuantity(this, false);
        });
    });

    // Asignar eventos a los botones de incremento
    document.querySelectorAll('.btn-increase').forEach(button => {
        button.addEventListener('click', function() {
            updateQuantity(this, true);
        });
    });

    // Asignar evento al botón de eliminar
    document.querySelectorAll('.btn-remove').forEach(button => {
        button.addEventListener('click', function() {
            const key = this.getAttribute('data-key');
            updateCart(key, 0); // Enviar una cantidad de 0 para eliminar el producto
            document.querySelector(`tr[data-key="${key}"]`).remove(); // Eliminar la fila de la tabla
            checkIfCartIsEmpty();
        });
    });

    // Función para verificar si el carrito está vacío después de eliminar un ítem
    function checkIfCartIsEmpty() {
        const remainingItems = document.querySelectorAll('tbody tr').length;
        if (remainingItems === 0) {
            updateCartUI({ item_count: 0 });
        }
    }
});
