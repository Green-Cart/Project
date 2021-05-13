$(document).ready(function () {
  let loginForm = $("#login-form");
  let emailInput = $("#email");
  let passwordInput = $("#password");
  let submitInfo = $("#submitInfo");
  let errors = $(".error");

  loginForm.submit((event) => {
    event.preventDefault();
    emailInput.removeClass("is-invalid is-valid");
    passwordInput.removeClass("is-invalid is-valid");
    submitInfo.prop("disabled", true);
    errors.hide();

    let info = {
      email: emailInput.val().trim(),
      password: passwordInput.val().trim(),
    };

    let hasErrors = false;
    if (!info.email || !info.password) {
      usernameInput.addClass("is-invalid");
      passwordInput.addClass("is-invalid");
      hasErrors = true;
    }

    if (!hasErrors) {
      loginForm.unbind().submit();
    } else {
      submitInfo.prop("disabled", false);
    }
  });
})(jQuery);
