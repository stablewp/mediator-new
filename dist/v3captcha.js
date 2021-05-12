// jQuery(document).ready(function ($) {
//     jQuery('.bk-submit').on("click", function (e) {
//         e.preventDefault();
//         grecaptcha.ready(function() { //Site key here
//             grecaptcha.execute('6LeLsukUAAAAACbL_TxX6lIg2Aht5oxhCtknpNex', {action: 'form'}).then(function(token) {
//                 document.getElementById('v3cap_token').value = token;
// 				if(token){
// 					jQuery.ajax({
// 						url: v3cap_custom.ajaxurl,
// 						type: 'POST',
// 						dataType: "json",
// 						data:{
// 							action: 'check_authorized_user',
// 							v3cap_token: token
// 						},
// 						success: function (JSON) {
// 							if(JSON.success === true && JSON.score <= 0.5){
// 								jQuery('form#bk-form').submit();
// 							}
// 						}
// 					});
// 				}
                
//             });
//         });
//     });
// });
// 
$(document).ready(function () {
    $('.bk-submit').on("click", function (e) {
        e.preventDefault();
		$(".captcha-error").text("");
        $.ajax({
            url: v2cap_custom.ajaxurl,
            type: 'POST',
            dataType: "json",
            data:{
                action: 'check_authorized_user',
                response: grecaptcha.getResponse()
            },
            success: function (JSON) {
                if(JSON.success === true){
                    $('form#bk-form').submit();
                }else{
					$(".captcha-error").text("Your robot..");
				}
            }
        });
    });
});