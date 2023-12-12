if (is_create_page) {
  create_form_branchcode_input
    .parent()
    .append(
      '<span id="ill_actions_plugin_toast" style="display:none; color:#408540">Library updated</span>'
    );

  let previous_value = create_form_cardnumber_input.val();
  let initial_check = false;

  setInterval(function () {
    let current_value = create_form_cardnumber_input.val();

    if (!initial_check || current_value !== previous_value) {
      previous_value = current_value;

      if (!current_value) {
        return;
      }

      $.ajax({
        url:
          "/api/v1/contrib/ill_actions/get_branchcode_from_cardnumber/" +
          create_form_cardnumber_input.val(),
        success: function (result) {
          if (create_form_branchcode_input.val() != result) {
            create_form_branchcode_input.val(result);

            $("#ill_actions_plugin_toast").fadeIn("slow", function () {
              $("#ill_actions_plugin_toast").delay(1000).fadeOut("slow");
            });
          }
          initial_check = true;
        },
      });
    }
  }, 250);
}
