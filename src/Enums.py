##################################################
#
#
#
#
#
#
#
#
#
#
##################################################

class Config:
    class Paths:
        AUDIO = "media/audio"
        VIDEO = "media/video"
        HTML = "html"
        HTML_INDEX = "html/index.html"

    class Server:
        PORT = 8022
        LAN_IP = "localhost"  # TODO: make this an autconfig thing, we can prob look it up at runtime
        LAN_WEB_ADDR_PREFIX = "http://"+LAN_IP + ":" + str(PORT) + "/"


class MediaType:
    class Extensions:
        AUDIO = ["mp3", "ogg", "wav"]
        VIDEO = ["mp4", "mkv", "m4v", "avi"]
    AUDIO = "AUDIO"
    VIDEO = "VIDEO"
    UNKNOWN = "UNKNOWN"
