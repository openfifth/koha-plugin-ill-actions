$(() => {
  // if there are ILL requests with status = NEW
  if ($(".biglinks-list .icon_ill").length) {
    let branchcode = $(".logged-in-branch-code").first().text();

    // If we have a group mapping, this overrides the current branchcode
    if(group_branchcodes && Object.keys(group_branchcodes).length > 0) {
        // Select the group with the most constituent libraries
      const largest_group = Object.keys(group_branchcodes)
            .toSorted((x, y) => group_branchcodes[y].length - group_branchcodes[x].length)
        [0];
      branchcode = {
        "=": group_branchcodes[largest_group]
      };
    }

    fetch(
      '/api/v1/ill/requests?_per_page=-1&q={"status":{"-in":["NEW","UNAUTH"]},"status_alias":null,"branchcode":' +
            JSON.stringify(branchcode) +
        '}'
    )
      .then((response) => response.json())
      .then((requests) => {
        if (requests.length) {
          // add a link beside suggestions/article requests pending
          const areaPending = $("#area-pending");
          const newILLHTML = `<div class="pending-info" id="illrequests_pending">New ILL requests: <a href="/cgi-bin/koha/ill/ill-requests.pl"> <span class="pending-number-link">${requests.length}</span></a></div>`;
          if (areaPending.length) {
            areaPending.append(newILLHTML);
          } else {
            $(".row .col-sm-12")
              .eq(0)
              .append(
                `<div id="area-pending" class="page-section">${newILLHTML}</div>`
              );
          }
        }
      })
      .catch((e) => {
        console.error("Error fetching ILL requests from Koha REST API", e);
      });
  }
});
