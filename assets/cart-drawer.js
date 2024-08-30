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
    // Función para actualizar la cantidad en el drawer
    function updateQuantity(buttonOrInput, isIncrease, manual = false) {
        const key = buttonOrInput.getAttribute('data-key');
        const stock = buttonOrInput.getAttribute('data-stock');
        const input = document.querySelector(`.item-quantity[data-key="${key}"]`);
        let quantity = parseInt(input.value);

        if (manual) {
            if (stock !== null && stock !== '' && stock !== undefined && !isNaN(parseInt(stock))) {
                const stockValue = parseInt(stock);
                if (quantity > stockValue) {
                    quantity = stockValue;
                }
            }
        } else {
            if (stock === null || stock === '' || stock === undefined || isNaN(parseInt(stock))) {
                if (isIncrease) {
                    quantity++;
                } else if (!isIncrease && quantity > 1) {
                    quantity--;
                }
            } else {
                const stockValue = parseInt(stock);
                if (isIncrease && quantity < stockValue) {
                    quantity++;
                } else if (!isIncrease && quantity > 1) {
                    quantity--;
                }
            }
        }

        input.value = quantity;
        updateCart(key, quantity);
    }

    function updateCart(key, quantity) {
        axios.post('/cart/change.js', {
            id: key,
            quantity: quantity
        })
        .then(response => {
            const data = response.data;
            updateCartDrawerUI(data);
        })
        .catch(error => console.error('Error:', error));
    }

    function updateCartDrawerUI(cart) {
        const moneyFormat = document.querySelector('[data-money-format]').getAttribute('data-money-format');
        const formattedTotal = Shopify.formatMoney(cart.total_price, moneyFormat);
        document.getElementById('cart-drawer-total').textContent = formattedTotal;

        cart.items.forEach(item => {
            const quantityInput = document.querySelector(`.item-quantity[data-key="${item.key}"]`);
            if (quantityInput) {
                quantityInput.value = item.quantity;
            }
        });
    }

    document.querySelectorAll('.btn-increase').forEach(button => {
        button.addEventListener('click', function() {
            updateQuantity(this, true);
        });
    });

    document.querySelectorAll('.btn-decrease').forEach(button => {
        button.addEventListener('click', function() {
            updateQuantity(this, false);
        });
    });

    document.querySelectorAll('.item-quantity').forEach(input => {
        input.addEventListener('change', function() {
            updateQuantity(this, false, true);
        });
    });

    document.querySelectorAll('.btn-remove').forEach(button => {
        button.addEventListener('click', function() {
            const key = this.getAttribute('data-key');
            updateCart(key, 0);
            document.querySelector(`div[data-key="${key}"]`).remove();
        });
    });
});
