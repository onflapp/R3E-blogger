import * as DAV from './adapters/server/DAVFileSystemResource'

if (typeof module !== 'undefined') {
  module.exports = {
    DAVSerializer: DAV.DAVSerializer,
    DAVFileSystemResource: DAV.DAVFileSystemResource
  };
}
