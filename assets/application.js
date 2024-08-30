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






  // Función para actualizar la cantidad y el carrito utilizando axios
  function updateCart(key, quantity) {
    axios.post('/cart/change.js', {
      id: key,
      quantity: quantity
    })
    .then(res => {
      const format = document.querySelector("[data-money-format]").getAttribute("data-money-format");
      const totalPrice = res.data.total_price;
      const item = res.data.items.find(item => item.key === key);
      const itemPrice = Shopify.formatMoney(item.final_line_price, format);

      // Actualizar el subtotal y el total
      document.querySelector("#total-price").textContent = Shopify.formatMoney(totalPrice, format);

      // Actualizar el precio del item
      document.querySelector(`[data-key="${key}"] .line-item-price`).textContent = itemPrice;
      
      console.log("Carrito actualizado:", res.data);
    })
    .catch(error => console.error("Error al actualizar el carrito:", error));
  }

  // Decrease quantity
  document.querySelectorAll(".minus").forEach(button => {
    button.addEventListener("click", function() {
      let key = this.getAttribute("data-key");
      let stock = this.getAttribute("data-stock");
      stock = stock && !isNaN(stock) ? parseInt(stock) : Infinity; // Manejar stock ilimitado
      let quantityInput = document.querySelector(`input[data-key="${key}"]`);
      let currentQuantity = parseInt(quantityInput.value);
      let newQuantity = currentQuantity - 1;

      if (newQuantity >= 0) {
        quantityInput.value = newQuantity;
        updateCart(key, newQuantity);
      }
    });
  });

  // Increase quantity
  document.querySelectorAll(".plus").forEach(button => {
    button.addEventListener("click", function() {
      let key = this.getAttribute("data-key");
      let stock = this.getAttribute("data-stock");
      stock = stock && !isNaN(stock) ? parseInt(stock) : Infinity; // Manejar stock ilimitado
      let quantityInput = document.querySelector(`input[data-key="${key}"]`);
      let currentQuantity = parseInt(quantityInput.value);
      let newQuantity = currentQuantity + 1;

      if (newQuantity <= stock) {
        quantityInput.value = newQuantity;
        updateCart(key, newQuantity);
      } else {
        alert(`Sorry, only ${stock} items in stock.`);
      }
    });
  });

  // Update quantity on input change
  document.querySelectorAll(".item-quantity").forEach(input => {
    input.addEventListener("change", function() {
      let key = this.getAttribute("data-key");
      let stock = this.getAttribute("data-stock");
      stock = stock && !isNaN(stock) ? parseInt(stock) : Infinity; // Manejar stock ilimitado
      let newQuantity = parseInt(this.value);

      if (newQuantity > stock) {
        alert(`Sorry, only ${stock} items in stock.`);
        this.value = stock; // Restablecer al stock máximo
        newQuantity = stock;
      }

      if (newQuantity <= 0) {
        removeItemFromCart(key);
      } else {
        updateCart(key, newQuantity);
      }
    });
  });

  // Remove item
  document.querySelectorAll(".btn-remove").forEach(button => {
    button.addEventListener("click", function() {
      let key = this.getAttribute("data-key");
      removeItemFromCart(key);
    });
  });

  // Remove item from cart
  function removeItemFromCart(key) {
    updateCart(key, 0);
  }




  var Shopify = Shopify || {};

// Configuración del formato de dinero
Shopify.money_format = "${{amount}}";

// Función para formatear dinero
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

    var parts = number.split('.'),
        dollars = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + thousands),
        cents = parts[1] ? (decimal + parts[1]) : '';

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
});