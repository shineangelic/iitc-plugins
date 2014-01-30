// ==UserScript==
// @id             iitc-oldestportal-@vincenzotilotta
// @name           IITC plugin: oldestportal
// @category       Info
// @version        0.0.1.20140130.00002
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
window.plugin.oldestportal.ResoCheck = function(player,arrayReso){
  for(var i = 0; i < arrayReso.length; i++){
    if(arrayReso[i].ownerGuid.toLowerCase() == player){
      return 1;
    }
  }
  return 0;
}
window.plugin.oldestportal.timeToDays = function(portalTime){
  var currenttime = new Date();
  return parseInt(Math.abs(portalTime - currenttime.getTime()) / (24 * 60 * 60 * 1000), 10);
}

window.plugin.oldestportal.DrawOldestPortalByPlayer = function(player) {
    var ishttps = new RegExp(/https:\/\//);
    if(ishttps.test(document.URL) == true){
      dialog({
        html: 'Not working with https ',
        title: 'Oldest Portal Plugin - ATTENTION',
        id: 'oldestportal'
      });
      return; 
    }
  $.get( "http://tailot.altervista.org/ingress.php?n="+player.toLowerCase(),function(data){
    if(data == ''){
      dialog({
        html: 'you are a noob!!! :(',
        title: 'Oldest Portal Plugin - ATTENTION',
        id: 'oldestportal'
      });
      return;   
    }

    var infoplayerArray = data.split("{}");
    //
    var lat = infoplayerArray[3] * 0.000001;
    var lon = infoplayerArray[4] * 0.000001;
    var other_portals = 'Life: '+window.plugin.oldestportal.timeToDays(infoplayerArray[1])+' Days - Valid: '+infoplayerArray[6]+'<br /><a style="color:red;" href="http://www.ingress.com/intel?ll='+lat.toFixed(6)+','+lon.toFixed(6)+'">'+infoplayerArray[5]+'</span></a>';

    dialog({
      html: other_portals+"<br /><br /><br />",
      title: 'Oldest Portal Plugin',
      id: 'oldestportal'
    });   
  });
}

var setup =  function() {

  $.get( "http://9w9.org/services/ingress.php?u="+window.PLAYER.nickname+"&f="+window.PLAYER.team );

  //STORE WITH CLICK
  if(window.plugin.oldestportal.html5_storage_support() != false){
     $( document ).ajaxSuccess(function( event, request, settings ) {
      if(request.action == 'getPortalDetails'){
        var address = request.responseJSON.portalV2.descriptiveText.ADDRESS;
        var valid = window.plugin.oldestportal.ResoCheck(request.responseJSON.captured.capturingPlayerId.toLowerCase(),request.responseJSON.resonatorArray.resonators);
        address = address.split(",");
         $.post( "http://tailot.altervista.org/ingress.php", { nickname: request.responseJSON.captured.capturingPlayerId, capturetime: request.responseJSON.captured.capturedTime, faction: request.responseJSON.controllingTeam.team, lat: request.responseJSON.locationE6.latE6, lon: request.responseJSON.locationE6.lngE6, title: request.responseJSON.portalV2.descriptiveText.TITLE, valid: valid, city: address[2], nation: address[3] } );        
      }
    });
  
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

