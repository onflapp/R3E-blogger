(function (res, writer, context) {
  context.renderResource(context.getCurrentResourcePath(), "", "parents", function(ct, data) {
    writer.start('object/javascript');

    var rv = [];
    for (var i = 0; i < data.length; i++) {
      var it = data[i];

      if (it.renderSuperType !== 'web/page') continue;
      else rv.push(it);
    }

    writer.write(rv);
    writer.end();
  });

})
