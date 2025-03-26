/* START CROSSREF DOI / PUBMEDID LOOKUP */
(function() {
  var standard = {
        selectName: 'type',
        materialTypes: [ 'article', 'chapter' ],
        parser: function(data) {
            if(typeof data.message !== 'undefined'){
                var message = data.message;
                $('#issue').val(message.issue);
                $('#pages').val(message.page);
                $('#article_title').val(message.title.join('. '));
                $('#chapter').val(message.title.join('. '));
                $('#volume').val(message.volume);
                $('#article_author').val(message.author?.map(function(a) {
                    return a.given + ' ' + a.family;
                }).join('. '));
                $('#chapter_author').val(message.author?.map(function(a) {
                    return a.given + ' ' + a.family;
                }).join('. '));
                $('#title').val(message['container-title'].join('. '));
                $('#issn').val(message.ISSN[0]);
                if (message.published && message.published['date-parts'] && message.published['date-parts'][0] && message.published['date-parts'][0][0]) {
                    $('#year').val(message.published['date-parts'][0][0]);
                    $('#published_date').val(message.published['date-parts'][0].join('-'));
                }
            }
            if(typeof data.result !== 'undefined'){
                var uid = data.result.uids[0];
                var result = data.result[uid];
                $('#issue').val(result.issue);
                $('#pages').val(result.pages);
                $('#article_title').val(result.title);
                $('#chapter').val(result.title);
                $('#volume').val(result.volume);
                $('#article_author').val(result.authors?.map(function(a) {
                    return a.name;
                }).join('; '));
                $('#chapter_author').val(result.author?.map(function(a) {
                    return a.given + ' ' + a.family;
                }).join('. '));
                $('#aulast').val("");
                $('#title').val(result.fulljournalname);
                $('#issn').val(result.issn);
                $('#published_date').val(result.sortpubdate?.slice(0,4));
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
                $('#aufirst').val(message.author?.map(function(a) {
                    return a.given;
                }).join('; '));
                $('#aulast').val(message.author?.map(function(a) {
                    return a.family;
                }).join('; '));
                $('#title').val(message['container-title'].join('. '));
                $('#issn').val(message.ISSN[0]);
                $('#date').val(message.published['date-parts'][0][0]);
            }
            if(typeof data.result !== 'undefined'){
                var uid = data.result.uids[0];
                var result = data.result[uid];
                $('#issue').val(result.issue);
                $('#pages').val(result.pages);
                $('#atitle').val(result.title);
                $('#volume').val(result.volume);
                $('#aufirst').val(result.authors?.map(function(a) {
                    return a.name;
                }).join('; '));
                $('#aulast').val("");
                $('#title').val(result.fulljournalname);
                $('#issn').val(result.issn);
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
              $('#ArticleAuthor').val(message.author?.map(function(a) {
                  return a.given + ' ' + a.family;
              }).join('. ')).trigger("keyup");
              $('#PatronJournalTitle').val(message['container-title'].join('. ')).trigger("keyup");
              $('#SuggestedIssns').val(message.ISSN.join(' ')).trigger("keyup");
              $('#JournalMonth').val(message.published['date-parts'][0][1]).trigger("keyup");
              $('#PatronJournalYear').val(message.published['date-parts'][0][0]).trigger("keyup");
          }
      },
      FreeForm: standard,
      Standard: standard
  };

  // Establish our backend
  var backend_names = Object.keys(backends).join('|');
  var re = new RegExp('backend=(' + backend_names + ')');
  var backend_match = window.location.search.match(re);
  
  if (!backend_match) return;
  
  var backend = backend_match[1];

  var select = $('select#type[name=' + backends[backend].selectName + ']');
  
  var reg = new RegExp(/opac/);
  var inputs = reg.test(window.location.pathname) ?
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
          pubmedidField = $('#article-standard-fields, #article-freeform-fields').find('input#pubmedid').first();
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
      $('#create_form').prepend(newFieldset);
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
                $('#create_form').find('input[type="text"]').not('input[name="backend"]').not('input[name="doi"]').not('input[name="cardnumber"]').val('');
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
                $('#create_form').find('input[type="text"]').not('input[name="backend"]').not('input[name="pubmedid"]').not('input[name="cardnumber"]').val('');
            }
           // Kick off lookup
           debounce(pubmedid, 1000)(pubmedidField.val());
        });
    }
  };

  // Make the call to Crossref
  var crossref = function(doi) {
      if (doi.length === 0) return;
      var url = 'https://api.crossref.org/works/' + doi;
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
      var url = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&retmode=json&id=' + pubmedid;
      $.ajax({
          dataType: "json",
          url: url,
          success: function(data){
            if(data['error']){
              $('#auto-fill-container ol').append(getAutoFillMessage('error'));
            } else if(data['result'][pubmedidField.val()]['error']){
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