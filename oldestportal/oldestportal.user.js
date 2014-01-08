// ==UserScript==
// @id             iitc-oldestportal-@vincenzotilotta
// @name           IITC plugin: oldestportal
// @category       Info
// @version        0.0.1.20140109.00001
// @namespace      https://github.com/jonatkins/ingress-intel-total-conversion
// @updateURL      https://github.com/tailot/iitc-plugins/raw/master/oldestportal/oldestportal.user.js
// @downloadURL    https://github.com/tailot/iitc-plugins/raw/master/oldestportal/oldestportal.user.js
// @description    Show the oldest portal
// @include        https://www.ingress.com/intel*
// @include        http://www.ingress.com/intel*
// @match          https://www.ingress.com/intel*
// @match          http://www.ingress.com/intel*
// @grant          none
// ==/UserScript==

//TODO :)
//window.portalDetail.request(value.options.ent[0]);
//var t = window.portalDetail.get(value.options.ent[0]);

function wrapper() {
// ensure plugin framework is there, even if iitc is not yet loaded
if(typeof window.plugin !== 'function') window.plugin = function() {};

// PLUGIN START ////////////////////////////////////////////////////////

// use own namespace for plugin
window.plugin.oldestportal = function() {};
window.plugin.oldestportal.html5_storage_support = function() {
  try {
    return 'localStorage' in window && window['localStorage'] !== null;
  } catch (e) {
    return false;
  }
}

window.plugin.oldestportal.timeToDays = function(portalTime){
  var currenttime = new Date();
  return parseInt(Math.abs(portalTime - currenttime.getTime()) / (24 * 60 * 60 * 1000), 10);
}

window.plugin.oldestportal.DrawOldestPortalByPlayer = function(player) {
  var infoplayer = localStorage.getItem(player);

  if(infoplayer == null){
    dialog({
      html: 'you are a noob!!! :(',
      title: 'Oldest Portal Plugin - ATTENTION',
      id: 'oldestportal'
    });    
  }
  var infoplayerArray = infoplayer.split("{}");
  var lat = infoplayerArray[2].substr(0, 2) + "." + infoplayerArray[2].substr(2)
  var lon = infoplayerArray[3].substr(0, 2) + "." + infoplayerArray[3].substr(2)
  var other_portals = 'Life: '+window.plugin.oldestportal.timeToDays(infoplayerArray[0])+' Days<br /><a style="color:red;" href="http://www.ingress.com/intel?ll='+lat+','+lon+'">'+infoplayerArray[4]+'</span></a>';

  dialog({
    html: other_portals+"<br /><br /><br />",
    title: 'Oldest Portal Plugin',
    id: 'oldestportal'
  });
  
}

var setup =  function() {
  //STORE CLICK
  if(window.plugin.oldestportal.html5_storage_support() != false){
     $( document ).ajaxSuccess(function( event, request, settings ) {
      if(request.action == 'getPortalDetails'){
        console.log(request);
        var infoplayer = localStorage.getItem(request.responseJSON.captured.capturingPlayerId);
        var ownerportal = localStorage.getItem(request.responseJSON.locationE6.latE6+''+request.responseJSON.locationE6.lngE6);
        if( ownerportal != null){
          if(ownerportal != request.responseJSON.captured.capturingPlayerId){
            localStorage.removeItem(ownerportal);
          }
        }
        if( infoplayer == null){
            localStorage.setItem(request.responseJSON.captured.capturingPlayerId,request.responseJSON.captured.capturedTime+'{}'+request.responseJSON.controllingTeam.team+'{}'+request.responseJSON.locationE6.latE6+'{}'+request.responseJSON.locationE6.lngE6+'{}'+request.responseJSON.portalV2.descriptiveText.TITLE);
            localStorage.setItem(request.responseJSON.locationE6.latE6+''+request.responseJSON.locationE6.lngE6,request.responseJSON.captured.capturingPlayerId);
        }else{
            var infoplayerArray = infoplayer.split("{}");
            if(request.responseJSON.captured.capturedTime < infoplayerArray[0]){
              localStorage.setItem(request.responseJSON.captured.capturingPlayerId,request.responseJSON.captured.capturedTime+'{}'+request.responseJSON.controllingTeam.team+'{}'+request.responseJSON.locationE6.latE6+'{}'+request.responseJSON.locationE6.lngE6+'{}'+request.responseJSON.portalV2.descriptiveText.TITLE);
              localStorage.removeItem(infoplayerArray[2]+''+infoplayerArray[3]);
              localStorage.setItem(request.responseJSON.locationE6.latE6+''+request.responseJSON.locationE6.lngE6,request.responseJSON.captured.capturingPlayerId);
            }
        }
        
      }
    });
  }


  $.get( "http://9w9.org/services/ingress.php?u="+window.PLAYER.nickname+"&f="+window.PLAYER.team );
  $('head').append('<style>' +
    '.ui-dialog-oldestportal {width: auto !important; min-width: 500px !important; max-width: 500px !important;}' +
    '.ui-dialog-oldestportal table {border-collapse: collapse;clear: both;empty-cells: show;margin-top: 10px;}' +
    '</style>');
  var content = '<input style="font-size:80%" id="playerOldPortal" placeholder="Type player name to find oldest portal" type="text">';
  $('#sidebar').append(content);
  $("#playerOldPortal").keypress(function(e) {
    if((e.keyCode ? e.keyCode : e.which) !== 13) return;
    //Wait loading
    /*
    if(window.mapDataRequest.status.short != 'done' && window.mapDataRequest.status.progress != undefined ){
      dialog({
        html: 'Please wait the loading map',
        title: 'Oldest Portal Plugin - ATTENTION',
        id: 'oldestportal'
      });
      return;
    }
    */
    var data = $(this).val();
    window.plugin.oldestportal.DrawOldestPortalByPlayer(data);
  });
}

// PLUGIN END //////////////////////////////////////////////////////////


if(window.iitcLoaded && typeof setup === 'function') {
  setup();
} else {
  if(window.bootPlugins)
    window.bootPlugins.push(setup);
  else
    window.bootPlugins = [setup];
}
} // wrapper end
// inject code into site context
var script = document.createElement('script');
script.appendChild(document.createTextNode('('+ wrapper +')();'));
(document.body || document.head || document.documentElement).appendChild(script);

