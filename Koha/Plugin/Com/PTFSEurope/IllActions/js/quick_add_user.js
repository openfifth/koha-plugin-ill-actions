if (is_create_page || is_edit_page) {

  let input = is_create_page ? create_form_cardnumber_input : edit_form_cardnumber_input;

  input
    .parent()
    .append('<a id="quick_add_user_button"  href="#">+ Add new user</a>');

  _appendModalHTML();

  $("#quick_add_user_button").on("click", function () {
    if (!$("#libraries_quick_add").children("option").length) {
      _GETLibraries();
    }
    if (!$("#categorycode_entry_quick_add").children("optgroup").length && quick_add_user_patron_categories) {
      _PopulatePatronCategories();
    }
    if (ill_actions_plugin_config.quick_add_user_default_cardnumber && !$("#cardnumber_quick_add").val()) {
      _GETMaxPatronID();
    }
    const mapped_custom_fields = $('[data-borrower_attribute_type]');
    const list_items = $('li[data-pa_code]');

    list_items.each(function () {
      const paCode = $(this).data("pa_code");

      const labelFor = $(this).find("label").first().attr("for");
      const attrNumber = labelFor.match(/\d+$/)?.[0];
      if (!attrNumber) return;

      mapped_custom_fields.each(function () {
        const attrType = $(this).data("borrower_attribute_type");
        if (paCode === attrType) {
          const value = $(this).parent().contents().last().text().trim();
          $(`#patron_attr_${attrNumber}`).val(value);
        }
      });
    });

    $("#addQuickAddUserModal").modal("show");
    $(".dialog.alert").remove();
  });

  $("#addQuickAddUserModal").on("click", "#addConfirm", function (e) {
    e.preventDefault();
    if (!$("#quick_add_user_form").get(0).checkValidity()) {
      $("#quick_add_user_form").get(0).reportValidity();
    } else {
      $("#user-submit-spinner").show();
      let patronAttributes = $("[id^='patron_attr_']").get().reduce((acc, current, index) => {
        if (index % 2 === 0) {
          acc.push({
            value: $(current).val(),
            type: $(current).next().val()
          });
        }
        return acc;
      }, []);

      _POSTPatron({
        surname: $("#surname_quick_add").val(),
        firstname: $("#firstname_quick_add").val(),
        cardnumber: $("#cardnumber_quick_add").val(),
        email: $("#email_quick_add").val(),
        library_id: $("#libraries_quick_add").val(),
        category_id: $("#categorycode_entry_quick_add").val(),
        extended_attributes: patronAttributes
      });
    }
  });

  /**
   * Populates patron categories from the quick_add_user_patron_categories variable
   *
   */
  function _PopulatePatronCategories() {
    let groupedCategories = Object.groupBy(
      quick_add_user_patron_categories,
      ({ category_type }) => category_type
    );

    // Add <optgroup>
    $.each(groupedCategories, function (category_code, categories) {
      $("#categorycode_entry_quick_add").append(
        $(
          '<optgroup id="' +
            category_code +
            '"label="' +
            _getCategoryTypeName(category_code) +
            '"></optgroup>'
        )
      );

      // Add <option>
      $.each(categories, function (i, category) {
        $("#categorycode_entry_quick_add #" + category_code).append(
          $("<option></option>")
            .val(category.patron_category_id)
            .html(category.name)
        );
      });
    });

    // Set default
    if (ill_actions_plugin_config.quick_add_user_default_patron_category) {
      $('#categorycode_entry_quick_add').val(ill_actions_plugin_config.quick_add_user_default_patron_category);
    }
  }

  /**
   * Sends a GET request to the /api/v1/libraries endpoint to fetch libraries
   *
   * Upon success, adds the libraries to the library dropdown
   */
  function _GETLibraries() {
    $.ajax({
      url: "/api/v1/libraries?_per_page=-1",
      type: "GET",
      success: function (data) {
        $.each(data, function (val, text) {
          $("#libraries_quick_add").append(
            $("<option></option>").val(text.library_id).html(text.name)
          );
        });
      },
      error: function (data) {
        console.log(data);
      },
    });
  }

  /**
   * Sends a POST request to the /api/v1/patrons endpoint to add a new patron
   * 
   * Upon completion, show a dialog with appropriate message
   * Upon success, add new patron's cardnumber to the cardnumber input
   *
   * @param {Object}   params           Patron's data to be posted.
   */
  function _POSTPatron(params) {
    $.ajax({
      url: "/api/v1/patrons",
      type: "POST",
      headers: { "Content-Type": "application/json;charset=utf-8" },
      data: JSON.stringify(params),
      success: function (data) {
        $("#user-submit-spinner").hide();
        $("#addQuickAddUserModal").modal("hide");
        $("#surname_quick_add").val("");
        $("#firstname_quick_add").val("");
        $("#cardnumber_quick_add").val("");
        $("#toolbar").before(
          '<div class="alert alert-info">' +
            __(
              'Patron successfully created: </br> <strong><a target="_blank" href="/cgi-bin/koha/members/moremember.pl?borrowernumber=' +
                data.patron_id +
                '">' +
                data.firstname + ' ' + data.surname +
                "(" +
                data.cardnumber +
                ")"
            ) +
            "</div>"
        );
        if( is_create_page ){
          input.val(data.cardnumber);
        } else{
          input.val(data.patron_id);
        }
      },
      error: function (data) {
        console.log(data);
        $("#user-submit-spinner").hide();
        $("#addQuickAddUserModal").modal("hide");
        $("#interlibraryloans").before(
          '<div class="dialog alert">' +
            __(
              "There was an error creating the patron: </br> <strong>" +
                (data.responseJSON.error
                  ? data.responseJSON.error
                  : data.responseJSON.errors
                      .map((e) => e.path + " " + e.message)
                      .join("</br>")) +
                "</strong>"
            ) +
            "</div>"
        );
      },
    });
  }

  function _appendModalHTML() {
    $("#interlibraryloans").append(`
      <div class="modal" id="addQuickAddUserModal" tabindex="-1" role="dialog"
          aria-labelledby="addQuickAddUserModalLabel" aria-hidden="true">
          <form id="quick_add_user_form">
          <div class="modal-dialog modal-lg" role="document">
              <div class="modal-content modal-lg">
                  <div class="modal-header">
                      <h1 class="modal-title" id="add-group-modal-label">Add patron</h1>
                      <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                  </div>
                  <div class="modal-body">
                      <fieldset class="rows" id="quick_add_user_fieldset">
                          <ol>
                              <li>
                                  <label for="surname" class="required">
                                      Surname: </label>
                                  <input type="text" id="surname_quick_add" name="surname" size="20"
                                      value="" required="" class="noEnterSubmit">
                                  <span class="required">Required</span>
                              </li>
                              <li>
                                  <label for="firstname">
                                      First name: </label>
                                  <input type="text" id="firstname_quick_add" name="firstname" size="20"
                                      value="" class="noEnterSubmit">
                              </li>
                              <li>
                                  <label for="cardnumber" class="required">
                                      Card number:
                                  </label>
                                  <!-- NOTE: div.hint closing tag isn't on the same line -->
                                  <input type="text" id="cardnumber_quick_add" name="cardnumber" size="20"
                                      value="" minlength="1" maxlength="32" required=""
                                      class="noEnterSubmit">
                                  <span class="required">Required</span>
                                  <span id="cn_max" class="required" style="display: none;">Card number
                                      must not be more than 32 characters.</span>
                                  <div class="hint">Card number must be between 1 and 32 characters.
                                  </div>
                                  <!--/div.hint -->
                              </li>
                              <li>
                                  <label for="email">
                                      Email: </label>
                                  <input type="text" id="email_quick_add" name="email" size="20"
                                      value="" class="noEnterSubmit">
                              </li>
                              <li>
                                  <label for="libraries" class="required">Library:</label>
                                  <select name="branchcode" id="libraries_quick_add"
                                      class="noEnterSubmit">
                                      
                                  </select>
                                  <span class="required">Required</span>
                              </li>
                              <li>
                                  <label for="categorycode_entry" class="required">Category: </label>
                                  <select id="categorycode_entry_quick_add" name="categorycode"
                                      class="noEnterSubmit">
                                  </select>
                                  <span class="required">Required</span>
                              </li>
                          </ol>
                      </fieldset>
                      ` + (typeof mandatory_patron_attribute_types !== 'undefined' ? mandatory_patron_attribute_types : '') + `
                  </div> <!-- /.modal-body -->
                  <div class="modal-footer">
                      <input type="hidden" id="quick_add_user_biblio" name="biblio_id"
                          value="test">
                      <button type="submit" class="btn btn-primary"
                          id="addConfirm">Submit <i id="user-submit-spinner"
                              class="fa fa-spinner fa-pulse fa-fw"
                              style="display:none"></i></button>
                      <button type="button" class="btn btn-default"
                          data-bs-dismiss="modal">Cancel</button>
                  </div> <!-- /.modal-footer -->
              </div> <!-- /.modal-content -->
          </div> <!-- /.modal-dialog -->
          </form>
      </div> <!-- /#addQuickAddUserModal -->
  `);
  }

  /**
   * Populate the cardnumber field with the next id
   *
   * @private
   */
  function _GETMaxPatronID() {
    $.ajax({
      url: "/api/v1/patrons?_order_by=-me.patron_id&_per_page=1",
      type: "GET",
      beforeSend: function () {
        $("#cardnumber_quick_add").attr("placeholder", "Adding auto cardnumber...");
      },
      success: function (data) {
        $("#cardnumber_quick_add").val(
          data[data.length - 1].patron_id + 1
        );
      },
      error: function (data) {
        console.log(data);
      },
    });
  }

  /**
   * Given a code, returns the readable category type
   */
  function _getCategoryTypeName(category_type_code) {
    let category_type_map = {
      A: "Adult",
      C: "Child",
      I: "Institutional",
      P: "Professional",
      S: "Staff",
      X: "Statistical",
    };
    return category_type_map[category_type_code];
  }

  // Below code was an attempt at reusing quick add patron form from core, unsuccessful
  // function quick_add_callback(e) {
  //   console.log(e);
  //   console.log("callback");
  // }

  //   function popstate_callback(e) {
  //     console.log(e);
  //     console.log("popstate_callback");
  //   }

  // input
  //   .parent()
  //   .append('<a id="quick_add_user_button"  href="#">+ Add new user</a>');

  // $("#create_form").on("click", "#quick_add_user_button", function (e) {
  //   e.preventDefault();
  //   let quick_add_user_window = window.open(
  //     "/cgi-bin/koha/members/memberentry.pl?op=add&categorycode=HB&quickadd=true&popup=true",
  //     "_blank",
  //     "width=740,height=450,location=yes,toolbar=no,scrollbars=yes,resize=yes"
  //   );

  //   quick_add_user_window.onload = function () {
  //     let dom = $(quick_add_user_window.document);
  //     dom.find("nav.navbar").hide();
  //     dom.find("div#header_search").hide();
  //     dom.find("div#sub-header").hide();
  //     dom.find("div#toolbar a").hide();
  //     console.log(dom.find("#entryform"));
  //     dom.find("#save_quick_add").on("click", function (event) {
  //       var data = dom.find("#quick_add_form").serialize().split("&");
  //     console.log(data);
  //       var obj={};
  //       for (var key in data) {
  //         obj[data[key].split("=")[0]] = data[key].split("=")[1];
  //       }
  //       $.ajax({
  //           type: 'post',
  //           url: '/api/v1/patrons',
  //           data: JSON.stringify(obj),
  //           contentType: "application/json",
  //           traditional: true,
  //           success: function (data) {
  //               console.log(data);
  //           }
  //       });
  //       // quick_add_user_window.close();
  //       // console.log("button clicked");
  //     });
  //     dom.find("#entryform").on("submit", function (event) {
  //       console.log("submitted");
  //     });
  //   };

  //   quick_add_user_window.onpopstate = function () {
  //   //  console.log('pop');
  //   };

  //   quick_add_user_window.addEventListener(
  //     "popstate",
  //     popstate_callback,
  //     false
  //   );

  //   quick_add_user_window.addEventListener(
  //     "beforeunload",
  //     quick_add_callback,
  //     false
  //   );
  // });
}
