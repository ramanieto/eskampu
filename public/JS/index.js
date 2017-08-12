$(document).ready(function(){
  
  // ========================================================================= //
  //TIMEAGO PLUGIN
  $("time.timeago").timeago();
  
  // ========================================================================= //
  
  $(".a-reply").on("click", function(){
    $(".form-display").toggleClass("form-display");  
  });
  
  // ========================================================================= //
  //RATING PLUGIN
  
  $('.rating').rating();
  
  $('.dropdown-toggle').dropdown();

  $('#profile-edit :checkbox').each(function() { // Load previous values
    $(this).prop('checked', localStorage.getItem(this.id) === 'true');
  });
  $('#profile-edit').submit(function() {
    $('#profile-edit :checkbox').each(function() { // Save current values
      localStorage.setItem(this.id, $(this).prop('checked'));
    });
  });
  
  if ($('#profile-edit :checkbox').prop('checked')) {
    $('email').removeClass("hidden");
  }

  
  // ========================================================================= //
  // LOGIC FOR LANDING PAGE NAVBAR TO CHANGE COLOR
  
  
  if (document.URL.toString() === "http://webdevbootcamp2-ramanieto.c9users.io" || document.URL.toString() === "http://webdevbootcamp2-ramanieto.c9users.io/" || document.URL.toString() === "https://powerful-badlands-51050.herokuapp.com" || document.URL.toString() === "https://powerful-badlands-51050.herokuapp.com/" || document.URL.toString() === "https://www.eskampu.com/" || document.URL.toString() === "https://eskampu.com/") {
    var scroll_start = 0;
    var startchange = $("header");
    var offset = startchange.offset();
    if (startchange.length){
      $(document).scroll(function() { 
        scroll_start = $(this).scrollTop();
        if(scroll_start > offset.top) {
          $("header").css('background-color', '#607D8B');
        } else {
          $("header").css('background-color', 'transparent');
        }
      });
    }  
  } else {
    
  }
  
  // ========================================================================= //
  // WEATHER API
  
  // Method to ignore declaration error 
  try{
  //code that causes an error
    // Weather API key
    var key = "ebbd171b62b78a12fc778a2d5f6a0f85";
    // Setting weatherApi to the api url
    var weatherApi = "http://api.openweathermap.org/data/2.5/weather?lat=" + campground.latitude + "&lon=" + campground.longitude + "&units=imperial&APPID=" + key;
    // jQuery method to make a XMLHttpRequest
    $.ajax({
      url: weatherApi, 
      dataType: "jsonp",
      success: function(weatherData){
        var prefix = "wi wi-owm-";
        var code = weatherData.weather[0].id;
        var today = new Date();
        var hour = today.getHours();
        var dorn = "";
        if (hour > 6 && hour < 20) {
          //Day time
          dorn = "day-";
        } else {
          //Night time
          dorn = "night-";
        }
        if (code === 701) {
          code = 721;
        }
        var icon = prefix + dorn + code;
        
        $(".icon-div").attr("class", "icon-div " + icon);
      }
    });
  }catch(e){
    function ToHandleError(e){
    };
  }
  
  try {
    var weatherApi = "http://api.wunderground.com/api/10221e7cdbefb92a/forecast/conditions/q/" + campground.latitude + "," + campground.longitude + ".json";
    $.ajax({
      url : weatherApi,
      dataType : "jsonp",
      success : function(weatherData) {
        var temp = Math.round(weatherData.current_observation.temp_f);
        var maxTemp = Math.round(weatherData.forecast.simpleforecast.forecastday[0].high.fahrenheit);
        var minTemp = Math.round(weatherData.forecast.simpleforecast.forecastday[0].low.fahrenheit);
        var wind = weatherData.forecast.simpleforecast.forecastday[0].avewind.mph;
        var humidity = weatherData.forecast.simpleforecast.forecastday[0].avehumidity;
        // var icon = weatherData.current_observation.icon_url;
        var weather_url = weatherData.current_observation.forecast_url;
        
        $(".city-name").on("click", function(){
          window.open(weather_url, '_blank');
        });
        

        $(".temp").html("<div class='main_temp'>" + temp + "<span class='degree-symbol'>°</span>F</div>" +  "<div class='temp_max'>" + maxTemp + "<span class='degree-symbol'>°</span>F <span class='glyphicon glyphicon-arrow-up'></span></div>" + "<div class='temp_min'>" + minTemp + "<span class='degree-symbol'>°</span>F <span class='glyphicon glyphicon-arrow-down'></span></div>");
        $(".wind-small").html("<p>" + wind + "mph</p>");
        $(".humidity-small").html("<p>" + humidity + "%</p>");
        
        //code that causes an error
        // Weather API key
        var key = "ebbd171b62b78a12fc778a2d5f6a0f85";
        // Setting weatherApi to the api url
        var weatherApi2 = "http://api.openweathermap.org/data/2.5/weather?lat=" + campground.latitude + "&lon=" + campground.longitude + "&units=imperial&APPID=" + key;
        // jQuery method to make a XMLHttpRequest
        $.ajax({
          url: weatherApi2, 
          dataType: "jsonp",
          success: function(weatherData2){
            var prefix = "wi wi-owm-";
            var code = weatherData2.weather[0].id;
            var time = weatherData.current_observation.local_time_rfc822.split(" ")[4];
            var hour = time.split(":")[0];
            var dorn = "";
            if (hour > 6 && hour < 20) {
              //Day time
              dorn = "day-";
            } else {
              //Night time
              dorn = "night-";
            }
            if (code === 701) {
              code = 721;
            }
            var icon = prefix + dorn + code;
            
            $(".icon-div").attr("class", "icon-div " + icon);
          }
        });
        
      }
    });
  } catch(e){
    // Method to ignore declaration error
    function ToHandleError(e){
    };
  }
  
  // ========================================================================= //
  // SMOOTH SCROLL PLUGIN
  
  $(function(){	
  
    var $window = $(window);
    var scrollTime = 1.2;
    var scrollDistance = 170;
    
    $window.on("mousewheel DOMMouseScroll", function(event){
    
      event.preventDefault();	
      
      var delta = event.originalEvent.wheelDelta/120 || -event.originalEvent.detail/3;
      var scrollTop = $window.scrollTop();
      var finalScroll = scrollTop - parseInt(delta*scrollDistance);
      
      TweenMax.to($window, scrollTime, {
        scrollTo : { y: finalScroll, autoKill:true },
        ease: Power1.easeOut,
        overwrite: 5							
      });
      
    });
  });
  
  // ========================================================================= //
  //MODAL
  var modal = document.getElementById('id01');
      
  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function(event) {
      if (event.target == modal) {
          modal.style.display = "none";
      }
  }
  
  // ========================================================================= //
  
    window.mobilecheck = function() {
      var check = false;
      (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
      if(check) {
        return alert("Mobile version coming soon!!!");
      }
    };
    
    function myFunction() {
      var x = document.getElementById("myTopnav");
      if (x.className === "topnav") {
          x.className += " responsive";
      } else {
          x.className = "topnav";
      }
    }
        
      
      // ============= Modal Logic ============ //
      
      jQuery(document).ready(function($){
        var formModal = $('.cd-user-modal'),
        formLogin = formModal.find('#cd-login'),
        formSignup = formModal.find('#cd-signup'),
        formForgotPassword = formModal.find('#cd-reset-password'),
        formModalTab = $('.cd-switcher'),
        tabLogin = formModalTab.children('li').eq(0).children('a'),
        tabSignup = formModalTab.children('li').eq(1).children('a'),
        forgotPasswordLink = formLogin.find('.cd-form-bottom-message a'),
        backToLoginLink = formForgotPassword.find('.cd-form-bottom-message a'),
        mainNav = $('.nav-modal');

        //open modal
        mainNav.on('click', function(event){
          $(event.target).is(mainNav) && mainNav.children('ul').toggleClass('is-visible');
        });
        
        //open sign-up form
        mainNav.on('click', '.cd-signup', signup_selected); mainNav.on('click', '.a-nav-modal', login_selected);
        //open login-form form
        mainNav.on('click', '.cd-signin', login_selected);

        //close modal
        formModal.on('click', function(event){
          if( $(event.target).is(formModal) || $(event.target).is('.cd-close-form') ) {
            formModal.removeClass('is-visible');
          }	
        });
        //close modal when clicking the esc keyboard button
        $(document).keyup(function(event){
          if(event.which=='27'){
            formModal.removeClass('is-visible');
          }
        });

        //switch from a tab to another
        formModalTab.on('click', function(event) {
          event.preventDefault();
          ( $(event.target).is( tabLogin ) ) ? login_selected() : signup_selected();
        });

        //hide or show password
        $('.hide-password').on('click', function(){
          var togglePass= $(this),
          passwordField = togglePass.prev('input');

          ( 'password' == passwordField.attr('type') ) ? passwordField.attr('type', 'text') : passwordField.attr('type', 'password');
          ( 'Hide' == togglePass.text() ) ? togglePass.text('Show') : togglePass.text('Hide');
          //focus and move cursor to the end of input field
          // passwordField.putCursorAtEnd();
        });

        //show forgot-password form 
        forgotPasswordLink.on('click', function(event){
          event.preventDefault();
          forgot_password_selected();
        });

        //back to login from the forgot-password form
        backToLoginLink.on('click', function(event){
          event.preventDefault();
          login_selected();
        });

        function login_selected(){
          mainNav.children('ul').removeClass('is-visible');
          formModal.addClass('is-visible');
          formLogin.addClass('is-selected');
          formSignup.removeClass('is-selected');
          formForgotPassword.removeClass('is-selected');
          tabLogin.addClass('selected');
          tabSignup.removeClass('selected');
        }

        function signup_selected(){
          mainNav.children('ul').removeClass('is-visible');
          formModal.addClass('is-visible');
          formLogin.removeClass('is-selected');
          formSignup.addClass('is-selected');
          formForgotPassword.removeClass('is-selected');
          tabLogin.removeClass('selected');
          tabSignup.addClass('selected');
        }

        function forgot_password_selected(){
          formLogin.removeClass('is-selected');
          formSignup.removeClass('is-selected');
          formForgotPassword.addClass('is-selected');
        }
        
        var formCheckbox = $('#accept-terms');
        
        $('input[type="submit"]').on('click', function(event){
          if(!formCheckbox.is(':checked')) {
            event.stopImmediatePropagation();
            event.preventDefault();
            alert('You need to accept the Terms');
            $('input[type="submit"]').attr('disabled');
          } else {
            $('input[type="submit"]').removeAttr('disabled');
          }
        })
        

        //IE9 placeholder fallback
        //credits http://www.hagenburger.net/BLOG/HTML5-Input-Placeholder-Fix-With-jQuery.html
        if(!Modernizr.input.placeholder){
          $('[placeholder]').focus(function() {
            var input = $(this);
            if (input.val() == input.attr('placeholder')) {
              input.val('');
            }
          }).blur(function() {
            var input = $(this);
            if (input.val() == '' || input.val() == input.attr('placeholder')) {
              input.val(input.attr('placeholder'));
            }
          }).blur();
          $('[placeholder]').parents('form').submit(function() {
            $(this).find('[placeholder]').each(function() {
              var input = $(this);
              if (input.val() == input.attr('placeholder')) {
                input.val('');
              }
            })
          });;
        }
      });
});