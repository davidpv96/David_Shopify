// function initializeAddToCart() {
//   document.querySelectorAll('form[action="/cart/add"]').forEach(function(form) {
//     form.addEventListener('submit', function(event) {
//       event.preventDefault();
      
//       const submitButton = form.querySelector('button[type="submit"]');
//       const originalButtonText = submitButton.textContent;
//       submitButton.disabled = true;
//       submitButton.textContent = 'Adding...';
      
//       const formData = new FormData(form);
      
//       fetch('/cart/add.js', {
//         method: 'POST',
//         body: formData
//       })
//       .then(response => response.json())
//       .then(item => {
//         updateCartDrawer();
//         if (typeof Alpine !== 'undefined') {
//           Alpine.store('cartDrawer').open = true;
//         }
//       })
//       .catch((error) => {
//         console.error('Error:', error);
//       })
//       .finally(() => {
//         submitButton.disabled = false;
//         submitButton.textContent = originalButtonText;
//       });
//     });
//   });
// }

// function updateCartDrawer() {
//   fetch('/cart.js')
//     .then(response => response.json())
//     .then(cart => {
//       updateCartDrawerContent(cart);
//       updateCartItemCount(cart.item_count);
//       if (typeof Alpine !== 'undefined') {
//         Alpine.store('cart').update(cart);
//       }
//     })
//     .catch(error => {
//       console.error('Error al actualizar el carrito:', error);
//     });
// }

// function updateCartItemQuantity(key, newQuantity) {
//   fetch('/cart/change.js', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({ id: key, quantity: newQuantity })
//   })
//   .then(response => response.json())
//   .then(cart => {
//     updateCartDrawerContent(cart);
//     updateCartItemCount(cart.item_count);
    
//     // Emitir evento personalizado con los datos actualizados del carrito
//     const updateEvent = new CustomEvent('cart-updated', { detail: { cart } });
//     window.dispatchEvent(updateEvent);

//     if (typeof Alpine !== 'undefined') {
//       Alpine.store('cart').update(cart);
//     }
//   })
//   .catch(error => {
//     console.error('Error al actualizar la cantidad:', error);
//   });
// }


// function updateCartDrawerContent(cart) {
//   const cartDrawerContent = document.querySelector('#cart-drawer-content');
//   if (!cartDrawerContent) {
//     console.error('Elemento #cart-drawer-content no encontrado');
//     return;
//   }

//   let html = '';
//   cart.items.forEach(item => {
//     html += `
//       <div class="flex py-6">
//         <div class="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
//           <img src="${item.image}" alt="${item.title}" class="h-full w-full object-cover object-center">
//         </div>
//         <div class="ml-4 flex flex-1 flex-col">
//           <div>
//             <div class="flex justify-between text-base font-medium text-gray-900">
//               <h3>${item.title}</h3>
//               <p class="ml-4">${formatMoney(item.price)}</p>
//             </div>
//             <p class="mt-1 text-sm text-gray-500">${item.variant_title}</p>
//           </div>
//           <div class="flex flex-1 items-end justify-between text-sm">
//             <div class="flex items-center">
//               <button onclick="window.shopifyCartDrawer.updateCartItemQuantity('${item.key}', ${item.quantity - 1})" class="px-2 py-1 border rounded">-</button>
//               <span class="mx-2">${item.quantity}</span>
//               <button onclick="window.shopifyCartDrawer.updateCartItemQuantity('${item.key}', ${item.quantity + 1})" class="px-2 py-1 border rounded">+</button>
//             </div>
//             <div class="flex">
//               <button onclick="window.shopifyCartDrawer.removeCartItem('${item.key}')" type="button" class="font-medium text-indigo-600 hover:text-indigo-500">Remove</button>
//             </div>
//           </div>
//         </div>
//       </div>
//     `;
//   });

//   cartDrawerContent.innerHTML = html;

//   const totalElement = document.querySelector('#cart-drawer-total');
//   if (totalElement) {
//     totalElement.textContent = formatMoney(cart.total_price);
//   } else {
//     console.error('Elemento #cart-drawer-total no encontrado');
//   }
// }

// function updateCartItemQuantity(key, newQuantity) {
//   fetch('/cart/change.js', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({ id: key, quantity: newQuantity })
//   })
//   .then(response => response.json())
//   .then(cart => {
//     updateCartDrawerContent(cart);
//     updateCartItemCount(cart.item_count);
//     if (typeof Alpine !== 'undefined') {
//       Alpine.store('cart').update(cart);
//     }
//   })
//   .catch(error => {
//     console.error('Error al actualizar la cantidad:', error);
//   });
// }

// function removeCartItem(key) {
//   updateCartItemQuantity(key, 0);
// }

// function updateCartItemCount(count) {
//   const cartCountElements = document.querySelectorAll('.cart-count, #cart-item-count');
//   cartCountElements.forEach(element => {
//     element.textContent = count;
//   });
// }

// function formatMoney(cents) {
//   return (cents / 100).toLocaleString('en-US', {
//     style: 'currency',
//     currency: 'USD',
//   });
// }

// window.shopifyCartDrawer = {
//   updateCartDrawer: updateCartDrawer,
//   updateCartItemQuantity: updateCartItemQuantity,
//   removeCartItem: removeCartItem,
//   updateCartItemCount: updateCartItemCount
// };

// document.addEventListener('DOMContentLoaded', function() {
//   initializeAddToCart();
//   updateCartDrawer();
// });

// document.addEventListener('shopify:section:load', initializeAddToCart);

// if (typeof Alpine !== 'undefined') {
//   document.addEventListener('alpine:init', () => {
//     Alpine.store('cartDrawer', {
//       open: false,
//       toggle() {
//         this.open = !this.open;
//       }
//     });

//     Alpine.store('cart', {
//       items: [],
//       total_price: 0,
//       item_count: 0,
//       update(newCart) {
//         this.items = newCart.items;
//         this.total_price = newCart.total_price;
//         this.item_count = newCart.item_count;
//         updateCartItemCount(newCart.item_count);
//       }
//     });
//   });
// }