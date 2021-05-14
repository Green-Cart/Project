$(document).ready(function () {
    let noErrors = true;
    function validString(str) {
        if (!str || !isNaN(str)) {
            noErrors = false;
            return false;
        }
        return true;
    }

    // form.removeClass('was-validated');
    let form = $('#project-form');
    let emailInput = $('user-email-input');
    let passwordInput = $('user-passwork-input');  
    let btn = $('#submitInfo');
    let errors = $('.error');

    form.submit((event) => {
        noErrors = true;
        event.preventDefault();
        btn.prop('disabled', true);

        errors.hide();

        emailInput.removeClass('is-invalid is-valid');
        passwordInput.removeClass('is-invalid is-valid');

        let info = {
            email: emailInput.val().trim(),
            password: passwordInput.val().trim(),
        };

        if (!validString(info.email)) emailInput.addClass('is-invalid');
        if (!validString(info.password)) passwordInput.addClass('is-invalid');

        if (noErrors) {
            form.unbind().submit();
        } else {
            btn.prop('disabled', false);
        }
    });
    
})(jQuery);