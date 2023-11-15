if (
  window.location.href.indexOf(
    "/cgi-bin/koha/ill/ill-requests.pl?method=create"
  ) > -1
) {
  const searchParams = new URLSearchParams(window.location.search);
  if (searchParams.has("cardnumber")) {
    $("#create_form #cardnumber").val(searchParams.get("cardnumber"));
  }
}
