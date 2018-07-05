//= require slick-carousel/slick/slick.js

$(document).ready(function(){
  $('[data-slick]').slick({
    speed: 0,
    infinite: false,
    prevArrow: '<button class="Btn" aria-label="Previous" type="button">← Previous slide</button>',
    nextArrow: '<button class="Btn" aria-label="Next" type="button">Next slide →</button>',
    adaptiveHeight: true
  })
})
