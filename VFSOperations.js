/**
 * Created by gshanka on 8/30/15.
 */

let path = require('path')
let mime = require('mime-types')
let nodeify = require('bluebird-nodeify')
let fs = require('fs')

require('songbird')

function isDirectory(filepath){


    let endsWithSlash = filepath.charAt(filepath.length -1) === path.separator
    let hasExt = path.extname(filepath) !== ''

    return endsWithSlash || !hasExt
}

function getTCPClientPayload(action, filePath,type){
    let payload = {
        "action":action,
        "path" : filePath,
        "type" : type,
        "updated" : new Date().getTime()

    }
    return payload
}

module.exports = {isDirectory,getTCPClientPayload}
