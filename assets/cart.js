document.addEventListener('DOMContentLoaded', function() {
    const cartForm = document.getElementById('cart-form');

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

    // Función para enviar la actualización del carrito al servidor
    function updateCart(key, quantity) {
        const formData = new FormData(cartForm);

        fetch('/cart/update.js', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            // Actualizar el subtotal y otros elementos del carrito
            updateCartUI(data);
        })
        .catch(error => console.error('Error:', error));
    }

    // Función para actualizar la interfaz de usuario del carrito
    function updateCartUI(cart) {
        // Obtener el formato de moneda desde el elemento data-attribute
        const moneyFormat = document.getElementById('cart-subtotal').getAttribute('data-money-format');
        
        // Si el carrito está vacío
        if (cart.item_count === 0) {
            document.querySelector('.max-w-7xl').innerHTML = `
                <div class="text-center">
                    <h2 class="text-2xl font-semibold">Your cart is empty</h2>
                    <a href="/" class="inline-block bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 mt-4">Continue shopping</a>
                    <p class="mt-4">Have an account? <a href="/account/login" class="text-green-600 hover:text-green-700 underline">Log in to check out faster.</a></p>
                </div>
            `;
        } else {
            // Reemplazar el marcador {{amount}} o cualquier formato similar en el formato de moneda
            const formattedTotal = moneyFormat
                .replace(/{{amount_with_comma_separator}}/g, (cart.total_price / 100).toLocaleString())
                .replace(/{{amount}}/g, (cart.total_price / 100).toFixed(2));

            document.getElementById('cart-subtotal').textContent = formattedTotal;

            // Actualizar el precio de cada artículo individual
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
