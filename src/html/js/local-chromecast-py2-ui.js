function rebind_handlers()
{
	$(".media_item").click(onMediaItemClick);
	$("#play").click(onPlayClick);
	$("#stop").click(onStopClick);
	$("#volume").change(onVolumeChange);
}
function onVolumeChange()
{
	level = $(this).val();
	$("#vol_label").html("Volume ("+level+")");
	localcast.ui.on_volume_change_callback(level);
	
};
function onMediaItemClick()
{
	id = $(this).attr("id");
	title = $("#"+id+" .media_title").html();
	img = $("#"+id+" img").attr("src");
	$("#selected_title").html(title);
	$("#selected_thumb").attr("src",img);
	localcast.ui.on_click_callback(id);
};
function onMediaStoreChange()
{
	$("#media_pane").empty();
	dom = "";
	for(i = 0; i < localcast.media_store.video.length; i++)
 	{
 		o = localcast.media_store.video[i];
 		dom += "<div class='media_item' id='"+o.id+"'><img src='"+o.meta.thumbnail+"'/><div class='media_title'>"+o.title+"</div></div>";
 	};
 	for(i = 0; i < localcast.media_store.audio.length; i++)
 	{
 		o = localcast.media_store.audio[i];
 		dom += "<div class='media_item' id='"+o.id+"'><img src='"+o.meta.thumbnail+"'/><div class='media_title'>"+o.title+"</div></div>";
 	};
 	for(i = 0; i < localcast.media_store.image.length; i++)
 	{
 		o = localcast.media_store.image[i];
 		dom += "<div class='media_item' id='"+o.id+"'><img src='"+o.meta.thumbnail+"'/><div class='media_title'>"+o.title+"</div></div>";
 	};
	$("#media_pane").append(dom);
	rebind_handlers();
};
function onPlayClick()
{
	localcast.ui.play_media_callback();
};
function onStopClick()
{
	localcast.ui.stop_media_callback();
}
function init_ui()
{
	rebind_handlers();
	localcast.ui.on_media_store_change = onMediaStoreChange;
};

