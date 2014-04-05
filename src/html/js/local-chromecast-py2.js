/* GLOBALS / NAMESPACES
 *
 * the namespace used for this app is localcast
 * sub-namespaces will hold all the other stuffs
 * DETAILS
 * 	- logging is the logging info
 *  - media_store holds all the media objects
 *	- sessions holds all the chromecast session info
 *	- ws holds all websocket params and handlers
 *	- ui has all the ui component hanlders
 */
var localcast = {}; 
localcast.logging = {};
localcast.media_store = {};
localcast.sessions = {};
localcast.ws = {};
localcast.ui = {};

jQuery(document).ready(function()
{

/* Setup vars
 *
 * DETAILS
 *	- logging.console_only		bool for flipping logging to console only or visible.
 *	- logging.verbose			bool for the verbose mode of logging and reporting.
 *	- media_store.video			array which holds video media objects
 *	- media_store.audio			array which holds audio media objects
 *	- media_store.image			array which holds image media objects
 *	- sessions.cast_session		object of a chromecast session
 *	- sessions.media_session	object of media session (allows for resume casting)
 *	- ws.url					string of websocket connect address
 *	- ws.handle					object of WebSocket
 *	- ws.retry_connect			bool, determines if we try to reconnect at the loss of connection
 *	- ws.retry_wait_time		int how often do we retry the connection NOTE: in milliseconds
 *	- ws.retry_interval			object of the interval method to reconnect
 * 	- ui.on_click_callback		the callback to initialize the loadMedia for casting
 *	- ui.play_media_callback	the callback for starting the media that was loaded.
 *	- ui.on_media_store_change 	called when the library is refreshed.
 */
 
localcast.logging.console_only = true;
localcast.logging.verbose = false;

localcast.media_store.video = [];
localcast.media_store.audio = [];
localcast.media_store.image = [];

localcast.sessions.cast_session = null;
localcast.sessions.media_session = null;

localcast.ws.url = null;
localcast.ws.handle = null;
localcast.ws.retry_connect = true;
localcast.ws.retry_wait_time = 3000; //ms
localcast.ws.retry_interval = null;

localcast.ui.on_click_callback = UIMediaItemClicked;
localcast.ui.play_media_callback = CastMediaPlay;
localcast.ui.stop_media_callback = CastMediaStop;
localcast.ui.on_media_store_change = null;
localcast.ui.on_volume_change_callback = CastSetVolume;

/*
 * WebSocket methods
 * DETAILS
 *	- methods starting with WS* are websocket event handlers (i.e WSClose handles the onclose event);
 *	- getters and setters are named as such (i.e getWebsocket())
 */

function init_ws()
{
	full_url = document.URL;
	i = full_url.indexOf("/") + 2;
	j = full_url.indexOf("index.html") - 8;
	url = full_url.substr(i,j);
	localcast.ws.url = "ws://"+url+"/ws";
	localcast.ws.handle = new WebSocket(localcast.ws.url);
	localcast.ws.handle.onopen = WSOpen;

};
function WSOpen(event)
{
	/*
	 * Setup handlers for the websocket
	 */
	 log("Websocket opened.", event);
	 if(localcast.ws.handle.readyState === 1) // 1->OPEN
	 {
	 	localcast.ws.handle.onclose = WSClose;
	 	localcast.ws.handle.onmessage = WSMsg;
	 	localcast.ws.handle.onerror = WSError;
	 	
	 	if(localcast.ws.retry_interval)
	 	{
	 		clearInterval(localcast.ws.retry_interval);
	 	}
	 }
	 requestLibrary();
};
function WSMsg(event)
{
	/*
	 * Eventually pass the msg to a parser for eval and action
	 */
	 parseRaw(event.data);

};
function WSClose(event)
{
	/*
	 * Setup retry connect
	 */
	 if (localcast.ws.retry_connect && getWebsocket().readyState > 1) //2 -> Closing , 3 -> Closed
	 {
	 	log("Websocket lost connection, retrying...");
		localcast.ws.retry_interval = setInterval(init_ws, localcast.ws.retry_wait_time);
	 }
};
function WSError(event)
{
	log("The Websocket encountered an error.",event);
};
function getWebsocket()
{
	return localcast.ws.handle;
};
function requestLibrary()
{
	obj = {};
	obj.req_type = "load_library";
	getWebsocket().send(JSON.stringify(obj));
	
};

/*
 * Chromecast methods (this is where the magic happens)
 * DETAILS
 *	- handlers are denoted with a Cast* prefix
 *	- setters and getters are named as such
 */
function init_cast()
{
	if (!chrome.cast || !chrome.cast.isAvailable)
	{
	  setTimeout(init_cast, 1000); // we are blocking until we can initialize.
	}
	else
	{
		applicationID = chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID;
		sessionRequest = new chrome.cast.SessionRequest(applicationID);
		apiConfig = new chrome.cast.ApiConfig(sessionRequest,CastSessionListener,CastReceiverListener);
		chrome.cast.initialize(apiConfig, CastInitSuccess, CastError);
	}
};
function CastInitSuccess(event)
{
	log("Cast API initialized successfully.", event);

};
function CastError(event)
{
	log("Cast API encountered and error. ", event);

};
function CastSessionListener(session)
{
	log("Session ID - " + session.sessionId, session);
	if(session.media.length)
	{
		log("Found " + session.media.length + " media sessions.");
		CastMediaDiscovered('CastSessionListener',session.media[0]);
	}
	localcast.sessions.cast_session  = session;
	localcast.sessions.cast_session.addUpdateListener(CastSessionUpdateListener.bind(this));
	localcast.sessions.cast_session.addMediaListener(CastMediaDiscovered.bind(this,"CastSessionListener"));
	
};
function CastReceiverListener(event)
{
	log_str = "";
	if (event === chrome.cast.ReceiverAvailability.AVAILABLE)
	{
		log_str = "Found receiver(s)";
	}
	else
	{
		log_str = "No receiver";
	}
	log(log_str);
};
function CastRequestSessionSuccess(event)
{
	log("Session established - " +event.sessionId, event);
	localcast.sessions.cast_session = event;
};
function CastSessionUpdateListener(event)
{
	// event -> true or false = isAlive
	sid = localcast.sessions.cast_session.sessionId;
	f = "Session '" + sid + "' ended.";
	t = "Session '" + sid + "' updated";
	log_str = event?t:f
	if (!event)
	{
		localcast.sessions.cast_session = null;
	};
	log(log_str);
};
function CastMediaDiscovered(how, media_session)
{
	log("Media discovered via "+ how);
	localcast.sessions.media_session = media_session;
	localcast.sessions.media_session.addUpdateListener(CastMediaUpdateListener);
};
function CastLoadMedia(media_object)
{
	log("loading " + media_object.title);
	mediaInfo = new chrome.cast.media.MediaInfo(media_object.url);
	mediaInfo.contentType = media_object.content_type;
	request = new chrome.cast.media.LoadRequest(mediaInfo);
	payload = {"payload":{"title":media_object.title}};
	request.customData = payload;
	request.autoplay = false;
	localcast.sessions.cast_session.loadMedia(request,CastMediaDiscovered.bind(this, 'CastLoadMedia'), CastMediaError);
	
};
function CastMediaUpdateListener(event)
{
	log(JSON.stringify(event));

};
function CastMediaError(event)
{
	log("media error! " + JSON.stringify(event),event);
};
function CastMediaPlay(event)
{
	localcast.sessions.media_session.play(null, CastMediaSuccessfulCommand.bind(this,"Play Event"), CastMediaError);
};
function CastMediaStop(event)
{
	localcast.sessions.media_session.stop(null, CastMediaSuccessfulCommand.bind(this,"Stop Event"), CastMediaError);
};
function CastMediaSuccessfulCommand(event)
{
	log(event);
};
function CastSetVolume(level)
{
	
  	localcast.sessions.cast_session.setReceiverVolumeLevel((level/100.00), CastMediaSuccessfulCommand.bind(this,"Volume Set Event"), CastMediaError);
};
/*
 * UI Hooks
 * DETAILS
 * 	- prefixed UI*
 */
 
 function UIMediaItemClicked(id)
 {
 	media_object = findMediaObjectWithId(id);
 	if(!media_object)
 	{
 		log("Oops, this is a crappy place to have an error. Please check id = " + id);
 	}
 	else
 	{
 		CastLoadMedia(media_object);
 	}
 };
 
 
/*
 * Parser!!! This is sorta important!
 * DETAILS
 *	- its a bunch of procedures, really 
 */
 
function parseRaw(data)
{
	json_obj = null;
	try
	{
		json_obj = JSON.parse(data);
	}
	catch(err)
	{
		log(err);
	}
	if(json_obj)
	{
		parseObject(json_obj);
	}
};
function parseObject(obj)
{
	if(obj.reply_type === "load_library")
	{
		localcast.media_store.video = obj.video;
		localcast.media_store.audio = obj.audio;
		localcast.media_store.image = obj.image;
	}
	localcast.ui.on_media_store_change(); //call
};
 
/*
 * Media Library Hooks
 * DETAILS
 * 	- no prefixes, just accessors
 */
 
 function findMediaObjectWithId(id)
 {
 	for(i = 0; i < localcast.media_store.video.length; i++)
 	{
 		if(localcast.media_store.video[i].id === id)
 		{
 			return localcast.media_store.video[i];
 		}
 	};
 	for(i = 0; i < localcast.media_store.audio.length; i++)
 	{
 		if(localcast.media_store.audio[i].id === id)
 		{
 			return localcast.media_store.audio[i];
 		}
 	};
 	for(i = 0; i < localcast.media_store.image.length; i++)
 	{
 		if(localcast.media_store.image[i].id === id)
 		{
 			return localcast.media_store.image[i];
 		}
 	};
 	return false;
 };
 
/*
 * Logger methods
 * DETAILS
 *	- the log function will get the stacktrace and look at who's logging
 *	  this is appended to the log for easier debugging.
 */
 
function log(short_info, full_event)
{
	fcn = arguments.callee.caller.name;
	long_info = + localcast.logging.verbose?JSON.stringify(full_event):"";
	log_str = fcn + ": " + short_info + " " + long_info ;
	if (!localcast.logging.console_only)
	{
		//do visible logging here
	}
	console.log(log_str);
 
};

/*
 * APP INIT!!
 * DETAILS
 *	- each 'module' will have its own init method, they will all be called here.
 */
 
function init()
{
	init_ws();
	init_cast();
	init_ui();
	
	
}
init();
});
