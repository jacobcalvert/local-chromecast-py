##################################################
# File:         Server.py
# Author:       Jacob Calvert
# Externals:    tornado
# Project:      local-chromecast-py
##################################################
import tornado.web
import tornado.websocket
import Enums
import Media
import json


media_comp = None


class WSCommChannel(tornado.websocket.WebSocketHandler):

    CONNECTIONS = []

    def open(self):
        self.CONNECTIONS.append(self)

    def on_message(self, message):
        req = json.loads(message)
        if req["req_type"] == "load_library":
            obj = {
                "reply_type": "load_library",
                "video": media_comp.get_video_objects(),
                "audio": media_comp.get_audio_objects(),
                "image": []
            }
            print obj
            self.write_message(json.dumps(obj))

    def on_close(self):
        self.CONNECTIONS.remove(self)


def main():
    global media_comp
    media_comp = Media.MediaComponent()
    app = tornado.web.Application([
        (r"/ws", WSCommChannel),
        (r"/media/video/(.*)", tornado.web.StaticFileHandler, {'path': Enums.Config.Paths.VIDEO}),
        (r"/media/audio/(.*)", tornado.web.StaticFileHandler, {'path': Enums.Config.Paths.AUDIO}),
        (r"/media/image/(.*)", tornado.web.StaticFileHandler, {'path': Enums.Config.Paths.IMAGE}),
        (r"/(.*)", tornado.web.StaticFileHandler, {'path': Enums.Config.Paths.HTML}),
    ])
    app.listen(Enums.Config.Server.PORT)
    tornado.ioloop.IOLoop.instance().start()

main()