// Put your application javascript here
document.addEventListener('DOMContentLoaded', function () {
  function initSwiper(selector, config) {
    return new Swiper(selector, config);
  }

  // Slider existente
  initSwiper(".mySwiper", {
    slidesPerView: 1.2,
    spaceBetween: 20,
    breakpoints: {
      640: {
        slidesPerView: 1.5,
        spaceBetween: 20,
      },
      768: {
        slidesPerView: 2.5,
        spaceBetween: 20,
      },
      1024: {
        slidesPerView: 6,
        spaceBetween: 20,
      },
    },
    scrollbar: {
      el: ".swiper-scrollbar",
      hide: true,
    },
  });

  // Nuevo slider (solo texto)
  initSwiper(".myTextSwiper", {
    slidesPerView: 1,
    spaceBetween: 10,
    loop: true,
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    },
    autoplay: {
      delay: 3000,
    },
  });

  // Slider de testimonios
  initSwiper(".myTestimonialsSwiper", {
    slidesPerView: 1.5, // Muestra 1.5 slides en pantallas pequeñas
    spaceBetween: 20, // Espacio entre slides
    loop: true, // Para un deslizamiento infinito
    breakpoints: {
        640: {
            slidesPerView: 1.5, // 1.5 slides en pantallas pequeñas
            spaceBetween: 20,
        },
        768: {
            slidesPerView: 2.5, // 2.5 slides en pantallas medianas
            spaceBetween: 20,
        },
        1024: {
            slidesPerView: 4, // 4 slides en pantallas grandes
            spaceBetween: 20,
        },
    },
  });

  // Nuevo slider para características
  initSwiper(".myFeatureSwiper", {
    slidesPerView: 1,
    spaceBetween: 20,
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
    loop: false, // Asegúrate de que no esté en loop
    breakpoints: {
        640: {
            slidesPerView: 1,
            spaceBetween: 20,
        },
        768: {
            slidesPerView: 3,
            spaceBetween: 20,
        },
        1024: {
            slidesPerView: 4,
            spaceBetween: 20,
        },
    },
  });

  // Nuevo slider para productos
  initSwiper(".productSwiper", {
    slidesPerView: 1.5,
    spaceBetween: 20,
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    loop: false,
    breakpoints: {
        640: {
            slidesPerView: 1.5,
            spaceBetween: 20,
        },
        768: {
            slidesPerView: 2,
            spaceBetween: 20,
        },
        1024: {
            slidesPerView: 5,
            spaceBetween: 20,
        },
    },
  });






  document.addEventListener("DOMContentLoaded", function() {
    // Función para formatear el dinero
    function formatMoney(amount) {
      // Asumiendo que amount está en centavos
      return "$" + (amount / 100).toFixed(2);
    }
  
    // Función para actualizar el subtotal en la interfaz
    function updateSubtotal(totalPrice) {
      const subtotalElement = document.getElementById("cart-subtotal");
      if (subtotalElement) {
        try {
          let formatted;
          if (typeof Shopify !== 'undefined' && typeof Shopify.formatMoney === 'function') {
            formatted = Shopify.formatMoney(totalPrice);
          } else {
            // Fallback a formato de dinero simple si Shopify.formatMoney no está disponible
            formatted = formatMoney(totalPrice);
          }
          subtotalElement.textContent = formatted;
          console.log("Subtotal updated:", formatted);
        } catch (e) {
          console.error("Error formatting money:", e);
          // Fallback a formato de dinero simple en caso de error
          if (typeof totalPrice === 'number') {
            subtotalElement.textContent = "$" + (totalPrice / 100).toFixed(2);
          } else {
            subtotalElement.textContent = "$0.00";
          }
        }
      } else {
        console.error("Subtotal element with id 'cart-subtotal' not found");
      }
    }
  
    // Función para manejar el stock
    function getStock(stockAttr) {
      if (typeof stockAttr === 'undefined' || stockAttr === null || stockAttr.trim() === '') {
        return Infinity; // Stock ilimitado
      }
      const stock = parseInt(stockAttr, 10);
      return isNaN(stock) ? Infinity : stock;
    }
  
    // Función para actualizar la cantidad y el carrito
    function updateCart(key, quantity) {
      fetch(`/cart/change.js`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          id: key,
          quantity: quantity
        })
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log("Cart updated:", data);
  
        // Si la cantidad es 0, eliminamos la fila correspondiente
        if (quantity <= 0) {
          const row = document.querySelector(`tr[data-key="${key}"]`);
          if (row) {
            row.remove();
          } else {
            console.warn(`No row found for key: ${key}`);
          }
        } else {
          // Actualiza la cantidad y el precio del ítem en la interfaz
          const quantityInput = document.querySelector(`input[data-key="${key}"]`);
          if (quantityInput) {
            quantityInput.value = quantity;
          } else {
            console.warn(`No quantity input found for key: ${key}`);
          }
  
          const item = data.items.find(item => item.key === key);
          if (item) {
            const priceElement = document.querySelector(`tr[data-key="${key}"] .item-price`);
            if (priceElement) {
              if (typeof Shopify !== 'undefined' && typeof Shopify.formatMoney === 'function') {
                priceElement.textContent = Shopify.formatMoney(item.line_price);
              } else {
                // Fallback a formato de dinero simple si Shopify.formatMoney no está disponible
                priceElement.textContent = formatMoney(item.line_price);
              }
            } else {
              console.warn(`No price element found for key: ${key}`);
            }
          } else {
            console.warn(`No item found in response for key: ${key}`);
          }
        }
  
        // Actualizar el subtotal de la interfaz
        if (typeof data.total_price !== 'undefined') {
          updateSubtotal(data.total_price);
        } else {
          console.error("total_price not found in response data");
        }
      })
      .catch(error => {
        console.error("Error updating cart:", error);
      });
    }
  
    // Función para eliminar un ítem del carrito
    function removeItemFromCart(key) {
      updateCart(key, 0);
    }
  
    // Event listener para botones de disminuir cantidad
    document.querySelectorAll(".btn-decrease").forEach(button => {
      button.addEventListener("click", function() {
        const key = this.getAttribute("data-key");
        const stockAttr = this.getAttribute("data-stock");
        const stock = getStock(stockAttr);
        const quantityInput = document.querySelector(`input[data-key="${key}"]`);
        if (!quantityInput) {
          console.warn(`Quantity input not found for key: ${key}`);
          return;
        }
        const currentQuantity = parseInt(quantityInput.value, 10);
        if (isNaN(currentQuantity)) {
          console.warn(`Current quantity is NaN for key: ${key}`);
          return;
        }
        const newQuantity = currentQuantity - 1;
  
        if (newQuantity >= 0) {
          updateCart(key, newQuantity);
        }
      });
    });
  
    // Event listener para botones de aumentar cantidad
    document.querySelectorAll(".btn-increase").forEach(button => {
      button.addEventListener("click", function() {
        const key = this.getAttribute("data-key");
        const stockAttr = this.getAttribute("data-stock");
        const stock = getStock(stockAttr);
        const quantityInput = document.querySelector(`input[data-key="${key}"]`);
        if (!quantityInput) {
          console.warn(`Quantity input not found for key: ${key}`);
          return;
        }
        const currentQuantity = parseInt(quantityInput.value, 10);
        if (isNaN(currentQuantity)) {
          console.warn(`Current quantity is NaN for key: ${key}`);
          return;
        }
        const newQuantity = currentQuantity + 1;
  
        if (newQuantity <= stock) {
          updateCart(key, newQuantity);
        } else {
          alert(`Sorry, only ${stock} items in stock.`);
        }
      });
    });
  
    // Event listener para cambios manuales en la cantidad
    document.querySelectorAll(".item-quantity").forEach(input => {
      input.addEventListener("change", function() {
        const key = this.getAttribute("data-key");
        const stockAttr = this.getAttribute("data-stock");
        const stock = getStock(stockAttr);
        let newQuantity = parseInt(this.value, 10);
  
        if (isNaN(newQuantity)) {
          alert("Invalid quantity");
          this.value = 1; // Reset a 1 o algún valor por defecto
          newQuantity = 1;
        }
  
        if (newQuantity > stock) {
          alert(`Sorry, only ${stock} items in stock.`);
          this.value = stock;
          newQuantity = stock;
        }
  
        if (newQuantity <= 0) {
          removeItemFromCart(key);
        } else {
          updateCart(key, newQuantity);
        }
      });
    });
  
    // Event listener para botones de eliminar ítem
    document.querySelectorAll(".btn-remove").forEach(button => {
      button.addEventListener("click", function() {
        const key = this.getAttribute("data-key");
        removeItemFromCart(key);
      });
    });
  
});