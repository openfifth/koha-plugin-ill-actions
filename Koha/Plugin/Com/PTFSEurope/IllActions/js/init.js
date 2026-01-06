const create_form_cardnumber_input = $("#create_form #cardnumber");
const create_form_branchcode_input = $("#create_form #branchcode");
const edit_form_cardnumber_input = $("#ill_edit_action_form #borrowernumber");

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

const is_edit_page =
  window.location.href.indexOf("/cgi-bin/koha/ill/ill-requests.pl") > -1 &&
  window.location.href.indexOf("op=edit_action") > -1;

const is_table_page = $('table#ill-requests').length > 0;