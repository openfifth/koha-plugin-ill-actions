(function () {
  const illrequest_id = new URLSearchParams(window.location.search).get("illrequest_id");
  if (is_edit_page && illrequest_id) {
    fetch('/api/v1/ill/requests?q={"me.illrequest_id":' + illrequest_id + "}", {
      headers: {
        "x-koha-embed": "extended_attributes",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        ill_actions_unauthenticated_custom_fields.forEach(function (
          custom_field
        ) {
          data[0].extended_attributes.forEach((attribute) => {
            if (attribute.type === custom_field.code) {
              const lastLiSibling = $("h4 ~ li").last();
              lastLiSibling.after(
                "<li><span class='label' data-borrower_attribute_type='"+custom_field.borrower_attribute_type+"'>" +
                  custom_field.description +
                  ":</span>" +
                  attribute.value +
                  "</li>"
              );
            }
          });
        });

        return data;
      });
  }
})();
