# dropbox-clone

# Starting your server

From the root directory of your project you can start the server

- using start script: `npm start`
## GET Request

- To get list of files and directories, run

```
	curl -v http://127.0.0.1:8000/ -X GET
```

- To read the index.js file, run

```
	curl -v http://127.0.0.1:8000/index.js -X GET
```
![](https://raw.githubusercontent.com/gaurigshankar/dropbox-clone/master/dropbox-submissiongifs/GET-cwd.gif)
## HEAD Request

- To get list of files and directories, run

```
	curl -v http://127.0.0.1:8000/ --head
```



![](https://raw.githubusercontent.com/gaurigshankar/dropbox-clone/master/dropbox-submissiongifs/head-cwd.gif)


## PUT Request

- To get list of files and directories, run

```
	curl -v http://127.0.0.1:8000/foo/bar -X PUT
```

- To read the index.js file, run

```
	curl -v http://127.0.0.1:8000/foo/bar.js -X PUT
```
![](https://raw.githubusercontent.com/gaurigshankar/dropbox-clone/master/dropbox-submissiongifs/PUT-cwd.gif)

## POST Request

- To get list of files and directories, run

```
	curl -v http://127.0.0.1:8000/foo/bar.js -X POST -d "new content"
```


![](https://raw.githubusercontent.com/gaurigshankar/dropbox-clone/master/dropbox-submissiongifs/POST-cwd.gif)


## DELETE Request

- To get list of files and directories, run

```
	curl -v http://127.0.0.1:8000/foo/bar.js -X DELETE
```

- To read the index.js file, run

```
	curl -v http://127.0.0.1:8000/foo/ -X DELETE
```
![](https://raw.githubusercontent.com/gaurigshankar/dropbox-clone/master/dropbox-submissiongifs/DELETE-cwd.gif)
