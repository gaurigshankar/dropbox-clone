/**
 * Created by gshanka on 8/30/15.
 */

'use strict';

var path = require('path');
var mime = require('mime-types');
var nodeify = require('bluebird-nodeify');
var fs = require('fs');

require('songbird');

function isDirectory(filepath) {

    var endsWithSlash = filepath.charAt(filepath.length - 1) === path.separator;
    var hasExt = path.extname(filepath) !== '';

    return endsWithSlash || !hasExt;
}

function getTCPClientPayload(action, filePath, type) {
    var payload = {
        "action": action,
        "path": filePath,
        "type": type,
        "updated": new Date().getTime()

    };
    return payload;
}

module.exports = { isDirectory: isDirectory, getTCPClientPayload: getTCPClientPayload };

//# sourceMappingURL=VFSOperations-compiled.js.map