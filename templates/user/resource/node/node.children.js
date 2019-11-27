(function (res, writer, context) {
  writer.start('object/javascript');
  var order = Utils.string2object(res.getProperty('child_order'));

  res.listChildrenResources(function (children) {
    var rv = [];
    var names = [];
    var nodes = {};

    for (var i = 0; i < children.length; i++) {
      names.push(children[i].getName());
      nodes[children[i].getName()] = children[i];
    }

    names.sort(function(a, b) {
      return a.localeCompare(b);
    });

    if (order) names = Utils.listSortByNames(names, order);

    for (var i = 0; i < names.length; i++) {
      var res = nodes[names[i]];
      var map = context.makeContextMap(res);
      var name = res.getName();

      map['name'] = name;
      map['path'] = Utils.filename_path_append(context.getCurrentResourcePath(), name);

      rv.push(map);
    }

    writer.write(rv);
    writer.end();
  });

})
