/**
 * Created by gshanka on 8/27/15.
 */
let express = require('express')
let morgan = require('morgan')
let path = require('path')
let fs = require('fs')
let nodeify = require('bluebird-nodeify')
let mime = require('mime-types')
let rimraf = require('rimraf')
let mkdirp = require('mkdirp')
let argv = require('yargs').argv
let nssocket = require('nssocket')
let chokidar = require('chokidar')
let {isDirectory,getTCPClientPayload} = require('./VFSOperations')
let tar = require("tar")
let fstream = require("fstream")



require('songbird')

const NODE_ENV = process.env.NODE_ENV
const PORT = process.env.PORT || 8777
const ROOT_DIR = argv.dir || path.resolve(process.cwd())

console.log(ROOT_DIR)
let app = express()

if(NODE_ENV === 'dev'){
    app.use(morgan('dev'))
}

app.listen(PORT, () =>
    console.log(`HTTP SERVER LISTNENING @${PORT}`)
)

app.get('/dropbox-clone.tar',(req,res,next) => {
    let tarFileLocationInServer = path.join(ROOT_DIR,'../../',req.url)
    console.log("Request for Tar file Recieved ::: "+tarFileLocationInServer)
    res.download(tarFileLocationInServer)
})

app.get('*' , setFileMeta , sendHeaders ,(req,res) => {
    console.log("wild get ::: "+req.url)
    if(res.body){
        res.json(res.body)
        return
    }

    fs.createReadStream(req.filepath).pipe(res)
})

app.head('*', setFileMeta, sendHeaders, (req,res) => {
    res.end()
})


app.delete('*',setFileMeta ,(req,res,next) => {
    async () =>{
        if(!req.stat)
            return res.send(400,'Invalid Path')
        if(req.stat && req.stat.isDirectory()){
            await rimraf.promise(req.filepath)
        } else{
            await fs.promise.unlink(req.filepath)
        }

        if(tcpSocket){
            let type =  req.stat && req.stat.isDirectory() ? 'dir': 'file'
            console.log("File type in express delte  "+type)
            let payload = getTCPClientPayload("delete",req.url,type)
            tcpSocket.send('delete', payload);
        }
        res.end()
    }().catch(next)
})

app.put('*', setFileMeta, setDirDetails, (req,res,next) => {

    async () =>{
        if(req.stat) return res.send(405, 'File Exists')
        await mkdirp.promise(req.dirPath)
        if(!req.isDir){
            req.pipe(fs.createWriteStream(req.filepath))
        }

        if(tcpSocket){
            let type =  req.isDir ? 'dir': 'file'
            let payload = getTCPClientPayload("create",req.url,type)


            tcpSocket.send('create', payload);
        }
        res.end()

    }().catch(next)
})

app.post('*', setFileMeta, setDirDetails, (req,res,next) => {

    async () =>{

        if(!req.stat) return res.send(405, 'File Does not Exists')
        if(req.isDir) return res.send(405, 'Path is a Directory')


        await fs.promise.truncate(req.filepath, 0)
        req.pipe(fs.createWriteStream(req.filepath))
        if(tcpSocket){
            let type =  req.isDir ? 'dir': 'file'
            let payload = getTCPClientPayload("update",req.url,type)
            tcpSocket.send('update', payload);
        }
        res.end()

    }().catch(next)
})



function sendHeaders(req,res,next) {
    nodeify(async () => {
        let filepath = req.filepath


        if(req.stat && req.stat.isDirectory()){
            let files = await fs.promise.readdir(req.filepath)
            res.body = JSON.stringify(files)
            res.setHeader('Content-Length',res.body.length)
            res.setHeader('Content-Type','application/json')
            return
        }

        res.setHeader('Content-Length',req.stat ? req.stat.size:0)
        let contentType = mime.contentType(path.extname(req.filepath))
        res.setHeader('Content-Type',contentType)

    }(),next)
}

function setDirDetails(req,res,next){

    req.isDir = isDirectory(req.filepath)
    req.dirPath = req.isDir ? req.filepath : path.dirname(req.filepath)
    next()
}

function setFileMeta(req,res,next) {

    let filepath = path.resolve(path.join(ROOT_DIR,req.url))
    req.filepath = filepath
    if(filepath.indexOf(ROOT_DIR) !== 0){
        res.send(400,'Invalid Path')
        return
    }
    fs.promise.stat(filepath)
        .then(stat => req.stat = stat, ()=> req.stat = null)
        .nodeify(next)


}


let  tcpport = 9838;
let tcpSocket;
let server = nssocket.createServer(function (socket){
    tcpSocket = socket;
    let tarFileDest =path.join(ROOT_DIR,'..','/dropbox-clone.tar')
    console.log("tarFileName ::: "+tarFileDest)

    let packer = tar.Pack({ noProprietary: true })
        .on('error', onError)


// This must be a "directory"
    fstream.Reader({ path: ROOT_DIR, type: "Directory" })
        .on('error',onError)
        .pipe(packer)
        .pipe( fs.createWriteStream(tarFileDest))

   //tar.pack(ROOT_DIR).pipe(fs.createWriteStream(tarFileName))
    let payload = getTCPClientPayload("create",'/dropbox-clone.tar','file')
   // fs.createReadStream(tarFileName).pipe(tar.extract(path.join(ROOT_DIR,'//my-other-directory')))
    socket.send('originalFileSystem',payload)
}).listen(tcpport);

function onError(err) {
    console.error('An error occurred:', err)
}




   // .unwatch(ROOT_DIR+'/submissionGifs/')


