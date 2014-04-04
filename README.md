local-chromecast-py
==================================
This project was inspired by my desire to stream local media from my laptop to my ChromeCast. Since I found no prebuilt software I began to search elsewhere.
I landed on https://github.com/abid-mujtaba/local-chromecast. I forked it, used it, looked at the code and thought, I can make that too!

Proposed Features
==================================

Some of these are already partially supported. By that I mean you can stream that media flawlessly once the handshake is done, but you may to
finagle it a bit at first. I'll mark the partial support with a (*)

* MP4, M4V video streaming (*)
* MKV streaming
* AVI streaming
* MP3 streaming (*)
* OGG streaming
* Other audio formats
* Other Video Formats


Images work, but I have no hook into the python server for it, yet.


How does it work ?
===================================

I'm using Tornado/py framework to server up static and dynamic content. The communication channel is via WebSockets, the
files are served through regular requests. The script will search through 'media/audio', 'media/video', folders and pick up those types.
The javascript portion basically handles the talk between the Cast API and the server.


How to Use it?
====================================

* install Tornado -> http://www.tornadoweb.org/en/stable/
* run 'python Server.py'
* open browser to http://localhost:8022/index.html, your media (if you have any) will be loaded
* start a chromecast session from the google cast extension
* select your media, your chromecast will look like it's loading something
* click play!