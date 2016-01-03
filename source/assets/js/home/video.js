//= require video.js/dist/video-js/video
//= require remodal/dist/remodal

$(document).on('opening', '.remodal', function () {
  var vidId = $(this).find('video').attr('id');
  videojs(vidId).play();
}).on('closing', '.remodal', function () {
  var vidId = $(this).find('video').attr('id');
  videojs(vidId).pause();
});