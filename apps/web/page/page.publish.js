(function (res, writer, context) {
	var cheerio = require('cheerio');
	var path = context.getCurrentResourcePath();
	var paths = [path];

	var rewrite_links = function(content) {
		var $ = cheerio.load(content);
		$('a').each(function(i, el) {
			var href = $(el).attr('href');
			href = href.replace(/\.xhtml/, '.html');

			$(el).attr('href', href);
		});
		return $.html();
	};

	var export_paths = function() {
		writer.start('text/plain');
		
		paths.forEach(function (path) {
			var npath = '/content/out' + path + '.html';
			writer.write(path+'\n');

			context.renderResource(path, '', 'html', context, function(contentType, content) {
				var data = {
					_content:rewrite_links(content),
					_ct:contentType
				};
				context.storeResource(npath, data, function() {
				});
			});
		});

		writer.end();
	};

	Tools.visitAllChidren(res, true, function(rpath, rres) {
		if (rpath) {
			if (rres.getSuperRenderType() === 'web/page') {
				paths.push(Utils.filename_path_append(path, rpath));
			}
		}
		else {
			export_paths();
		}
	});

});
