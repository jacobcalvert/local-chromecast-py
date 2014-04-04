##################################################
# File:         Media.py
# Author:       Jacob Calvert
# Externals:    None
# Project:      local-chromecast-py
##################################################

import os
import Enums
import json
import mimetypes
import uuid


class MediaObject:
    def __init__(self, path_to, media_type, content_type, meta_obj):
        self.__path = path_to
        self.__meta = meta_obj
        self.__type = media_type
        self.__content_type = content_type
        self.__id = str(uuid.uuid4())

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
            "meta": self.__meta,
            "id":   self.__id

        }
        return json.dumps(obj)

    def to_dict(self):
        obj = {
            "url": self.__path,
            "type": self.__type,
            "meta": self.__meta,
            "content_type": self.__content_type,
            "title": self.__meta["file_name"],
            "id":   self.__id
        }
        return obj


class MediaComponent:

    MEDIA_STORE = {
        "AUDIO": [],
        "VIDEO": []
    }
    mimetypes.init()

    def __init__(self):
        for root, subFolders, files in os.walk(Enums.Config.Paths.VIDEO):
            for f in files:
                filepath = os.path.join(root, f)
                for ext in Enums.MediaType.Extensions.VIDEO:
                    if filepath.endswith(ext):
                        filepath = Enums.Config.Server.LAN_WEB_ADDR_PREFIX + filepath
                        t = Enums.MediaType.VIDEO
                        mime = mimetypes.guess_type(filepath)
                        mo = MediaObject(filepath, Enums.MediaType.VIDEO, mime[0], self.generate_meta(filepath, t))
                        self.MEDIA_STORE["VIDEO"].append(mo)
        for root, subFolders, files in os.walk(Enums.Config.Paths.AUDIO):
            for f in files:
                filepath = os.path.join(root, f)
                for ext in Enums.MediaType.Extensions.AUDIO:
                    if filepath.endswith(ext):
                        filepath = Enums.Config.Server.LAN_WEB_ADDR_PREFIX + filepath
                        mime = mimetypes.guess_type(filepath)
                        t = Enums.MediaType.AUDIO
                        mo = MediaObject(filepath, Enums.MediaType.AUDIO, mime[0], self.generate_meta(filepath, t))
                        self.MEDIA_STORE["AUDIO"].append(mo)



    def generate_meta(self, file_path, type):
        filename = os.path.basename(file_path)
        i = filename.index(".")
        filename = filename[0:i]
        meta_obj = {
            "file_name": filename,
            "thumbnail": Enums.MediaType.DEFAULT_ICONS[type],
            "length": None
        }
        return meta_obj  # TODO: eventually I want this to grab a thumbnail, base64 encode it and other meta info
                         # It should get media length, media type, an icon or thumbnail base64 encoded and other stuff.

    def get_video_objects(self):
        obj = self.MEDIA_STORE["VIDEO"]
        objs = [o.to_dict() for o in obj]
        return objs

    def get_audio_objects(self):
        obj = self.MEDIA_STORE["AUDIO"]
        objs = [o.to_dict() for o in obj]
        return objs

