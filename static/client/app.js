//clear the body to reduce flashing
document.body.innerHTML = '';

//user content
db = new PouchDB('contentdb');
var userContent = new PouchDBResource(db);

//system templates
var systemTemplates = new RemoteTemplateResource('/dist/templates').wrap({
  getType: function() { return 'resource/templates'; }
});

//tempates for our own renderTypes
var userTemplate = new RemoteTemplateResource('/user-templates').wrap({
  getType: function() { return 'resource/templates'; }
});

//root resource can combine different resource together
//we are exposing systemTemplates and userTemplate so that templates become accessible
var root = new RootResource({
  'content': userContent
});

var rres = new ResourceResolver(root);
var rtmp = new MultiResourceResolver([userTemplate, systemTemplates]);

//configuration which is passed through context to the renderer, accessible as C.something
var config = {
  'X': '.x-',
  'USER_TEMPLATES':'/user-templates',
  'BOOTSTRAP_CSS': 'https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.7/css/bootstrap.min.css',
  'CODEMIRROR_JS': 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.43.0/codemirror.min.js',
  'CODEMIRROR_CSS': 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.43.0/codemirror.min.css',
  'CODEMIRROR_THEME': 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.43.0/theme/solarized.min.css'
};

var handler = new ClientRequestHandler(rres, rtmp);

// [path].x-[selector].[selectorArgs][dataPath]
// /cards/item1.x-json.-1.223/a/d
handler.setPathParserPattern('^(\\/.*?)(\\.x-([a-z,\\-_]+))(\\.([a-z0-9,\\-\\.]+))?(\\/.*?)?$');
handler.setConfigProperties(config);

//register renderers
handler.registerFactory('js', new JSRendererFactory());
handler.registerFactory('hbs', new HBSRendererFactory());
handler.registerFactory('html', new HBSRendererFactory());

//persist data in localStorage
handler.addEventListener('stored', function(path, data) {
});

db.sync(window.location.protocol+'//'+window.location.host+'/db/contentdb', {
    live: true,
    retry: true})
  .on('change', function (change) {
    console.log(change);
  })
  .on('paused', function (info) {
    console.log(info);
  })
  .on('active', function (info) {
    console.log(info);
  })
  .on('error', function (err) {
    console.log(err);
  });

//start by listing content of the root resource
var path = location.hash.substr(1);
if (!path) path = '/.x-res-list';
handler.handleRequest(path);
