const create_form_cardnumber_input = $("#create_form #cardnumber");
const create_form_branchcode_input = $("#create_form #branchcode");

const is_create_page =
  window.location.href.indexOf(
    "/cgi-bin/koha/ill/ill-requests.pl?method=create"
  ) > -1 ||
  window.location.href.indexOf("/cgi-bin/koha/ill/ill-requests.pl?op=create") >
    -1 ||
  document.getElementById("create_form") !== null;

const is_illview_page =
  window.location.href.indexOf("/cgi-bin/koha/ill/ill-requests.pl?op=illview") >
    -1 ||
  window.location.href.indexOf("/cgi-bin/koha/ill/ill-requests.pl?op=illview") >
    -1;
