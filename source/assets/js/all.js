//= require jquery/dist/jquery
//= require vivus/dist/vivus
//= require inviewport/inviewport.jquery
//= require headroom.js/dist/headroom
//= require headroom.js/dist/jQuery.headroom

$(window).load(function(){
  $('.TimelineItem-pics--jelly > img').inviewport({
    threshold: 75, 
    className: 'is-revealed'
  });
})
$(document).ready(function() {
  $(".MainMenu").headroom({
    offset: 80,
    classes: { unpinned : 'is-hidden' }
  });

  $('[data-toggle-modal-menu]').on('click', function(e) {
    e.preventDefault();
    $('.MainMenu-links').toggleClass('is-expanded');
    $('body').toggleClass('is-modal-menu-open');
  })

  $('nav .close').on('click', function(e) {
    e.preventDefault();
    $('nav').removeClass('open');
  });

  $('.TimelineItem--topLink a').on('click', function(e) {
    $("html, body").animate({ scrollTop: "0px" });
  })
});