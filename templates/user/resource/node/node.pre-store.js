(function (res, writer, context) {
  var path = context.getCurrentResourcePath();
  var name = Utils.filename(path);
  var dirname = Utils.filename_dir(path);

  context.resolveResource(dirname, function(pres) {
    pres.listChildrenNames(function(names) {
      if (res.values[':delete']) {
        names = Utils.listRemoveNames(names, [name]);
      }
      else if (res.values[':order_after']) {
      }
      else {
        res.values['modified_date'] = '' + new Date();
        names.push(name);
      }

      context.storeResource(dirname, {'child_order':JSON.stringify(names)}, function() {
        writer.write(res);
        writer.end();
      });
    });
  });

});
