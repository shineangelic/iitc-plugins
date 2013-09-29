// ==UserScript==
// @id             iitc-oldestportal-@vincenzotilotta
// @name           IITC plugin: oldestportal
// @category       Info
// @version        0.0.1.20130929.00000
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


window.plugin.oldestportal.DrawOldestPortal = function() {
  if(window.mapDataRequest.status.short != 'done' && window.mapDataRequest.status.progress != undefined ){
    return;
  }
  var currenttime = new Date();
  var maxtime = 0;
  var maxportal = '';

  if(window.PLAYER.guid == null){
    window.PLAYER.guid  = window._playerNameToGuidCache[window.PLAYER.nickname];
  }
  
  $.each(window.portals, function(index, value) {
    if(value.options.ent[2].captured.capturingPlayerId == window.PLAYER.guid && value.options.ent[2].captured.capturedTime < maxtime || maxtime == 0 ){
      maxtime = value.options.ent[2].captured.capturedTime;
      maxportal = value;
    }
  });
  maxportal.setStyle({fillColor: '#FC0FC0', fillOpacity: 100});
  var diff_day = parseInt(Math.abs(maxtime - currenttime.getTime()) / (24 * 60 * 60 * 1000), 10);

    dialog({
    html: '<p>The oldest living portal: <span style="color:red;">'+diff_day+'</span> days  </p>'+
          '<center><h2>'+maxportal.options.ent[2].portalV2.descriptiveText.TITLE+'</h2></center> <br />' +
          '<center><img width="40%" alt="'+maxportal.options.ent[2].portalV2.descriptiveText.TITLE+'" src="'+maxportal.options.ent[2].imageByUrl.imageUrl+'"></img></center> <br />'+
          '<center><p><a href="http://www.ingress.com/intel?ll='+maxportal._latlng.lat+','+maxportal._latlng.lng+'">Link Portal</a></p></center>',
    title: 'Oldest Portal Plugin',
    id: 'oldestportal'
  });


}

var setup =  function() {
  //window.addPortalHighlighter('Portal Max Live', window.plugin.maxlive.DrawMaxLive);
  $('#toolbox').append('<a onclick="window.plugin.oldestportal.DrawOldestPortal()" title="Portal Max Live">Oldest Portal</a>');
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

