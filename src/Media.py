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

import os
import Enums
import json


class MediaObject:
    def __init__(self, path_to, media_type, meta_obj):
        self.__path = path_to
        self.__meta = meta_obj
        self.__type = media_type

    def path(self):
        return self.__path

    def meta(self):
        return self.__meta

    def type(self):
        return self.__type

    def __str__(self):
        obj = {
            "path": self.__path,
            "type": self.__type,
            "meta": self.__meta
        }
        return json.dumps(obj)


class MediaComponent:

    MEDIA_STORE = {
        "AUDIO": [],
        "VIDEO": []
    }

    def __init__(self):
        for root, subFolders, files in os.walk(Enums.Config.Paths.VIDEO):
            for f in files:
                filepath = os.path.join(root, f)
                for ext in Enums.MediaType.Extensions.VIDEO:
                    if filepath.endswith(ext):
                        filepath = Enums.Config.Server.LAN_WEB_ADDR_PREFIX + filepath
                        self.MEDIA_STORE["VIDEO"].append(MediaObject(filepath, Enums.MediaType.VIDEO, self.generate_meta(filepath)))
        for root, subFolders, files in os.walk(Enums.Config.Paths.AUDIO):
            for f in files:
                filepath = os.path.join(root, f)
                for ext in Enums.MediaType.Extensions.AUDIO:
                    if filepath.endswith(ext):
                        filepath = Enums.Config.Server.LAN_WEB_ADDR_PREFIX + filepath
                        self.MEDIA_STORE["AUDIO"].append(MediaObject(filepath, Enums.MediaType.AUDIO, self.generate_meta(filepath)))

    def generate_meta(self, file_path):
        filename = os.path.basename(file_path)
        i = filename.index(".")
        filename = filename[0:i]
        meta_obj = {
            "file_name": filename,
            "thumbnail": None,
            "length": None
        }
        return meta_obj  # TODO: eventually I want this to grab a thumbnail, base64 encode it and other meta info
                         # It should get media length, media type, an icon or thumbnail base64 encoded and other stuff.

    def get_video_objects(self):
        return self.MEDIA_STORE["VIDEO"]

    def get_video_objects_json(self):
        obj = self.get_video_objects()
        objs = [str(o) for o in obj]
        return objs

