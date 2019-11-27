(function (res, writer, context) {
  context.renderResource(context.getCurrentResourcePath(), "", "children", function(ct, data) {
    writer.start('object/javascript');

    var rv = data.filter(function(it) {
      if (it.renderSuperType === 'web/page') return true;
      else return false;
    });

    writer.write(rv);
    writer.end();
  });

})
