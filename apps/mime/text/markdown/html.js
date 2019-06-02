(function (res, writer, context) {
	var adapter = new ContentWriterAdapter('utf8', function(txt) {
		writer.start('text/html');

		var md = require('markdown-it')();
		var result = '';
		if (txt) result = md.render(txt);

		writer.write(result);
		writer.end();
	});

	res.read(adapter);
});
