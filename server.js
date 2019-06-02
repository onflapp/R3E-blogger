var webdav = require('webdav-server').v2;
var express = require('express');
var app = express();

var r = require('./dist/r3elib');
var l = require('./dist/exports');

var port = Number.parseInt(process.env.PORT) || 3000;

var content = new r.FileResource('./content');
var system = new r.FileResource('./dist/templates');
var apps = new r.FileResource('./apps').wrap({
	getSuperType: function() { return 'resource/templates'; }
});

var repos = {
  'content':content,
  'system-templates':system,
  'user-templates':apps
}

var config = {
  'X': '.x-',
  'USER_TEMPLATES':'/user-templates',
  'BOOTSTRAP_CSS': 'https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.7/css/bootstrap.min.css',
  'CODEMIRROR_JS': 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.43.0/codemirror.min.js',
  'CODEMIRROR_CSS': 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.43.0/codemirror.min.css',
  'CODEMIRROR_THEME': 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.43.0/theme/solarized.min.css'
};

//configure Dropbox repo
if (process.env.DROPBOX_TOKEN) {
  console.log('* enable Dropbox access');

  var fetch = require('isomorphic-fetch');
  var Dropbox = require('dropbox').Dropbox;
  var dbx = new Dropbox({ accessToken:process.env.DROPBOX_TOKEN, fetch:fetch});
  var box = new r.DropBoxResource(dbx);

  repos['box'] = box;
}

//configure GitHub repo
if (process.env.GITHUB_REPO) {
  console.log('* enable GitHub repo ' + process.env.GITHUB_REPO);

  var GitHub = require('github-api');
  var gh = new GitHub({
    username: process.env.GITHUB_USER,
    password: process.env.GITHUB_PASSWORD 
  });
  var git = new r.GitHubResource(gh.getRepo(process.env.GITHUB_REPO, 'blog'));

  repos['git'] = git;
}

//configure pouchdb client as content repo
if (process.env.POUCHDB) {
  console.log('* connect to PouchDB as client using ' + process.env.POUCHDB);

  var PouchDB = require('pouchdb');
  var db = new PouchDB(process.env.POUCHDB);

  var contentdb = new r.PouchDBResource(db);
  repos['content'] = contentdb;
}

var root = new r.RootResource(repos);
var rres = new r.ResourceResolver(root);
var rtmp = new r.MultiResourceResolver([apps, system]);

//start pouchdb database server
if (process.env.POUCHDB_SERVER) {
  console.log('* start PouchDB in ' + process.env.POUCHDB_SERVER);

  var PouchDB = require('pouchdb');
  db = PouchDB.defaults({prefix:process.env.POUCHDB_SERVER});
  app.use('/db', require('express-pouchdb')(db, {
    mode: 'minimumForPouchDB'
  }));
  new db('contentdb');
}

//setup webdav server
if (process.env.WEBDAV) {
  console.log('* enable WebDAV on ' + process.env.WEBDAV);
  var wserver = new webdav.WebDAVServer({
    autoload: {
      serializers: [
        new l.DAVSerializer()
      ]
    }
  });

  wserver.setFileSystemSync('/', new l.DAVFileSystemResource(rres), true);
  app.use(webdav.extensions.express(process.env.WEBDAV, wserver));
}

app.use("/static", express.static(__dirname+'/static'));
app.use("/dist", express.static(__dirname+'/dist'));

//GET/POST REST handlers
app.get('/*', function(req, res) {
	var handler = new r.ServerRequestHandler(rres, rtmp, res);

	handler.setConfigProperties(config);
	handler.registerFactory('js', new r.JSRendererFactory());
	handler.registerFactory('hbs', new r.HBSRendererFactory());
	handler.registerFactory('html', new r.HBSRendererFactory());

	handler.handleGetRequest(req);
});

app.post('/*', function(req, res) {
	var handler = new r.ServerRequestHandler(rres, rtmp, res);

	handler.setConfigProperties(config);
	handler.registerFactory('js', new r.JSRendererFactory());
	handler.registerFactory('hbs', new r.HBSRendererFactory());

	handler.handlePostRequest(req);
});

app.listen(port, function() {
	console.log('app listening on port '+port);
});

////////////////////////////////////////////////////
/*
var pub = express();

var rres = new r.ResourceResolver(content);

pub.get('/*', function(req, res) {
	var handler = new r.ServerRequestHandler(rres, rtmp, res);

	handler.setConfigProperties(config);
	handler.registerFactory('js', new r.JSRendererFactory());
	handler.registerFactory('hbs', new r.HBSRendererFactory());
	handler.registerFactory('html', new r.HBSRendererFactory());

  handler.registerMakeRenderTypePatterns(makeRenderTypePatterns);

	handler.handleGetRequest(req);
});

pub.listen(port+2, function() {
	console.log('app listening on port '+(port+2));
});
*/
