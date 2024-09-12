function initializeAddToCart() {
    document.querySelectorAll('form[action="/cart/add"]').forEach(function(form) {
      form.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const submitButton = form.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.textContent = 'Adding...';
        
        const formData = new FormData(form);
        
        fetch('/cart/add.js', {
          method: 'POST',
          body: formData
        })
        .then(response => response.json())
        .then(addedItem => {
          // Obtener el estado actual del carrito
          return fetch('/cart.js').then(response => response.json());
        })
        .then(cart => {
          // Actualizar el contenido del cart drawer con los datos más recientes
          updateCartDrawerContent(cart);
          
          // Actualizar el contador del carrito en el header
          updateCartItemCount(cart.item_count);
  
          // Restablecer el botón y abrir el drawer
          submitButton.disabled = false;
          submitButton.textContent = originalButtonText;
          
          if (typeof Alpine !== 'undefined') {
            Alpine.store('cartDrawer').open = true;
          } else {
            console.error('Alpine.js no está disponible');
          }
        })
        .catch((error) => {
          console.error('Error:', error);
          submitButton.disabled = false;
          submitButton.textContent = originalButtonText;
        });
      });
    });
  }
  
  function updateCartDrawerContent(cart) {
    const cartDrawerContent = document.querySelector('#cart-drawer-content');
    if (!cartDrawerContent) {
      console.error('Elemento #cart-drawer-content no encontrado');
      return;
    }
  
    let html = '';
    cart.items.forEach(item => {
      html += `
        <div class="flex py-6">
          <div class="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
            <img src="${item.image}" alt="${item.title}" class="h-full w-full object-cover object-center">
          </div>
          <div class="ml-4 flex flex-1 flex-col">
            <div>
              <div class="flex justify-between text-base font-medium text-gray-900">
                <h3>${item.title}</h3>
                <p class="ml-4">${formatMoney(item.price)}</p>
              </div>
              <p class="mt-1 text-sm text-gray-500">${item.variant_title}</p>
            </div>
            <div class="flex flex-1 items-end justify-between text-sm">
              <div class="flex items-center">
                <button onclick="window.shopifyCartDrawer.updateCartItemQuantity('${item.key}', ${item.quantity - 1})" class="px-2 py-1 border rounded">-</button>
                <span class="mx-2">${item.quantity}</span>
                <button onclick="window.shopifyCartDrawer.updateCartItemQuantity('${item.key}', ${item.quantity + 1})" class="px-2 py-1 border rounded">+</button>
              </div>
              <div class="flex">
                <button onclick="window.shopifyCartDrawer.removeCartItem('${item.key}')" type="button" class="font-medium text-indigo-600 hover:text-indigo-500">Remove</button>
              </div>
            </div>
          </div>
        </div>
      `;
    });
  
    cartDrawerContent.innerHTML = html;
  
    // Actualizar el total
    const totalElement = document.querySelector('#cart-drawer-total');
    if (totalElement) {
      totalElement.textContent = formatMoney(cart.total_price);
    } else {
      console.error('Elemento #cart-drawer-total no encontrado');
    }
  
    // Actualizar el contador del carrito
    updateCartItemCount(cart.item_count);
  }
  
  function updateCartItemCount(count) {
    const cartCountElements = document.querySelectorAll('.cart-count, #cart-item-count');
    cartCountElements.forEach(element => {
      element.textContent = count;
    });
  }
  
  function formatMoney(cents) {
    return (cents / 100).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    });
  }
  
  function updateCartItemQuantity(key, newQuantity) {
    fetch('/cart.js')
      .then(response => response.json())
      .then(cart => {
        var item = cart.items.find(item => item.key === key);
        if (!item) return;
  
        var variant = variants.find(v => v.id === item.variant_id);
        if (!variant) return;
  
        if (variant.inventory_management === null || variant.inventory_policy === 'continue' || newQuantity <= variant.inventory_quantity) {
          // Hay suficiente stock o el producto permite venta sin stock
          fetch('/cart/change.js', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: key, quantity: newQuantity })
          })
          .then(response => response.json())
          .then(cart => {
            updateCartDrawerContent(cart);
            updateCartItemCount(cart.item_count);
          })
          .catch(error => {
            console.error('Error al actualizar la cantidad:', error);
          });
        } else {
          alert('No hay suficiente stock disponible');
        }
      });
  }
  
  function removeCartItem(key) {
    updateCartItemQuantity(key, 0);
  }
  
  document.addEventListener('DOMContentLoaded', initializeAddToCart);
  document.addEventListener('shopify:section:load', initializeAddToCart);
  
  window.shopifyCartDrawer = {
    updateCartDrawerContent: updateCartDrawerContent,
    updateCartItemQuantity: updateCartItemQuantity,
    removeCartItem: removeCartItem,
    updateCartItemCount: updateCartItemCount
  };
  
  if (typeof Alpine !== 'undefined') {
    document.addEventListener('alpine:init', () => {
      Alpine.store('cartDrawer', {
        open: false,
        toggle() {
          this.open = !this.open;
        }
      });
  
      Alpine.store('cart', {
        items: [],
        total_price: 0,
        item_count: 0,
        update(newCart) {
          this.items = newCart.items;
          this.total_price = newCart.total_price;
          this.item_count = newCart.item_count;
          updateCartItemCount(newCart.item_count);
        }
      });
    });
  }

  window.shopifyCartDrawer = {
    updateCartDrawerContent: updateCartDrawerContent,
    updateCartItemQuantity: updateCartItemQuantity,
    removeCartItem: removeCartItem,
    updateCartItemCount: updateCartItemCount
  };
  
  // Asegúrate de que estas líneas también estén al final del archivo
  document.addEventListener('DOMContentLoaded', initializeAddToCart);
  document.addEventListener('shopify:section:load', initializeAddToCart);