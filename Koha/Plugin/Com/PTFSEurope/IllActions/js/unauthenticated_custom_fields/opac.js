(function () {

    addCustomUnauthILLFields();
    var fieldset = $('legend:contains("Custom fields")').parent("fieldset");
    fieldset.remove();

  function addCustomUnauthILLFields() {
    if (!ill_actions_unauthenticated_custom_fields) return;

    let html_field;
    for (const field of ill_actions_unauthenticated_custom_fields) {
      if (field.avcat) {
        if (field.avs.length) {
          html_field = addAVField(field);
        }
      } else {
        html_field = addTextField(field);
      }
      if (html_field && field.hasOwnProperty("required")) {
        const li_required_label = $("<div>");
        li_required_label.text("Required");
        li_required_label.addClass("required_label required");
        html_field.append(li_required_label);
      }
    }
  }

  function addTextField(field) {
    const first_fieldset = $("#create_form > fieldset ol").first();
    const custom_field_li = $("<li>");
    const custom_field_li_label = $("<label>");
    custom_field_li_label.attr("for", field.code).text(field.description + ": ");
    custom_field_li.append(custom_field_li_label);
    const custom_field_li_hidden_text_input = $("<input>");
    custom_field_li_hidden_text_input.attr("type", "hidden");
    custom_field_li_hidden_text_input.attr("name", "custom_key");
    custom_field_li_hidden_text_input.val(field.code);
    custom_field_li.append($(custom_field_li_hidden_text_input));

    const existing_text_input = $('input[value="' + field.code + '"');
    const custom_field_li_text_input = $("<input>");
    custom_field_li_text_input.attr("type", "text");
    custom_field_li_text_input.attr("name", "custom_value");
    if (field.hasOwnProperty("required")) {
      custom_field_li_text_input.attr("required", true);
    }
    custom_field_li.append($(custom_field_li_text_input));

    if (existing_text_input) {
      custom_field_li_text_input.val(existing_text_input.next().val());
    }

    first_fieldset.append(custom_field_li);
    return custom_field_li;
  }

  function addAVField(field) {
    const first_fieldset = $("#create_form > fieldset ol").first();
    const custom_field_li = $("<li>");
    const custom_field_li_label = $("<label>");
    custom_field_li_label.attr("for", field.code).text(field.description + ": ");
    custom_field_li.append(custom_field_li_label);
    const custom_field_li_select_hidden_input = $("<input>");
    custom_field_li_select_hidden_input.attr("type", "hidden");
    custom_field_li_select_hidden_input.attr("name", "custom_key");
    custom_field_li_select_hidden_input.val(field.code);
    custom_field_li.append($(custom_field_li_select_hidden_input));
    const custom_field_li_select = $("<select>");
    if (field.hasOwnProperty("required")) {
      custom_field_li_select.attr("required", true);
    }
    custom_field_li_select.attr("name", "custom_value");

    const existing_avfield = $('input[value="' + field.code + '"');

    $.each(field.avs, function (index, av) {
      const option = $("<option>");
      option.attr("name", "custom_value");
      option.text(av.lib_opac ?? av.lib).val(av.authorised_value);
      if (existing_avfield) {
        if (av.authorised_value === existing_avfield.next().val()) {
          option.attr("selected", true);
        }
      }
      custom_field_li_select.append(option);
    });

    custom_field_li.append($(custom_field_li_select));
    first_fieldset.append(custom_field_li);
    return custom_field_li;
  }
})();
