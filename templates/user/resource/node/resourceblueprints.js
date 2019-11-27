(function (res, writer, context) {
  var paths = [];
  var rv = [];

  if (res.getRenderType())      paths.push("/content/blueprints/"+res.getRenderType());
  if (res.getRenderSuperType()) paths.push("/content/blueprints/"+res.getRenderSuperType());

  var write_all = function() {
    writer.start('object/javascript');

    writer.write(rv);
    writer.end();
  };

  var collect_children = function() {
    var path = paths.shift();
    if (path) {
      context.renderResource(path, "", "children", function(ct, data) {
        rv = rv.concat(data);
        collect_children();
      });
    }
    else {
      write_all();
    }
  };

  collect_children();
});
