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
  });