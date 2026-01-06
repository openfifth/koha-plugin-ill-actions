if (is_table_page) {
  var library = $(
    "#logged-in-info-full > strong > span.logged-in-branch-name"
  ).text();
  $("#illfilter_branchname option:contains(" + library + ")").attr(
    "selected",
    "selected"
  );
}
