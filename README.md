# dropbox-clone

# Starting your server

From the root directory of your project you can run one of the three commands to start the server

- using start script: `npm start`
- To get list of files and directories, run

```
	curl -v http://127.0.0.1:8000/ -X GET
```

- To read the index.js file, run

```
	curl -v http://127.0.0.1:8000/index.js -X GET
```
![](https://raw.githubusercontent.com/gaurigshankar/dropbox-clone/master/dropbox-submissiongifs/GET-cwd.gif)

![](https://raw.githubusercontent.com/gaurigshankar/dropbox-clone/master/dropbox-submissiongifs/head-cwd.gif)
![](https://raw.githubusercontent.com/gaurigshankar/dropbox-clone/master/dropbox-submissiongifs/POST-cwd.gif)
![](https://raw.githubusercontent.com/gaurigshankar/dropbox-clone/master/dropbox-submissiongifs/PUT-cwd.gif)
![](https://raw.githubusercontent.com/gaurigshankar/dropbox-clone/master/dropbox-submissiongifs/DELETE-cwd.gif)
