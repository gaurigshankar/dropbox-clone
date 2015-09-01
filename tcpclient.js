/**
 * Created by gshanka on 8/29/15.
 */
let nssocket = require('nssocket')
let path = require('path')
let request = require('request-promise')
let argv = require('yargs').argv
let mkdirp = require('mkdirp')
let {isDirectory,getTCPClientPayload} = require('./VFSOperations')
let http = require ('http')
let fs = require ('pn/fs')
let rimraf = require('rimraf')
let nodeify = require('bluebird-nodeify')
let tarStream = require('tar-stream')
let chokidar = require('chokidar')
let tar = require('tar')



const ROOT_DIR = argv.dir || path.resolve(process.cwd())
console.log("ROOT DIR for Client :: "  +ROOT_DIR)

let HTTP_SERVER = 'http://127.0.0.1:8777'


var httpoptions = {
    host: 'localhost',
    port: 8777

};
//request(options, 'http://127.0.0.1:8000/').pipe(tarExtractStream)


let port = 9838; //The same port that the server is listening on
let host = '127.0.0.1';
let tcpClient = new nssocket.NsSocket({
    reconnect: true
}); //Decorate a standard net.Socket with JsonSocket
tcpClient.connect(port, host,function(data){
    console.log("connected to tcp server" )
});


tcpClient.data('create', (payload) => {

    handlePayload(payload).catch(e => console.log);
    console.log((payload))
})
tcpClient.data('update', (payload) => {
    handlePayload(payload).catch(e => console.log);
    console.log((payload))
})
tcpClient.data('delete', (payload) => {
    handlePayload(payload).catch(e => console.log);
    console.log((payload))
})
tcpClient.data('originalFileSystem', (payload) => {
     let options = {
        url:HTTP_SERVER,
        uri:HTTP_SERVER+payload.path,
        headers: {'Accept': 'application/x-gtar'}
    }
    let extract = tar.Extract({path: ROOT_DIR})
    request(options, HTTP_SERVER+payload.path).pipe(extract)
})



async function handlePayload(payload){

        let filePath = path.resolve(path.join(ROOT_DIR,payload.path))
        console.log("filePath  :: "+filePath)
        if(payload.action === 'create'){
            let dirPath = isDirectory(filePath) ? filePath : path.dirname(filePath)
            console.log(" creating dir path :: "+dirPath)
            await mkdirp.promise(dirPath)

        }
        else if(payload.action === 'update'){
            await fs.promise.truncate(filePath, 0)
        }
        else if(payload.action === 'delete'){
            console.log("Delete "+filePath)
            if(payload.type === 'dir'){
                await rimraf.promise(filePath)
            } else{
                await fs.promise.unlink(filePath)
            }
        }

        if(payload.type === 'file'){
                await getFileContentAndWriteToFile(payload.path,filePath)
        }

}

async function getFileContentAndWriteToFile(url,localfilepath){

    httpoptions.path = url
    await http.promise.get(httpoptions,function(response){
        response.on('data',function(data){
            fs.writeFile(localfilepath,data,function(err){
                console.log(err)
            })

        });

    })

}





