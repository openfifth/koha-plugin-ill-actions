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
                    $('#published_date').val(message.published['date-parts'].join('-'));
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
  var bookChapterDoiField;
  var pubmedidField;

  // When the select changes, keep things correct
  $(select).change(function() {
      manageIdentifier();
  });


  // Manage the presence of the DOI field
  var manageIdentifier = function() {

      // If this is the wrong material type, we may need to remove the field
      if ( backend != 'ReprintsDesk' && backends[backend].materialTypes.indexOf(select.val()) === -1 ) {
        $('input#doi').parent("li").remove();
        return;
      }

      // First try to establish if the form already has a DOI field
      doiField = null;      
      bookChapterDoiField = null;
      pubmedidField = null;
      var doiregex = /\bdoi\b/i;
      var bookchapterdoifieldregex = /\bchapter_doi\b/i;
      var pubmedidregex = /\bpubmedid\b/i;

      inputs.each(function() {
          var name = $(this).attr('name');
          if (doiregex.test(name)) {
              doiField = $(this);
          }
      });

      inputs.each(function() {
          var name = $(this).attr('name');
          if (bookchapterdoifieldregex.test(name)) {
              bookChapterDoiField = $(this);
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
          var doi_el = '<li style="margin-top:1rem;margin-bottom:1rem;" id="js_doi">' +
               '<label id="doi" for="doi">DOI</label>' +
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

      manageListener();
  };

  var manageListener = function() {
      // Remove any existing listener
      if (doiField) {
          $(doiField).off('input');
          // Add our own
          $(doiField).on('input', function() {
             // Kick off lookup
             debounce(crossref, 1000)(doiField.val());
          });
      }

      if (bookChapterDoiField) {
          $(bookChapterDoiField).off('input');
          // Add our own
          $(bookChapterDoiField).on('input', function() {
             // Kick off lookup
             debounce(crossref, 1000)(bookChapterDoiField.val());
          });
      }

      if (pubmedidField) {
        $(pubmedidField).off('input');
        // Add our own
        $(pubmedidField).on('input', function() {
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
          success: backends[backend].parser
      });
  };

  // Make the call to Pubmed
  var pubmedid = function(pubmedid) {
      if (pubmedid.length === 0) return;
      var url = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&retmode=json&id=' + pubmedid;
      $.ajax({
          dataType: "json",
          url: url,
          success: backends[backend].parser
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

  manageIdentifier();
})();
/* END CROSSREF DOI / PUBMEDID LOOKUP */