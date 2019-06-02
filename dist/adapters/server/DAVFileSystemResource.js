"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var webdav_server_1 = require("webdav-server");
var Readable = require('stream').Readable;
var Writable = require('stream').Writable;
var DAVSerializer = (function () {
    function DAVSerializer() {
    }
    DAVSerializer.prototype.uid = function () {
        return 'R3E-Res-FSSerializer-1.0.0';
    };
    DAVSerializer.prototype.serialize = function (fs, callback) {
        callback(null);
    };
    DAVSerializer.prototype.unserialize = function (serializedData, callback) {
        callback(null);
    };
    return DAVSerializer;
}());
exports.DAVSerializer = DAVSerializer;
var DAVFileSystemResource = (function (_super) {
    __extends(DAVFileSystemResource, _super);
    function DAVFileSystemResource(rres) {
        var _this = _super.call(this, new DAVSerializer()) || this;
        _this.rres = rres;
        return _this;
    }
    DAVFileSystemResource.prototype._move = function (pathFrom, pathTo, ctx, callback) {
        var paths = pathTo.paths;
        paths.shift();
        var path = '/' + paths.join('/');
        this.rres.moveResource(pathFrom.toString(), path, function () {
            callback(undefined, true);
        });
    };
    DAVFileSystemResource.prototype._create = function (path, ctx, callback) {
        if (ctx.type.isFile) {
            callback();
        }
        else {
            this.rres.storeResource(path.toString(), {}, function () {
                callback();
            });
        }
    };
    DAVFileSystemResource.prototype._delete = function (path, ctx, callback) {
        this.rres.removeResource(path.toString(), function () {
            callback();
        });
    };
    DAVFileSystemResource.prototype._openWriteStream = function (pathTo, ctx, callback) {
        var vv = pathTo.toString();
        var self = this;
        var write_to_stream = function (writer, cb) {
            var buffer = new Writable();
            buffer._write = function (chunk, encoding, done) {
                console.log('=W:' + vv);
                writer.write(chunk);
                done();
            };
            buffer._final = function (cb) {
                console.log('-W:' + vv);
                writer.end(cb);
            };
            writer.start();
            console.log('+W:' + vv);
            callback(null, buffer);
        };
        console.log('RR:' + vv);
        this.rres.resolveResource(pathTo.toString(), function (res) {
            if (res) {
                res.importContent(write_to_stream, function () {
                });
            }
            else {
                var paths = pathTo.paths;
                var name = paths.pop();
                var rpath = '/' + paths.join('/');
                self.rres.resolveResource(rpath, function (res) {
                    if (res) {
                        res.resolveOrAllocateChildResource(name, function (res) {
                            res.importContent(write_to_stream, function () {
                            });
                        });
                    }
                    else {
                        callback(webdav_server_1.v2.Errors.ResourceNotFound);
                    }
                });
            }
        });
    };
    DAVFileSystemResource.prototype._openReadStream = function (path, ctx, callback) {
        var vv = path.toString();
        console.log('+R:' + vv);
        var rpath = path.toString();
        this.rres.resolveResource(rpath, function (res) {
            if (res && res.isContentResource()) {
                var buffer = new Readable();
                res.read({
                    start: function () {
                        callback(undefined, buffer);
                    },
                    write: function (data) {
                        console.log('=R:' + vv);
                        buffer.push(data);
                    },
                    end: function (cb) {
                        buffer.push(null);
                        if (cb)
                            cb();
                        console.log('-R:' + vv);
                    }
                });
            }
            else {
                callback(webdav_server_1.v2.Errors.ResourceNotFound);
            }
        });
    };
    DAVFileSystemResource.prototype._size = function (path, ctx, callback) {
        var rpath = path.toString();
        this.rres.resolveResource(rpath, function (res) {
            if (res) {
                var size = res.getContentSize();
                callback(undefined, size);
            }
            else {
                callback(webdav_server_1.v2.Errors.ResourceNotFound);
            }
        });
    };
    DAVFileSystemResource.prototype._lockManager = function (path, ctx, callback) {
        var locks = new webdav_server_1.v2.LocalLockManager();
        callback(undefined, locks);
    };
    DAVFileSystemResource.prototype._propertyManager = function (path, ctx, callback) {
        var props = new webdav_server_1.v2.LocalPropertyManager({});
        callback(undefined, props);
    };
    DAVFileSystemResource.prototype._readDir = function (path, ctx, callback) {
        var rpath = path.toString();
        this.rres.resolveResource(rpath, function (res) {
            if (res) {
                res.listChildrenNames(function (ls) {
                    callback(undefined, ls);
                });
            }
            else {
                callback(webdav_server_1.v2.Errors.ResourceNotFound);
            }
        });
    };
    DAVFileSystemResource.prototype._creationDate = function (path, ctx, callback) {
        this._lastModifiedDate(path, ctx, callback);
    };
    DAVFileSystemResource.prototype._lastModifiedDate = function (path, ctx, callback) {
        var mdate = null;
        callback(undefined, mdate);
    };
    DAVFileSystemResource.prototype._type = function (path, ctx, callback) {
        var rpath = path.toString();
        this.rres.resolveResource(rpath, function (res) {
            if (res) {
                if (res.isContentResource()) {
                    callback(undefined, webdav_server_1.v2.ResourceType.File);
                }
                else {
                    callback(undefined, webdav_server_1.v2.ResourceType.Directory);
                }
            }
            else {
                callback(webdav_server_1.v2.Errors.ResourceNotFound);
            }
        });
    };
    return DAVFileSystemResource;
}(webdav_server_1.v2.FileSystem));
exports.DAVFileSystemResource = DAVFileSystemResource;
