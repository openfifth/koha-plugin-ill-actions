/* START CROSSREF DOI / PUBMEDID LOOKUP */
(function() {

  let form_id = $('#create_form').length ? '#create_form' : '#standard_edit_form';

  var standard = {
        selectName: 'type',
        materialTypes: [ 'article', 'chapter' ],
        parser: function(data) {
            if(typeof data.message !== 'undefined'){
                var message = data.message;
                $('#issue').val(message.issue).trigger('keyup');
                $('#pages').val(message.page).trigger('keyup');
                $('#publisher').val(message.publisher).trigger('keyup');
                $('#article_title').val(message.title.join('. ')).trigger('keyup');
                $('#chapter').val(message.title.join('. ')).trigger('keyup');
                $('#volume').val(message.volume).trigger('keyup');
                $('#article_author').val(message.author?.slice(0, 10).map(function(a) {
                    return a.given + ' ' + a.family;
                }).join('. ')).trigger('keyup');
                $('#chapter_author').val(message.author?.map(function(a) {
                    return a.given + ' ' + a.family;
                }).join('. ')).trigger('keyup');
                $('#title').val(message['container-title'].join('. ')).trigger('keyup');
                $('#issn').val(message["issn-type"].find(item => item.type === "print")?.value).trigger('keyup');
                $('#eissn').val(message["issn-type"].find(item => item.type === "electronic")?.value).trigger('keyup');
                if (message.published && message.published['date-parts'] && message.published['date-parts'][0] && message.published['date-parts'][0][0]) {
                    $('#year').val(message.published['date-parts'][0][0]).trigger('keyup');
                    $('#published_date').val(message.published['date-parts'][0].join('-')).trigger('keyup');
                }
            }
            if(typeof data.result !== 'undefined'){
                var uid = data.result.uids[0];
                var result = data.result[uid];
                $('#issue').val(result.issue).trigger('keyup');
                $('#pages').val(result.pages).trigger('keyup');
                $('#publisher').val(result.publishername).trigger('keyup');
                $('#article_title').val(result.title).trigger('keyup');
                $('#chapter').val(result.title).trigger('keyup');
                $('#volume').val(result.volume).trigger('keyup');
                $('#article_author').val(result.authors?.slice(0, 10).map(function(a) {
                    return a.name;
                }).join('; ')).trigger('keyup');
                $('#chapter_author').val(result.author?.map(function(a) {
                    return a.given + ' ' + a.family;
                }).join('. ')).trigger('keyup');
                $('#aulast').val("").trigger('keyup');
                $('#title').val(result.fulljournalname).trigger('keyup');
                $('#issn').val(result.issn).trigger('keyup');
                $('#eissn').val(result.essn).trigger('keyup');
                $('#published_date').val(result.sortpubdate?.slice(0,4)).trigger('keyup');
            }
        }
  };

  var backends = {
      ReprintsDesk: {
            materialTypes: [ 'Article' ],
          parser: function(data) {
            if(typeof data.message !== 'undefined'){
                var message = data.message;
                $('#issue').val(message.issue);
                $('#pages').val(message.page);
                $('#atitle').val(message.title.join('. '));
                $('#volume').val(message.volume);
                $('#aufirst').val(message.author?.slice(0, 10).map(function(a) {
                    return a.given;
                }).join('; '));
                $('#aulast').val(message.author?.slice(0, 10).map(function(a) {
                    return a.family;
                }).join('; '));
                $('#title').val(message['container-title'].join('. '));
                $('#issn').val(message["issn-type"].find(item => item.type === "print")?.value).trigger('keyup');
                $('#eissn').val(message["issn-type"].find(item => item.type === "electronic")?.value).trigger('keyup');
                if (message.published && message.published['date-parts'] && message.published['date-parts'][0] && message.published['date-parts'][0][0]) {
                    $('#date').val(message.published['date-parts'][0][0]);
                }
            }
            if(typeof data.result !== 'undefined'){
                var uid = data.result.uids[0];
                var result = data.result[uid];
                $('#issue').val(result.issue);
                $('#pages').val(result.pages);
                $('#atitle').val(result.title);
                $('#volume').val(result.volume);
                $('#aufirst').val(result.authors?.slice(0, 10).map(function(a) {
                    return a.name;
                }).join('; '));
                $('#aulast').val("");
                $('#title').val(result.fulljournalname);
                $('#issn').val(result.issn);
                $('#eissn').val(result.essn).trigger('keyup');
                $('#date').val(result.sortpubdate.slice(0,4));
            }
          }
      },
      RapidILL: {
          selectName: 'RapidRequestType',
          materialTypes: [ 'Article' ],
          parser: function(data) {
              var message = data.message;
              $('#JournalIssue').val(message.issue).trigger("keyup");
              $('#ArticlePages').val(message.page).trigger("keyup");
              $('#ArticleTitle').val(message.title.join('. ')).trigger("keyup");
              $('#JournalVol').val(message.volume).trigger("keyup");
              $('#ArticleAuthor').val(message.author?.slice(0, 10).map(function(a) {
                  return a.given + ' ' + a.family;
              }).join('. ')).trigger("keyup");
              $('#PatronJournalTitle').val(message['container-title'].join('. ')).trigger("keyup");
              $('#SuggestedIssns').val(message.ISSN.join(' ')).trigger("keyup");
              if (message.published && message.published['date-parts'] && message.published['date-parts'][0] && message.published['date-parts'][0][0]) {
                  $('#JournalMonth').val(message.published['date-parts'][0][1]).trigger("keyup");
                  $('#PatronJournalYear').val(message.published['date-parts'][0][0]).trigger("keyup");
              }
          }
      },
      FreeForm: standard,
      Standard: standard
  };

  // Establish our backend
  var backend_names = Object.keys(backends).join('|');
  var re = new RegExp('backend=(' + backend_names + ')');
  var backend_match = window.location.search.match(re) || $('input[name="backend"]').val();
  
  if (!backend_match) return;
  
  var backend = backend_match && Array.isArray(backend_match) ? backend_match[1] : backend_match;

  var select = $('select#type[name=' + backends[backend].selectName + ']');
  
  var reg = new RegExp(/opac/);
  var isOPAC = reg.test(window.location.pathname);
  var inputs = isOPAC ?
      $('#illrequests input') :
      $('#interlibraryloans input');

  // Initialise the variable to store the DOI and PubmedID elements
  var doiField;
  var pubmedidField;

  // When the select changes, keep things correct
  $(select).change(function() {
      manageIdentifier();
  });


  // Manage the presence of the DOI field
  var manageIdentifier = function() {

      $('#auto-fill-container').remove();

      // If this is the wrong material type, we may need to remove the field
      if ( backend != 'ReprintsDesk' && backends[backend].materialTypes.indexOf(select.val()) === -1 ) {
        $('input#doi').parent("li").remove();
        return;
      }

      // First try to establish if the form already has a DOI field
      doiField = null;      
      pubmedidField = null;
      var doiregex = /\bdoi\b/i;
      var pubmedidregex = /\bpubmedid\b/i;

      inputs.each(function() {
          var name = $(this).attr('name');
          if (doiregex.test(name)) {
              doiField = $(this);
          }
      });

      inputs.each(function() {
        var name = $(this).attr('name');
        if (pubmedidregex.test(name)) {
            pubmedidField = $(this);
        }
      });

      // Add the DOI if appropriate
      if (!doiField) {
          var doi_el = '<li id="js_doi">' +
               '<label id="doi" for="doi">DOI:</label>' +
               '<input type="text" name="doi" id="doi" value="">' +
               '</li>';
          select.parent().append(doi_el);
          doiField = select.parent().find('input#doi').first();
      }
    
      // Add the Pubmedid if appropriate
      if (!pubmedidField && backend == 'FreeForm' || backend == 'Standard') {
          var pubmedid_el = '<li id="js_pubmedid">' +
               '<label id="pubmedid" for="pubmedid">PubMed ID:</label>' +
               '<input type="text" name="pubmedid" id="pubmedid" value="">' +
               '</li>';
          select.parent().append(pubmedid_el);
          pubmedidField = $('input#pubmedid');
          if(doiField?.length){
            var doiClasses = doiField.attr('class');
            if(doiClasses?.length){
                pubmedidField.addClass(doiClasses);
            }
          }
          if(!pubmedidField.length){
            pubmedidField = select.parent().find('input#pubmedid').first();
          }
      }

      var newFieldset = $('<fieldset id="auto-fill-container" class="rows"><ol></ol></fieldset>');
      if( backend == 'Standard' ){
        if( isOPAC ){
          $(form_id + ' fieldset:eq(1)').after(newFieldset);
        }else{
          $(form_id + ' fieldset:first').after(newFieldset);
        }
      }else{
        $(form_id).prepend(newFieldset);
      }
      newFieldset.children('ol').prepend(getAutoFillMessage('tip'));
      newFieldset.children('ol').append(doiField.parent());
      if(pubmedidField?.length){
          newFieldset.children('ol').append(pubmedidField.parent());
      }

      manageListener();
  };

  var manageListener = function() {
      // Remove any existing listener
      if (doiField) {
          $(doiField).off('input');
          // Add our own
          $(doiField).on('input', function() {
            if(!$('#auto-fill-loading').length && doiField.val().length > 0){
                $('#auto-fill-container ol').append(getAutoFillMessage('loading'));
                $('#auto-fill-result').remove();
                $(form_id + ' input[type="text"]').not('[name="backend"]').not('[name="doi"]').not('[name="cardnumber"]').not('[name^="unauthenticated"]').not('[name^="custom"]').val('');
            }
             // Kick off lookup
             debounce(crossref, 1000)(doiField.val());
          });
      }

      if (pubmedidField) {
        $(pubmedidField).off('input');
        // Add our own
        $(pubmedidField).on('input', function() {
            if(!$('#auto-fill-loading').length && pubmedidField.val().length > 0){
                $('#auto-fill-container ol').append(getAutoFillMessage('loading'));
                $('#auto-fill-result').remove();
                $(form_id + ' input[type="text"]').not('[name="backend"]').not('[name="pubmedid"]').not('[name="cardnumber"]').not('[name^="unauthenticated"]').not('[name^="custom"]').val('');
            }
           // Kick off lookup
           debounce(pubmedid, 1000)(pubmedidField.val());
        });
    }
  };

  // Make the call to Crossref
  var crossref = function(doi) {
      if (doi.length === 0) return;
      var url = 'https://api.crossref.org/works/' + doi.trim();
      $.ajax({
          dataType: "json",
          url: url,
          success: function(data){
            backends[backend].parser(data);
            $('#auto-fill-container ol').append(getAutoFillMessage('success'));
          },
          error: function() {
              $('#auto-fill-container ol').append(getAutoFillMessage('error'));
          },
          complete: function() {
              $('#auto-fill-loading').remove();
          },
      });
  };

  // Make the call to Pubmed
  var pubmedid = function(pubmedid) {
      if (pubmedid.length === 0) return;
      let clean_pubmedid = pubmedid.trim();
      var url = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&retmode=json&id=' + clean_pubmedid;
      $.ajax({
          dataType: "json",
          url: url,
          success: function(data){
            if(data['error']){
              $('#auto-fill-container ol').append(getAutoFillMessage('error'));
            } else if(data['result'][clean_pubmedid]['error']){
              $('#auto-fill-container ol').append(getAutoFillMessage('error'));
            }else{
              backends[backend].parser(data);
              $('#auto-fill-container ol').append(getAutoFillMessage('success'));
            }
          },
          error: function() {
              $('#auto-fill-container ol').append(getAutoFillMessage('error'));
          },
          complete: function() {
              $('#auto-fill-loading').remove();
          },
      });
  };

  // Simple debouncer
  var timeout;
  function debounce(func, wait, immediate) {
      return function () {
          var context = this,
              args = arguments;
          var later = function () {
              timeout = null;
              if (!immediate) func.apply(context, args);
          };
          var callNow = immediate && !timeout;
          clearTimeout(timeout);
          timeout = setTimeout(later, wait);
          if (callNow) func.apply(context, args);
      };
  }

  function getAutoFillMessage(message){
    let messages = {
        error: '<li id="auto-fill-result"><label class="text-danger">Error</label><span class="text-danger"><i class="fa-solid fa-xmark"></i> Couldn\'t add metadata</span></li>',
        loading: '<li id="auto-fill-loading"><label class="text-info">Loading</label><span class="text-info"><i class="fa fa-spinner fa-pulse fa-fw"></i> Attemping to fetch metadata...</span></li>',
        success: '<li id="auto-fill-result"><label class="text-success">Success</label><span class="text-success"><i class="fa-solid fa-check"></i> Metadata added</span></li>',
        tip: '<li><label class="text-info">Top tip!</label><span class="text-info"><i class="fa-solid fa-info-circle"></i> Add the DOI or PubMed ID and the other fields will auto-fill</span></li>'
    };
    return messages[message];
  }

  manageIdentifier();
})();
/* END CROSSREF DOI / PUBMEDID LOOKUP */