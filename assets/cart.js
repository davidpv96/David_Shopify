var Shopify = Shopify || {};
// ---------------------------------------------------------------------------
// Money format handler
// ---------------------------------------------------------------------------
Shopify.money_format = "${{amount}}";
Shopify.formatMoney = function(cents, format) {
  if (typeof cents == 'string') { cents = cents.replace('.',''); }
  var value = '';
  var placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
  var formatString = (format || this.money_format);

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
};

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
        axios.post('/cart/change.js', {
            id: key,
            quantity: quantity
        })
        .then(response => {
            const data = response.data;
            // Actualizar el subtotal y otros elementos del carrito
            updateCartUI(data);
            updateItemSubtotal(key, data);
        })
        .catch(error => console.error('Error:', error));
    }

    // Función para actualizar la interfaz de usuario del carrito
    function updateCartUI(cart) {
        // Obtener el formato de moneda desde el elemento data-attribute
        const moneyFormat = document.querySelector('[data-money-format]').getAttribute('data-money-format');
        
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
            // Actualizar el subtotal formateado con la función de Shopify
            const formattedTotal = Shopify.formatMoney(cart.total_price, moneyFormat);
            document.getElementById('cart-subtotal').textContent = formattedTotal;
        }
    }

    // Función para actualizar el subtotal de un ítem
    function updateItemSubtotal(key, cartData) {
        const item = cartData.items.find(item => item.key === key);
        if (item) {
            const subtotalElement = document.querySelector(`.item-subtotal[data-key="${key}"]`);
            const moneyFormat = document.querySelector('[data-money-format]').getAttribute('data-money-format');
            const formattedSubtotal = Shopify.formatMoney(item.line_price, moneyFormat);
            subtotalElement.textContent = formattedSubtotal;
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
