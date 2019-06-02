"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DAV = require("./adapters/server/DAVFileSystemResource");
if (typeof module !== 'undefined') {
    module.exports = {
        DAVSerializer: DAV.DAVSerializer,
        DAVFileSystemResource: DAV.DAVFileSystemResource
    };
}
