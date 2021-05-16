(function ($) {
  let hasErrors = false;
  function validString(str) {
    if (!str) {
      hasErrors = true;
      return false;
    }
    return true;
  }

  let form = $("#admin-signup-form");
  let firstName = $("#adminFirstName");
  let lastName = $("#adminLastName");
  let emailId = $("#adminId");
  let password = $("#adminSignUpPassword");
  let code = $("#secretPasscode");
  let adminSubmit = $("#admin-submit");

  form.submit((event) => {
    event.preventDefault();
    hasErrors = false;
    $(".error").hide();
    firstName.removeClass("is-invalid is-valid");
    lastName.removeClass("is-invalid is-valid");
    emailId.removeClass("is-invalid is-valid");
    password.removeClass("is-invalid is-valid");
    code.removeClass("is-invalid is-valid");
    adminSubmit.prop("disabled", true);

    let info = {
      firstName: firstName.val().trim(),
      lastName: lastName.val().trim(),
      emailId: emailId.val().trim(),
      password: password.val().trim(),
      code: code.val().trim(),
    };

    if (!validString(info.firstName)) firstName.addClass("is-invalid");
    if (!validString(info.lastName)) lastName.addClass("is-invalid");
    if (!validString(info.emailId)) emailId.addClass("is-invalid");
    if (!validString(info.password)) password.addClass("is-invalid");
    if (!validString(info.code)) code.addClass("is-invalid");

    if (!hasErrors) {
      form.unbind().submit();
    } else {
      adminSubmit.prop("disabled", false);
    }
  });
})(window.jQuery);
