if (is_illview_page) {
  const searchParams = new URLSearchParams(window.location.search);
  if (searchParams.has("illrequest_id")) {
    const el =
      '<a title="New request for this user" class="btn btn-default" href="/api/v1/contrib/ill_actions/new_request_for_patron/' +
      searchParams.get("illrequest_id") +
      '"> <span class="fa fa-plus"></span>New request for this user</a>';

    $("#request-toolbar").prepend(el);
  }
}
