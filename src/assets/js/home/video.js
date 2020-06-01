//= require remodal/dist/remodal

$(document).ready(function() {
  $(document).on('closed', '.remodal', function (e) {
    $('[data-remodal-id]').remove();
  })

  $('[video-modal]').on('click', function() {
    $('[data-remodal-id]').remove();

    var modalHtml = $('#video-modal-template').html()
    var modal = $(modalHtml)
      .find('iframe').attr('src', 'https://www.youtube.com/embed/' + $(this).attr('video-modal') + '?autoplay=1').end()
      .appendTo('body')
    modal.remodal().open();
  })
})
