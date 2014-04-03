jQuery(document).ready(function()
{

function init()
{
	full_url = document.URL;
	i = full_url.indexOf("/") + 2;
	j = full_url.indexOf("index.html") - 8;
	url = full_url.substr(i,j);
	
	window.ws = {}
	window.ws.url = "ws://"+url+"/ws";
	window.ws.handle = new WebSocket(window.ws.url);
	window.ws.handle.onopen = WSOpen;
	window.ws.handle.onclose = WSClose;
	window.ws.handle.onmessage = WSMsg;
	window.ws.handle.onerror = WSError;
	window.ws.retry_timeout = 3000; //ms
	window.ws.connected = false;	
	window.ws.retry_interval = null;
	
	window.logging = {};
	window.logging.console_only = false;
	window.logging.verbose = false;
	
	window.localcast  = {};
	window.localcast.session = null;
	window.localcast.media_session = null;
	
	window.media = {};
	window.media.videos = null;
	
	window.app = {};
	window.app.quickmenu = {};
	window.app.quickmenu.is_open = false;
	$("#open_qm").click(AppOpenQuickMenu);
	$("#close_qm").click(AppCloseQuickMenu);
	if (!chrome.cast || !chrome.cast.isAvailable)
	{
	  setTimeout(initializeCastApi, 1000);
	}
	
}
function initializeCastApi()
{
  // default app ID to the default media receiver app
  // optional: you may change it to your own app ID/receiver
  var applicationID = chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID;
  var sessionRequest = new chrome.cast.SessionRequest(applicationID);
  var apiConfig = new chrome.cast.ApiConfig(sessionRequest,castSessionListener,castReceiverListener);
  chrome.cast.initialize(apiConfig, onCastInitSuccess, onError);
};
function castSessionListener(event)
{
	log("CAST: Cast Session ID - " + event.sessionId);
	window.localcast.session = event;
	if (window.localcast.session.media.length > 0 )
	{
		log("CAST: castSessionListener found " + window.localcast.session.media.length + " current sessions.");
		onCastMediaDiscovered('onRequestSessionSuccess_', window.localcast.session.media[0]);
	}
};
function onCastMediaDiscovered(how, mediaSession) 
{
	log("CAST: media session discovered - ID = "+mediaSession.mediaSessionId);
	window.localcast.media_session = mediaSession;
	window.localcast.media_session.addUpdateListener(onCastMediaStatusUpdate);
	
};
function onCastMediaStatusUpdate(isAlive)
{
	//we're not doing anything here right now, mainly because we're not updating a time bar or anything.
}
function castReceiverListener(event)
{
	if (event === "available")
	{
		log("CAST: Found Receiver");
	}
	else
	{
		log("CAST: No Receivers");
	}

};
function onCastInitSuccess()
{
	log("CAST: Successful init");
}
function onError(event)
{
	opt = window.logging.verbose?"Event data - " + JSON.stringify(event):"";
	log("CAST: Error!  "+opt);
}
function WSOpen(event)
{
	opt = window.logging.verbose?"Event data - " + JSON.stringify(event):"";
	log("WS: Opened. "+opt);
	window.ws.connected = true;
	window.ws.handle.onclose = WSClose;
	AppGetVideos();
};
function WSClose(event)
{
	
	opt = window.logging.verbose?"Event data - " + JSON.stringify(event):"";
	log("WS: Closed. "+opt);
	window.ws.connected = false;
	window.ws.retry_interval = setInterval(WSRetryConnect, window.ws.retry_timeout);
	
};
function WSMsg(event)
{
	opt = window.logging.verbose?"Event data - " + JSON.stringify(event):"";
	log("WS: Msg. "+opt);
	msg = JSON.parse(event.data);
	if (msg.resp_to == "get_videos")
	{
		window.media.videos = JSON.parse(msg.resp);
		onAppMediaStoreChange();
	}

};
function WSError(event)
{
	opt = window.logging.verbose?"Event data - " + JSON.stringify(event):"";
	log("WS: Error. "+opt);

};
function WSRetryConnect()
{
	if(window.ws.connected)
	{
		clearInterval(window.ws.retry_interval);
	}
	else
	{
		log("WS: Attempting to reconnect...");
		window.ws.handle = new WebSocket(window.ws.url);
		window.ws.handle.onopen = WSOpen;
		window.ws.handle.onmessage = WSMsg;
		window.ws.handle.onerror = WSError;
	}
};
function AppGetVideos()
{
	msg = {};
	msg.req_type = "get_videos";
	msg = JSON.stringify(msg);
	window.ws.handle.send(msg);
	
};
function AppOpenQuickMenu()
{
	if(!window.app.quickmenu.is_open)
	{
		window.app.quickmenu.is_open = true;
		$("#quickmenu").animate({bottom:0},500);
	}
	
};
function AppCloseQuickMenu()
{
	if(window.app.quickmenu.is_open)
	{
		window.app.quickmenu.is_open = false;
		$("#quickmenu").animate({bottom:-180},500);
	}
	
};
function onAppMediaStoreChange()
{
	dom_str = "";
	$("#container").empty();
	for(i = 0; i < window.media.videos.length; i++)
	{
		dom_str += "<div class='media_item'>"+window.media.videos[i]+"</div>";
	}
	$("#container").append(dom_str);
};

function log(event)
{
	if( window.logging.console_only)
	{
		console.log(event);
	}
	else
	{
		console.log(event);
		$("#visilog").append("\n"+event);
		$("#visilog").scrollTop($("#visilog")[0].scrollHeight);
	}
};
init();
});
