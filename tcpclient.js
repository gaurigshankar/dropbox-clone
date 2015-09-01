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




const ROOT_DIR = argv.dir || path.resolve(process.cwd())
console.log("ROOT DIR for Client :: "  +ROOT_DIR)

let options = {
    url: 'https://127.0.0.1:8777/',
    headers: {'Accept': 'application/x-gtar'}
}

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
    console.log("****************************************")

    handlePayload(payload).catch(e => console.log);
    console.log((payload))
})
tcpClient.data('delete', (payload) => {
    handlePayload(payload).catch(e => console.log);
    console.log((payload))
})
tcpClient.data('originalFileSystem', (payload) => {
    console.log('originalFileSystem ::: '+JSON.stringify(payload) )
    let filePath = path.resolve(path.join(ROOT_DIR,payload.path))
    console.log("filePath :: "+filePath)

    downloadAndUntar(payload)
})

async function downloadAndUntar(payload){
    let filePath = path.resolve(path.join(ROOT_DIR,payload.path))
    let data = await getFileContentAndWriteToFile(payload.path,filePath)
    console.log("done with download")
    let tarExtractLocation = path.join(ROOT_DIR,"/extract")
    let tarLocation = path.join(ROOT_DIR,"/dropbox-clone-original.tar")
    console.log(" tarExtractLocation in client ::"+tarExtractLocation)
    console.log("tarfileLocation   ::: "+tarLocation)
     let fstream = await fs.createReadStream(tarLocation);

    fstream.on('error', console.log)
    .pipe(tar.Extract({path: 'out',type:"Directory"}));

    console.log("***********************************************")
    //let extractor = tar.Extract({path: tarExtractLocation,strip: 0})
    console.log("***********************************************")

    console.log("tarLocation  "+tarLocation)

    // Optionally, wrap stream logic in a Promise to resolve on stream completion
    return await Promise((resolve, reject) => {
        fs.createReadStream(tarLocation)
            .on('error', reject)
            .pipe(extractor).on('end', resolve)
    })

    //fs.createReadStream(tarLocation)
    //    .on('error', onError)
    //    .pipe(extractor)




}

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

//async function getFileContentAndWriteToFile(url,localfilepath){
//
//    httpoptions.path = url
//    console.log("Get file content Called here  : "+JSON.stringify(httpoptions))
//    await http.promise.get(httpoptions,function(response){
//        response.on('data',function(data){
//            console.log("##############################")
//            fs.writeFile(localfilepath,data,function(err){
//                console.log(err)
//            })
//
//        });
//
//    })
//
//}

async function getFileContentAndWriteToFile(url,localfilepath){
    console.log(" in get tcall")
    let fullUrl = "http://127.0.0.1:8777"+url
    // Use the request-promise[1] package instead of http.get
    let response = await request({url: fullUrl, resolveWithFullResponse: true})
    // Use pn/fs instead of songbird's .promise.
    await fs.writeFile(localfilepath,response.body)
    console.log("Done writeing about to return with ")
    return response.body
}



let watcher = chokidar.watch(ROOT_DIR,
    {
        ignored: /[\/\\]\./,
        ignoreInitial: true,
        persistent: true,
        usePolling: true,
        interval: 100,
        atomic: true
    })
    .unwatch(ROOT_DIR+'/submissionGifs/')
    .unwatch('submissionGifs*')
    .on('addDir', (event, path) => {
        let payload = getTCPClientPayload("write",event,"dir")
        if(tcpSocket){
             tcpSocket.send('addDir', payload);
        }

    })
    .on('add', (event, path) => {
        let payload = getTCPClientPayload("write",event,"file")
        if(tcpSocket){
             tcpSocket.send('addFile',payload);
        }

    })
    .on('change', (event, path) => {
        let payload = getTCPClientPayload("write",event,"file")
        if(tcpSocket){
            tcpSocket.send('changeFile',payload);
        }
    })
    .on('unlink', (event, path) => {
        let payload = getTCPClientPayload("delete",event,"file")
        if(tcpSocket){
             tcpSocket.send('deleteFile',payload);
        }
    })
    .on('unlinkDir', (event, path) => {
        let payload = getTCPClientPayload("delete",event,"dir")
        if(tcpSocket){
             tcpSocket.send('deleteDir',payload);
        }
    })