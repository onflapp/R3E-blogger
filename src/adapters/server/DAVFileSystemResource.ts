// https://github.com/OpenMarshal/npm-WebDAV-Server-Types/tree/master/repositories

import { v2 as webdav } from 'webdav-server' 

const Readable = require('stream').Readable;
const Writable = require('stream').Writable;

export class DAVSerializer implements webdav.FileSystemSerializer {
  uid() {
    return 'R3E-Res-FSSerializer-1.0.0';
  }
  
  serialize(fs, callback) {
    callback(null);
  }

  unserialize(serializedData, callback) {
    callback(null);
  }
}

export class DAVFileSystemResource extends webdav.FileSystem {
  protected rres;

  constructor(rres) {
    super(new DAVSerializer());

    this.rres = rres;
  }

  _move(pathFrom, pathTo, ctx, callback) {
    var paths = pathTo.paths;
    paths.shift();
    var path = '/'+paths.join('/');

    this.rres.moveResource(pathFrom.toString(), path, function() {
      callback(undefined, true);
    });
    //callback(webdav.Errors.InvalidOperation)
  }

  _create(path, ctx, callback) {
    if (ctx.type.isFile) {
      callback();
    }
    else {
      this.rres.storeResource(path.toString(), {}, function() {
        callback();
     });
    }
  }

  _delete(path, ctx, callback) {
    this.rres.removeResource(path.toString(), function() {
      callback();
    });
  }

  _openWriteStream(pathTo, ctx, callback) {
    var vv = pathTo.toString();
    var self = this;

    var write_to_stream = function(writer, cb) {
      var buffer = new Writable();
      
      buffer._write = function(chunk, encoding, done) {
        console.log('=W:'+vv);
        writer.write(chunk);
        done();
      };
      buffer._final = function(cb) {
        console.log('-W:'+vv);
        writer.end(cb);
      };

      writer.start();
      console.log('+W:'+vv);
      callback(null, buffer);
    };

    console.log('RR:'+ vv);
    this.rres.resolveResource(pathTo.toString(), function(res) {
      if (res) {
        res.importContent(write_to_stream, function() {
        });
      }
      else {
        var paths = pathTo.paths;
        var name = paths.pop();
        var rpath = '/'+paths.join('/');

        self.rres.resolveResource(rpath, function(res) {
          if (res) {
            res.resolveOrAllocateChildResource(name, function(res) {
              res.importContent(write_to_stream, function() {
              });
            });
          }
          else {
            callback(webdav.Errors.ResourceNotFound);
          }
        });
      }
    });
  }

  _openReadStream(path, ctx, callback) {
    var vv = path.toString();
    console.log('+R:'+vv);
    var rpath = path.toString();
    this.rres.resolveResource(rpath, function(res) {
      if (res && res.isContentResource()) {
        var buffer = new Readable();
        res.read({
          start:function() {
            callback(undefined, buffer);
          },
          write:function(data) {
            console.log('=R:'+vv);
            buffer.push(data);
          },
          end:function(cb) {
            buffer.push(null);
            if (cb) cb();
            console.log('-R:'+vv);
          }
        });
      }
      else {
        callback(webdav.Errors.ResourceNotFound);
      }
    });
  }

  _size(path, ctx, callback) {
    var rpath = path.toString();
    this.rres.resolveResource(rpath, function(res) {
      if (res) {
        var size = res.getContentSize();
        callback(undefined, size);
      }
      else {
        callback(webdav.Errors.ResourceNotFound);
      }
    });
  }

  _lockManager(path, ctx, callback) {
    //callback(webdav.Errors.ResourceNotFound);

    var locks = new webdav.LocalLockManager();
    callback(undefined, locks);
  }

  _propertyManager(path, ctx, callback) {
    //return callback(webdav.Errors.ResourceNotFound);

    var props = new webdav.LocalPropertyManager({});
    callback(undefined, props);
  }

  _readDir(path, ctx, callback) {
    var rpath = path.toString();
    this.rres.resolveResource(rpath, function(res) {
      if (res) {
        res.listChildrenNames(function(ls) {
          callback(undefined, ls);
        });
      }
      else {
        callback(webdav.Errors.ResourceNotFound);
      }
    });
  }

  _creationDate(path, ctx, callback) {
    this._lastModifiedDate(path, ctx, callback);
  }

  _lastModifiedDate(path, ctx, callback) {
    //return callback(webdav.Errors.ResourceNotFound);
    var mdate = null;

    callback(undefined, mdate);
  }

  _type(path, ctx, callback) {
    var rpath = path.toString();
    this.rres.resolveResource(rpath, function(res) {
      if (res) {
        if (res.isContentResource()) {
          callback(undefined, webdav.ResourceType.File);
        }
        else {
          callback(undefined, webdav.ResourceType.Directory);
        }
      }
      else {
        callback(webdav.Errors.ResourceNotFound);
      }
    });

  }
}
