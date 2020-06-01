$(document).ready(function() {
  if(!$('.Me-social').length) return;
  ['twitter', 'github', 'email', 'linkedin'].forEach(function(linkType) {
    var $elem = $('#link-' + linkType + ' svg')
    var $hover = $elem.clone().insertAfter($elem);

    var dur = { email: 150, linkedin: 200 }[linkType] || 100;
    var viv = new Vivus($elem[0], { duration: dur, start: 'autostart', type: 'async' });
    var vivHover = new Vivus($hover[0], { duration: dur / 3, start: 'manual', type: 'async' });

    $elem.parent().on('mouseover', function(){
      vivHover.play();
    }).on('mouseout', function() {
      vivHover.play(-1);
    })

    viv.play();
  })
});