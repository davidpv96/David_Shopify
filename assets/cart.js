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
        // Actualizar el subtotal
        document.getElementById('cart-subtotal').textContent = `$${(cart.total_price / 100).toFixed(2)}`;

        // Opcional: puedes actualizar otras partes de la UI como la cantidad total de ítems, el botón de checkout, etc.
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
        });
    });
});
