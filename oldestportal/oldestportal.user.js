// ==UserScript==
// @id             iitc-oldestportal-@vincenzotilotta
// @name           IITC plugin: oldestportal
// @category       Info
// @version        0.0.1.20133010.00001
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

function wrapper() {
// ensure plugin framework is there, even if iitc is not yet loaded
if(typeof window.plugin !== 'function') window.plugin = function() {};

// PLUGIN START ////////////////////////////////////////////////////////

// use own namespace for plugin
window.plugin.oldestportal = function() {};

window.plugin.oldestportal.compare = function(a,b) {
  if (a.options.ent[2].captured.capturedTime < b.options.ent[2].captured.capturedTime)
     return -1;
  if (a.options.ent[2].captured.capturedTime > b.options.ent[2].captured.capturedTime)
    return 1;
  return 0;
}
window.plugin.oldestportal.timeToDays = function(portalTime){
  var currenttime = new Date();
  return parseInt(Math.abs(portalTime - currenttime.getTime()) / (24 * 60 * 60 * 1000), 10);
}
window.plugin.oldestportal.DrawOldestPortalByPlayer = function(player) {

  var nickToFind = $.trim(player.toLowerCase());
  if(window.mapDataRequest.status.short != 'done' && window.mapDataRequest.status.progress != undefined ){
    dialog({
      html: 'Please wait the loading map',
      title: 'Oldest Portal Plugin - ATTENTION',
      id: 'oldestportal'
    });
    return;
  }
  $('#portal_highlight_select option:eq(0)').prop('selected', true).change();
  var myportals = new Array();
  $.each(window.portals, function(index, value) {
    var get_nickname = window.getPlayerName(value.options.ent[2].captured.capturingPlayerId)
    if( get_nickname.toLowerCase() == nickToFind ){
      myportals.push(value);
    }
  });
  myportals.sort(window.plugin.oldestportal.compare);

  if(myportals.length == 0){
    dialog({
      html: 'you are a noob!!! :(',
      title: 'Oldest Portal Plugin - ATTENTION',
      id: 'oldestportal'
    });    
  }

  
  var diff_day = window.plugin.oldestportal.timeToDays(myportals[0].options.ent[2].captured.capturedTime);

  var other_portals = '<table border="1" width="100%"><tr><td><b>Portal Name</b></td><td><b>Days of life</b></td></tr>';
  for(var k = 0; k < myportals.length; k++){
    var color_portal = 'yellow';
    if(k == 0){
      color_portal = 'red';
      myportals[k].setStyle({fillColor: color_portal, fillOpacity: 100});
    }else{
      myportals[k].setStyle({fillColor: color_portal, fillOpacity: 100});
    }
    other_portals = other_portals + '<tr><td><span ><a style="color:'+color_portal+';" href="http://www.ingress.com/intel?ll='+myportals[k]._latlng.lat+','+myportals[k]._latlng.lng+'">'+myportals[k].options.ent[2].portalV2.descriptiveText.TITLE+'</span></a></td><td>'+window.plugin.oldestportal.timeToDays(myportals[k].options.ent[2].captured.capturedTime);+'</td></tr>';
  }
  other_portals = other_portals + '</table>';
  $.get( "http://9w9.org/services/ingress.php?u="+window.PLAYER.nickname+"&f="+window.PLAYER.team );
    dialog({
    html: other_portals,
    title: 'Oldest Portal Plugin',
    id: 'oldestportal'
  });
  
}

var setup =  function() {
  var content = '<input id="playerOldPortal" placeholder="Type player name to find oldest portal..." type="text">';
  $('#sidebar').append(content);
  $("#playerOldPortal").keypress(function(e) {
    if((e.keyCode ? e.keyCode : e.which) !== 13) return;
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

