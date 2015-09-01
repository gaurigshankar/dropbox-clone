/**
 * Created by gshanka on 8/29/15.
 */
let chokidar = require('chokidar')

let responseObject = {
    "action": "write",                          // or "delete"
    "path": "/path/to/file/from/root",
    "type": "dir",                               // or "file"
    "updated": 1427851834642                    // time of creation/deletion/update
}

const ROOT_DIR = "/users/gshanka/Documents/canBeDeleted/codepath"
/*let watcher = chokidar.watch(ROOT_DIR,
    {
        ignored: /[\/\\]\./,
        persistent: true,
        usePolling: true,
        interval: 10,
        atomic: true
    })

    .on('adddir', (event, path) => {
        console.log(event, path)
        responseObject.action = "write"
        responseObject.path = path
        console.log("New Directory Created")

    })
    .on('change', (event, path) => {
        console.log(event, path)
        responseObject.action = "change"
        responseObject.path = path

    })*/

let watcher = chokidar.watch(ROOT_DIR, {
    ignored: /^\./,
    persistent: true,
    usePolling: true,
    interval: 100,
    atomic: true
});
console.log(ROOT_DIR)
watcher
    .on('add', function(path) {console.log('File', path, 'has been added');})
    .on('addDir', function(path) {console.log('Dire', path, 'has been added');})
    .on('change', function(path) {console.log('File', path, 'has been changed');})
    .on('unlink', function(path) {console.log('File', path, 'has been removed');})
    .on('error', function(error) {console.error('Error happened', error);})
