(function (res, writer, context) {
	var path = context.pathInfo.path;

	context.renderResource(path, '', 'default', context, function(contentType, content) {
		writer.start(contentType);
		writer.write(content);
		writer.end();
	});
});
