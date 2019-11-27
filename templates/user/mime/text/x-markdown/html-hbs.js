(function (res, writer, context) {
  var path = context.getCurrentResourcePath();
  var dpath = Utils.filename_dir(path);

  context.renderResource(path, "", "html", function(ct, data) {
    var cres = new ObjectContentResource({_content:data}, 'temp.hbs');
    var ncontext = context.clone();
    ncontext.__overrideCurrentSelector('default');
    ncontext.__overrideCurrentResourcePath(dpath);
    ncontext.resourceRequestHandler.resourceRenderer.makeRenderingFunction(cres, function(func) {
      func(res, writer, ncontext);
    });
  });
});
