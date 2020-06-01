/* jquery.windowed.js 
 * ------------------
 * Version: 0.0.1
 * Author: Alex Peattie (@alexpeattie)
 * Homepage: http://www.alexpeattie.com/projects/windowed
 * Repo: https://github.com/alexpeattie/windowed
 * License: MIT
*/

/* Passes JSLint + JSHint with minor tweaking: JSLint is a little over-sensitive with unused variables, so we have to switch that off */
/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, undef:true, unused:true, curly:true, browser:true, jquery:true, indent:4, maxerr:50 */
/*jslint browser: true, nomen: true, unparam: true, white: true */
/*global jQuery*/

(function($){
  "use strict";

  // Little utility function for calculating border width
  $.fn.borderWidth = function() {
    return parseInt($(this).css('borderLeftWidth'), 10);
  };

  $.fn.windowed = function( method ) {

    var options = {},
        methods = {

      // Private methods

      // Initialize the component
      _init : function(opt) {

        return this.each(function() {
          options = $.extend(true, {}, $.fn.windowed.defaults, opt);

          var type = $(this).prop('type'), html = {}, $ul,

              // Inherit classes from the DOM element if theme == true
              theme = options.theme === true ? $(this).attr('class') : options.theme,

              // Create container <div>
              $div = $(this).wrap( $('<div />', { 'class': 'windowed', height: options.height }) ).parent()
                     .addClass(type).addClass(theme),

              // <select> only
              $selectOpts = $(this).find('option'),

              // We need the border width/radius for calculating width later on
              bRad = parseInt($div.css('borderTopLeftRadius'), 10),

              /* A slightly ugly hack to get the border width; Chrome won't return CSS properties
                 not in the DOM - so we have to temporarily create the element, fetch the property
                 then destroy it. */
              $tmp = $('<div class="slider" />').hide().appendTo($div),
              bWidth = $tmp.borderWidth();
              $tmp.remove();

          // Ensure all neccessary options are present
          options = $.extend({ width: $div.width(), height: $div.height(), disabled: $(this).attr('disabled') }, options);
          if(options.animate === false) { options.animateDuration = 0; }

          // Generate a random id for the DOM element if it doesn't have one
          if($(this).attr('id') === undefined) { $(this).attr('id', 'wp_' + Math.floor(Math.random() * 10e15)); }

          // For convenience, width == half of the whole component's width
          options.width /= 2;

          // Prepare the HTML for the component
          html = {
            slider: {
               css: {
                 borderWidth: bWidth
               },
               width: options.width - (bWidth * 2),
               height: options.height - (bWidth * 2)
            },
            checkstate: {
              width: options.width,
              height: options.height,
              css: {
                lineHeight: options.height + 'px'
              },
              on: {
                css: { borderRadius: bRad+'px 0px 0px '+bRad+'px' },
                text: options.on
              },
              off: {
                css: { borderRadius: '0px '+bRad+'px '+bRad+'px 0px' },
                text: options.off
              }
            },
            li: {
              height: options.height,
              css: {
                lineHeight: options.height + 'px'
              }
            }
          };
          $.extend(true, options, html);
          $.each(['on', 'off'], function(){
            $.extend(true, options.checkstate[this], options.checkstate);
          });

          // Construct checkbox-based component
          if(type === 'checkbox') {

            $div.width(options.width * 2);
            $('<label />', {'for': $(this).attr('id')}).appendTo($div)
            
            /* We have to attach an empty click handler to the <label> to fix a mobile Safari bug:
               see: http://v4.thewatchmakerproject.com/blog/how-to-fix-the-broken-ipad-form-label-click-issue/ */
            .on("click", function(){});

            $.each([options.checkstate.on, options.checkstate.off, options.slider], function(i, attrs){
              $div.append($('<div />', attrs));
            });

            methods._checkboxChange.apply($(this), [{data: {duration: 0}}]);

          }

          // Construct <select>-based component
          else if (type === 'select-one') {

            $ul = $('<ul />').appendTo($div);
            if(options.vertical) { $div.addClass('vertical'); }

            $.each($selectOpts, function(i, o) {
              $ul.append($('<li />', $.extend({text: o.text, 'class': $(o).is(':selected') ? 'selected' : undefined}, options.li)));
            });

            $div.append( $('<div />', options.slider) );
            methods._selectChange.apply($div.find('li.selected'), [{data: {duration: 0}}]);

          }

          // Add change callback
          $(this).on('windowed.change', options.change);

          // Set the initial component state (enabled/disabled)
          methods[options.disabled ? '_disable' : '_enable'].apply($(this));

        });

      },

      // Change event for checkboxes
      '_checkboxChange': function(e){
        var checked = $(this).prop('checked'),
            $slider = $(this).siblings('.slider'),

            // Toggle .selected class
            $cstate = $(this).siblings('.checkstate').removeClass('selected')
                      .filter(checked ? '.on' : '.off').addClass('selected'),

            css = {'left': checked ? 0 : $cstate.width()};

        // Animate to new state
        $slider.animate(css, e.data.duration, $.proxy(function() {

          // Fire change callback
          $(this).trigger('windowed.change', checked, e);
        }, this));
      },

      // Change event for <select>s
      '_selectChange': function(e){
        // Toggle .selected class
        $(this).addClass('selected')
               .siblings('li').removeClass('selected');

        var $div = $(this).closest('div'),
            $slider = $div.find('.slider'),
            $select = $div.find('select'),
            vertical = $div.hasClass('vertical'),
            bWidth = $slider.borderWidth(),

            css = {
              width: $(this).outerWidth() - (vertical ? bWidth : bWidth*2),
              left: vertical ? 0 : $(this).position().left,

              // The -1 is a bit of hack, needs fixing
              top: $(this).position().top-1
            };

        // Animate to new state
        $slider.animate(css, e.data.duration, $.proxy(function() {

          // Sync the state of the <select>
          $select[0].selectedIndex = $(this).index();
          
          // Fire change callback
          $select.trigger('windowed.change', $select.find('option:selected')[0], e)
          
          // ...and original onchange event
          .trigger('change');
        }, this));
      },

      // Enable component. Note: this method is private - use .window('setEnabled', true) instead
      _enable: function(){
        var type = $(this).prop('type'),
            opts = {duration: options.animateDuration};

        $(this).prop('disabled', false)
               .parent().removeClass('disabled');

        if(type === 'checkbox') { $(this).on('change', opts, methods._checkboxChange); }
        else if (type === 'select-one') {
          $(this).parent().find('li').on('click', opts, methods._selectChange);
        }
      },

      // Disable component. Note: this method is private - use .window('setEnabled', false) instead
      _disable: function(){
        $(this).attr('disabled', true)
               .off('change')
               .parent().addClass('disabled')
               .find('li').off('click');
      },

      // Public methods

      /* Enables/disables the component. enabled is a boolean, where true enables the component,
         and false disables it. The method returns this boolean value. */
      setEnabled: function(isEnabled){
        methods[isEnabled ? '_enable' : '_disable'].apply($(this));
        return isEnabled;
      },

      /* Toggles the component's enabled/disabled state. Returns a boolean value indicating
         the component's new state, where true == enabled. */
      toggleEnabled: function() {
        return methods.setEnabled.apply($(this), [$(this).prop('disabled')]);
      },

      /* Checks/unchecks a checkbox component. state is a boolean, where true checks the component,
         and false unchecks it. The method returns this boolean value. */
      setState: function(state){
        $(this).prop('checked', state).trigger('change');
        return state;
      },

      /* Toggles a checkbox component's checked/unchecked state. Returns a boolean value indicating
         the component's new state, where true == checked. */
      toggleState: function(){
        return methods.setState.apply($(this), [!$(this).prop('checked')]);
      },

      /* Selects an option on a <select>-based component. optionIndex is an integer, representing the
         0-based index of the option to be selected. The selected .option is returned. */
      selectOption: function(n) {
        return $(this).parent().find('li').eq(n).trigger('click')[0];
      }
    };

    // Method calling logic
    if ( method && methods[method] && method.charAt(0) !== "_" ) {
      return methods[ method ].apply( this, [].slice.call(arguments, 1) );
    } if (typeof method === 'object' || ! method ) {
      return methods._init.apply( this, [].slice.call(arguments, 0) ); // always pass an array
    }
    $.error('Method ' +  method + ' does not exist on jQuery.windowed');
    return this;
  };

  // Default options
  $.fn.windowed.defaults = {
    animate: true,
    animateDuration: 400,
    change: function() {},
    css: {},
    checkstate: {
      on: { 'class': 'checkstate on', text: 'ON' },
      off: { 'class': 'checkstate off', text: 'OFF' }
    },
    slider: { 'class': 'slider' }
  };

}(jQuery));