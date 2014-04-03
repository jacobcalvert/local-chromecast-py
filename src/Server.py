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
        print message
        msg = json.loads(message)
        if msg["req_type"] == "get_videos":
            resp = {
                "resp_to": "get_videos",
                "resp": media_comp.get_video_objects_json()
            }
            self.write_message(json.dumps(resp))

    def on_close(self):
        self.CONNECTIONS.remove(self)


def main():
    global media_comp
    media_comp = Media.MediaComponent()
    print media_comp.get_video_objects_json()
    app = tornado.web.Application([
        (r"/ws", WSCommChannel),
        (r"/media/video/(.*)", tornado.web.StaticFileHandler, {'path': Enums.Config.Paths.VIDEO}),
        (r"/media/audio/(.*)", tornado.web.StaticFileHandler, {'path': Enums.Config.Paths.AUDIO}),
        (r"/(.*)", tornado.web.StaticFileHandler, {'path': Enums.Config.Paths.HTML}),
    ])
    app.listen(Enums.Config.Server.PORT)
    tornado.ioloop.IOLoop.instance().start()

main()