(function (res, writer, context) {
	var path = context.getCurrentResourcePath();
	var session = new TemplateRendererSession();
	var sel = context.getCurrentSelector();

	context.renderResource(path, '', '', function(contentType, content) {
		var $ = HTMLParser.parse(content);

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
			$head.append('<script src="/static/jquery.js"></script>');
			$head.append('<script src="/static/jquery-dragger.js"></script>');
			$head.append('<link rel="stylesheet" href="/static/contenteditor.css"></link>');
		}

		var $dcontent = $('[data-content]');
		$dcontent.each(function(i, el) {
			var p = session.makeOutputPlaceholder();
			var $el = $(el);
			var dpath = path + '/' + $el.data('content');
			var def = $el.html();

			context.renderResource(dpath, '', 'text', function(contentType, content) {
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
