window.onload = function(){
    let signform = $('#signup');
    let username = document.getElementById('username');
    let password = document.getElementById('password');
    let repassword = document.getElementById('repassword');
    let uPattern = /^[a-zA-Z0-9_-]{6,16}$/;

    var checkusername = function (num1) {
        
        return username.length==0?false:true;
    };

    var checkpassword = function (num1) {
        if (typeof num1 == '') {
            throw 'password should not be empty';
        }
        //num1 = num1.replace(/\W/g, "").toLocaleLowerCase();
        return uPattern.test(num1);
    };

    var checkrepassword = function (num1,num2) {
        if (typeof num2 == '') {
            throw 'input your password once more';
        }
        //num1 = num1.replace(/\W/g, "").toLocaleLowerCase();
        return num1==num2 ? true : false ;
    };

    $(".modal").each( function(){
        $(this).wrap('<div class="overlay"></div>')
    });

    $(".close-modal").on('click', function(e){
        e.preventDefault();
        e.stopImmediatePropagation;
        
        var $this = $(this),
                modal = $($this).data("modal");
        
        $(modal).removeClass("open");
        setTimeout( function(){	
            $(modal).parents(".overlay").removeClass("open");
        }, 350);
        
    });	

    setTimeout(
        signform.submit(function (event) {  
        debugger;
        event.preventDefault();
        //console.log('1');
         username = username.value;
         password = password.value;
         repassword = repassword.value;

        if(!checkusername(username)){
            var element = $('<div class="alert alert-danger" role="alert">username should not be empty</div>');
            $('#danger').append(element);
            $('div[role="alert"]').fadeOut(1500);
            return false;
        }
        if(!checkpassword(password)){
            var element = $('<div class="alert alert-danger" role="alert">password length should more than 6</div>');
            $('#danger').append(element);
            $('div[role="alert"]').fadeOut(1500);
            return false;
            // $(".modal").parents(".overlay").addClass("open");
            // setTimeout( function(){
            //      $("#modal1").addClass("open");
            // }, 350);
        }

        var requestConfig = {
            method: "POST",
            url: "/register",
            contentType: "application/json",
            data: JSON.stringify({
                username: username,
                password: password,
                repassword: repassword
            })
        };
        $.ajax(requestConfig).then(function (responseMessage) {
            debugger;
            console.log(responseMessage);
        });
    }),2000)
}