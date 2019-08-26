function parseHTML(code) {
  if (typeof window !== 'undefined' && typeof window.jQuery !== 'undefined') {
    var parser = new DOMParser();
    var doc = parser.parseFromString(code, "text/html");

    //emulate cheerio with jQuery
    var jq = function (sel) {
      return jQuery(sel, doc);
    };

    jq.html = function() {
      var ser = new XMLSerializer();
      return ser.serializeToString(doc);
    };

    return jq;
  }
  else {
	  var cheerio = require('cheerio');
	  return cheerio.load(code);
  }
}

(function (res, writer, context) {
	var path = context.getCurrentResourcePath();
	var session = new TemplateRendererSession();
	var sel = context.getCurrentSelector();
  var ncontext = context.clone();

  ncontext._setCurrentSelector('html');

	context.renderResource(path, '', 'html', ncontext, function(contentType, content) {
		var $ = parseHTML(content);

		if (sel === 'html') {
			var $styles = $('link[rel="stylesheet"]');
			$styles.each(function(i, el) {
				var $el = $(el);
				var href = $el.attr('href');
				if (href.charAt(0) !== '/' && href.indexOf('http') !== 0) {
					$el.attr('href', path+'.xload/'+href);
				}
			});
		}

		if (sel === 'edit') {
			var $head = $('head');
			$head.append('<script src="//cdnjs.cloudflare.com/ajax/libs/tinymce/4.9.2/tinymce.min.js"></script>');
			$head.append('<script src="/static/contenteditor.js"></script>');
			$head.append('<link rel="stylesheet" href="/static/contenteditor.css"></link>');
		}

		var $dcontent = $('[data-content]');
		$dcontent.each(function(i, el) {
			var p = session.makeOutputPlaceholder();
			var $el = $(el);
			var dpath = path + '/' + $el.data('content');
			var def = $el.html();

			context.renderResource(dpath, '', 'text', ncontext, function(contentType, content) {
				if (sel === 'edit' && content.trim() === '') {
					p.write(def);
				}
				else {
					p.write(content);
				}
				p.end();
			});

			$el.html(p.placeholder);
		});

		var txt = $.html();

    session.replaceOutputPlaceholders(txt, function(txt) {
			writer.start('text/html');
			writer.write(txt);
			writer.end();
		})
	});
});
