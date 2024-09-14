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

        number = (number / 100.0).toFixed(precision);

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
    const forms = document.querySelectorAll('#cart-form, #cart-drawer-form');
    
    const cartItemCount = document.getElementById('cart-item-count');
    let isUpdating = false;
    const updateQueue = [];

    // Función para verificar y ajustar el stock
    const checkAndAdjustStock = function() {
        const items = document.querySelectorAll('tr[data-key]');
        let adjustments = [];

        items.forEach(item => {
            const key = item.getAttribute('data-key');
            const input = item.querySelector(`input[name="updates[${key}]"]`);
            const currentQuantity = parseInt(input.value);
            const availableStock = parseInt(input.getAttribute('data-stock'));

            if (currentQuantity > availableStock) {
                adjustments.push({ key, newQuantity: availableStock });
            }
        });

        if (adjustments.length > 0) {
            adjustStock(adjustments);
        }
    };

    // Función para ajustar el stock
    const adjustStock = function(adjustments) {
        let updates = {};
        adjustments.forEach(adj => {
            updates[adj.key] = adj.newQuantity;
        });

        axios.post('/cart/update.js', { updates: updates })
            .then(response => {
                const data = response.data;
                updateCartUI(data);
                showAdjustmentNotification(adjustments);
            })
            .catch(error => {
                console.error('Error updating cart:', error);
            });
    };

    // Función para mostrar notificación de ajuste
    const showAdjustmentNotification = function(adjustments) {
        const notification = document.createElement('div');
        notification.className = 'bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4';
        notification.innerHTML = `
            <p class="font-bold">Atención</p>
            <p>Algunos productos en tu carrito han sido ajustados debido a cambios en el inventario:</p>
            <ul class="list-disc list-inside">
                ${adjustments.map(adj => `<li>Un producto ha sido ajustado a ${adj.newQuantity} unidades</li>`).join('')}
            </ul>
        `;
        
        const cartForm = document.getElementById('cart-form');
        cartForm.insertBefore(notification, cartForm.firstChild);
    };

    forms.forEach(form => {
        const updateQuantity = function(buttonOrInput, isIncrease, manual = false) {
            if (isUpdating) {
                updateQueue.push(() => updateQuantity(buttonOrInput, isIncrease, manual));
                return;
            }

            isUpdating = true;
            const key = buttonOrInput.getAttribute('data-key');
            const stock = buttonOrInput.getAttribute('data-stock');
            const input = form.querySelector(`input[name="updates[${key}]"]`);
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

            const buttons = form.querySelectorAll(`button[data-key="${key}"]`);
            buttons.forEach(button => button.disabled = true);
            input.disabled = true;

            updateCart(key, quantity, () => {
                buttons.forEach(button => button.disabled = false);
                input.disabled = false;
                isUpdating = false;

                if (updateQueue.length > 0) {
                    const nextUpdate = updateQueue.shift();
                    nextUpdate();
                }
            });
        };

        const updateCart = function(key, quantity, callback) {
            axios.post('/cart/change.js', {
                id: key,
                quantity: quantity
            })
            .then(response => {
                const data = response.data;
                updateCartUI(data);
                updateItemSubtotal(key, data);
                synchronizeQuantityInputs(key, quantity);
                if (window.shopifyCartDrawer && window.shopifyCartDrawer.updateCartItemCount) {
                    window.shopifyCartDrawer.updateCartItemCount(data.item_count);
                } else {
                    updateCartItemCount(data.item_count);
                }
                if (callback) callback();
            })
            .catch(error => {
                console.error('Error:', error);
                if (callback) callback();
            });
        };

        const updateCartItemCount = function(itemCount) {
            if (cartItemCount) {
                cartItemCount.textContent = itemCount;
            }
        };

        const synchronizeQuantityInputs = function(key, quantity) {
            const inputs = document.querySelectorAll(`input[name="updates[${key}]"]`);
            inputs.forEach(input => {
                input.value = quantity;
            });
        };

        const updateCartUI = function(cart) {
            const moneyFormat = document.querySelector('[data-money-format]').getAttribute('data-money-format');
            const formattedTotal = Shopify.formatMoney(cart.total_price, moneyFormat);

            const cartSubtotal = document.getElementById('cart-subtotal');
            const cartDrawerTotal = document.getElementById('cart-drawer-total');

            if (cartSubtotal) {
                cartSubtotal.textContent = formattedTotal;
            }
            if (cartDrawerTotal) {
                cartDrawerTotal.textContent = formattedTotal;
            }

            cart.items.forEach(item => {
                const subtotalElement = document.querySelectorAll(`.item-subtotal[data-key="${item.key}"]`);
                subtotalElement.forEach(element => {
                    const formattedSubtotal = Shopify.formatMoney(item.line_price, moneyFormat);
                    element.textContent = formattedSubtotal;
                });
            });

            checkIfCartIsEmpty(cart.item_count);
        };

        const updateItemSubtotal = function(key, cartData) {
            const item = cartData.items.find(item => item.key === key);
            if (item) {
                const subtotalElement = document.querySelectorAll(`.item-subtotal[data-key="${key}"]`);
                const moneyFormat = document.querySelector('[data-money-format]').getAttribute('data-money-format');
                const formattedSubtotal = Shopify.formatMoney(item.line_price, moneyFormat);
                subtotalElement.forEach(element => {
                    if (element) {
                        element.textContent = formattedSubtotal;
                    }
                });
            }
        };

        const checkIfCartIsEmpty = function(itemCount) {
            if (itemCount === 0) {
                document.querySelector('.max-w-7xl').innerHTML = `
                    <div class="text-center">
                        <h2 class="text-2xl font-semibold">Tu carrito está vacío</h2>
                        <a href="/collections/all" class="inline-block bg-[#1D495B] text-white py-2 px-4 rounded-md hover:bg-[#1D495B] mt-4">Seguir comprando</a>
                        <p class="mt-4">¿Tienes una cuenta? <a href="/account/login" class="text-[#1D495B] hover:text-[#1D495B] underline">Inicia sesión</a></p>
                    </div>`;
                
                const drawerElement = document.querySelector('.fixed.h-full.overflow-hidden');
                if (drawerElement) {
                    drawerElement.innerHTML = `
                        <div class="p-5 flex justify-between items-center bg-[#1D495B] text-white">
                            <h2 class="text-lg font-semibold">Tu carrito</h2>
                            <button @click="openCart = false" class="text-white hover:text-gray-300">
                                {% render 'icon-close' %}
                            </button>
                        </div>
                        <div class="p-5">
                            <p class="text-center">Tu carrito está vacío.</p>
                        </div>`;
                }
            }
        };
        form.querySelectorAll('.btn-decrease, .btn-increase').forEach(button => {
            button.addEventListener('click', function(event) {
                event.preventDefault();
                const isIncrease = this.classList.contains('btn-increase');
                updateQuantity(this, isIncrease);
            });
        });

        form.querySelectorAll('.item-quantity').forEach(input => {
            input.addEventListener('change', function(event) {
                event.preventDefault();
                updateQuantity(this, false, true);
            });
        });

        form.querySelectorAll('.btn-remove').forEach(button => {
            button.addEventListener('click', function(event) {
                event.preventDefault();
                const key = this.getAttribute('data-key');
                updateCart(key, 0, () => {
                    const rows = document.querySelectorAll(`tr[data-key="${key}"]`);
                    rows.forEach(row => row.remove());
                });
            });
        });
    });
    
    // Llamar a la función de verificación de stock al cargar la página
    checkAndAdjustStock();
});