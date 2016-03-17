//= require video.js/dist/video-js/video
//= require remodal/dist/remodal

$(document).ready(function() {
  var videoModal;
  var remodalInstance;

  $(document).on('closing', '.remodal', function (e) {
    videojs($('[data-remodal-id] video')[0]).pause();
  })

  $('[video-modal]').on('click', function() {
    $('[data-remodal-id]').remove();

    var modalHtml = $('#video-modal-template').html()
    var vidName = $(this).attr('video-modal');

    var modal = $(modalHtml)
      .find('video').attr('id', 'video-' + vidName).end()
      .find('source').attr('src', '/assets/videos/' + vidName + '.mp4').end()
      .appendTo('body')

    var video = videojs(modal.find('video')[0], {});
    var remodal = modal.remodal()
    remodal.open();

    video.play();
  })
})