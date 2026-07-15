if (is_table_page) {
    if(group_branchcodes && Object.keys(group_branchcodes).length > 0 && $("#illfilter_group").length > 0) {
        // Select the group with the most constituent libraries
        const largest_group = Object.keys(group_branchcodes)
              .toSorted((x, y) => group_branchcodes[y].length - group_branchcodes[x].length)
        [0];
        $("#illfilter_group").val(largest_group);
    } else {
        var library = $(
          "#logged-in-info-full > strong > span.logged-in-branch-name"
        ).text();
        $("#illfilter_branchname option:contains(" + library + ")").attr(
          "selected",
          "selected"
        );
    }
}
