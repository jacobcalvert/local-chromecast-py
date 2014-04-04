##################################################
# File:         Enums.py
# Author:       Jacob Calvert
# Externals:    None
# Project:      local-chromecast-py
##################################################
import socket

class Config:
    class Paths:
        AUDIO = "media/audio"
        VIDEO = "media/video"
        IMAGE = "media/image"
        HTML = "html"
        HTML_INDEX = "html/index.html"

    class Server:
        PORT = 8022
        LAN_IP = None  # TODO: make this an autconfig thing, we can prob look it up at runtime
        LAN_WEB_ADDR_PREFIX = None


class MediaType:
    class Extensions:
        AUDIO = ["mp3", "ogg", "wav"]
        VIDEO = ["mp4", "mkv", "m4v", "avi"]

    AUDIO = "AUDIO"
    VIDEO = "VIDEO"
    UNKNOWN = "UNKNOWN"
    DEFAULT_ICONS = {
        AUDIO: "img/audio.png",
        VIDEO: "img/video.png"
    }
if Config.Server.LAN_IP is None:
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    s.connect(("google.com", 0))
    Config.Server.LAN_IP = str(s.getsockname()[0])
    Config.Server.LAN_WEB_ADDR_PREFIX = "http://"+Config.Server.LAN_IP + ":" + str(Config.Server.PORT) + "/"