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






  // Función para actualizar el carrito y la interfaz de usuario
  async function updateCart(key, quantity) {
    try {
      const response = await fetch(`/cart/change.js`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          id: key,
          quantity: quantity
        })
      });

      if (!response.ok) {
        throw new Error(`Error en la respuesta del servidor: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Carrito actualizado:", data);

      // Encontrar el ítem actualizado
      const updatedItem = data.items.find(item => item.key === key);

      // Actualizar o eliminar la fila del producto en la interfaz
      const itemRow = document.querySelector(`tr[data-key="${key}"]`);
      if (quantity <= 0) {
        if (itemRow) itemRow.remove();
      } else if (updatedItem && itemRow) {
        const quantityInput = itemRow.querySelector(".item-quantity");
        const itemPrice = itemRow.querySelector(".item-price");

        quantityInput.value = updatedItem.quantity;
        itemPrice.textContent = Shopify.formatMoney(updatedItem.line_price);
      }

      // Actualizar el subtotal
      const subtotalElement = document.getElementById("cart-subtotal");
      if (subtotalElement) {
        subtotalElement.textContent = Shopify.formatMoney(data.total_price);
      } else {
        console.error("Elemento con id 'cart-subtotal' no encontrado en el DOM.");
      }
    } catch (error) {
      console.error("Error al actualizar el carrito:", error);
      alert("Hubo un error al actualizar el carrito. Por favor, intenta de nuevo.");
    }
  }

  // Función genérica para manejar cambios de cantidad
  function changeQuantity(key, delta) {
    const itemRow = document.querySelector(`tr[data-key="${key}"]`);
    if (!itemRow) {
      console.error(`Fila del producto con key ${key} no encontrada.`);
      return;
    }

    const quantityInput = itemRow.querySelector(".item-quantity");
    const stockAttr = quantityInput.getAttribute("data-stock");
    const currentQuantity = parseInt(quantityInput.value) || 0;
    const stock = stockAttr ? parseInt(stockAttr) : Infinity;
    const newQuantity = currentQuantity + delta;

    if (newQuantity < 0) return;

    if (newQuantity > stock) {
      alert(`Lo sentimos, solo hay ${stock} unidades disponibles en stock.`);
      return;
    }

    updateCart(key, newQuantity);
  }

  // Eventos para el botón de disminuir cantidad
  document.querySelectorAll(".btn-decrease").forEach(button => {
    button.addEventListener("click", function() {
      const key = this.getAttribute("data-key");
      changeQuantity(key, -1);
    });
  });

  // Eventos para el botón de aumentar cantidad
  document.querySelectorAll(".btn-increase").forEach(button => {
    button.addEventListener("click", function() {
      const key = this.getAttribute("data-key");
      changeQuantity(key, 1);
    });
  });

  // Evento para cambiar cantidad manualmente desde el input
  document.querySelectorAll(".item-quantity").forEach(input => {
    input.addEventListener("change", function() {
      const key = this.getAttribute("data-key");
      const stockAttr = this.getAttribute("data-stock");
      const newQuantity = parseInt(this.value) || 0;
      const stock = stockAttr ? parseInt(stockAttr) : Infinity;

      if (newQuantity < 0) {
        this.value = 0;
        updateCart(key, 0);
        return;
      }

      if (newQuantity > stock) {
        alert(`Lo sentimos, solo hay ${stock} unidades disponibles en stock.`);
        this.value = stock;
        updateCart(key, stock);
        return;
      }

      updateCart(key, newQuantity);
    });
  });

  // Eventos para el botón de eliminar ítem
  document.querySelectorAll(".btn-remove").forEach(button => {
    button.addEventListener("click", function() {
      const key = this.getAttribute("data-key");
      updateCart(key, 0);
    });
  });
});