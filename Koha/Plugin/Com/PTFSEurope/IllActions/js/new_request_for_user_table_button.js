if (is_create_page) {
  const searchParams = new URLSearchParams(window.location.search);
  if (searchParams.has("cardnumber")) {
    create_form_cardnumber_input.val(searchParams.get("cardnumber"));
  }
}
