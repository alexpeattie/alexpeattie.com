$(document).ready(function(){
  $(".basic").windowed();
  $("select.vertical").windowed({vertical: true});
  $(".custom").windowed({on: "ENABLED", off:"DISABLED", width: 200, height: 50});
  
  $("input:checkbox.callback").windowed({
    change: function(event, active) {
      alert( "The checkbox is now " + (active ? "checked" : "unchecked") );
      console.log( $(this) );
    }
  });
  $("select.callback").windowed({
    change: function(event, selected) {
      alert( 
        "You selected item #" + ($(selected).index() + 1) + 
        " - " + $(selected).text()
      );
    }
  });
  $(':checkbox').filter('.info, .success, .warning, .danger').windowed({
    theme: true
  });
  
  $("#demoDisable").windowed({
    disabled: true
  });
  
  $("select[disabled]").windowed();

  $(".windowed-enable").click(function(e){
    $("#demoDisable").windowed('setEnabled', true);
  });

  $(".windowed-disable").click(function(e){
    $("#demoDisable").windowed('setEnabled', false);
  });

  $(".windowed-toggle").click(function(e){
    $("#demoDisable").windowed('toggleEnabled');
  });
  
  $(".no-animate").windowed({
    animate: false
  });

  $(".slow-animate").windowed({
    animateDuration: 1000
  });
  
  $(".changestate, .changestate-select").windowed();

  $(".windowed-on").click(function(){
    $(".changestate").windowed('setState', true);
  });
  
  $(".windowed-off").click(function(){
    $(".changestate").windowed('setState', false);
  });
  
  $(".windowed-toggle-onoff").click(function(){
    $(".changestate").windowed('toggleState');
  });
  
  $(".windowed-num").click(function(){    
    $(".changestate-select").windowed('selectOption', $(this).text() - 1);
  });

  $('a[class^="windowed-"]').click(function(e) {
    e.preventDefault();
  })
  
  $(".customtheme").windowed({theme: "custom"});
});