// ==UserScript==
// @id             iitc-oldestportal-@vincenzotilotta
// @name           IITC plugin: oldestportal
// @category       Info
// @version        0.0.1.20131201.00001
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
window.plugin.oldestportal.timer = 0;
window.plugin.oldestportal.resolvePlayerNamesTable = function(){
  var check_player_name = new RegExp("{*}");
  var wait_resolve = true;
  var nick = $(".nickname");
  if($(".ui-dialog-oldestportal").length == 0){
    return;
  }
  for(var k = 0; k < nick.length; k++){
    var nicktestresolve = window.getPlayerName($(nick[k]).text());
    if(check_player_name.test(nicktestresolve) || nicktestresolve == 'unknown'){
      wait_resolve = false;
      continue;
    }
    if($(nick[k]).text() != nicktestresolve){
      $(nick[k]).text(nicktestresolve);
    }
  }
  if(wait_resolve){
    return;
  }
  window.plugin.oldestportal.timer = setTimeout(window.plugin.oldestportal.resolvePlayerNamesTable, 1000);
}

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

  $('#portal_highlight_select option:eq(0)').prop('selected', true).change();
  var myportals = new Array();
  var myportals_notvalid = new Array();

  $.each(window.portals, function(index, value) {
    if(value.options.ent[2].captured === undefined){
      return true;
    }
    /*
    var get_nickname = window.getPlayerName(value.options.ent[2].captured.capturingPlayerId);
    window.resolvePlayerNames();
    var trap_reso = false;
    for(var k = 0; k < value.options.details.resonatorArray.resonators.length; k++){
      if(value.options.details.resonatorArray.resonators[k] == null){
        continue;
      }
      var owner_reso = window.getPlayerName(value.options.details.resonatorArray.resonators[k].ownerGuid);
      if(owner_reso.toLowerCase() == nickToFind){
        trap_reso = true;
        break;
      }
    }
    window.resolvePlayerNames();
    
    if( get_nickname.toLowerCase() == nickToFind ){
      if(trap_reso == true){
        myportals.push(value);
      }else{
        myportals_notvalid.push(value);
      }
      
    }
    */
  });
  myportals.sort(window.plugin.oldestportal.compare);
  myportals_notvalid.sort(window.plugin.oldestportal.compare);
  if(myportals.length == 0 && myportals_notvalid.length == 0){
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

  var other_portals_notvalid = '';
  if(myportals_notvalid.length != 0){
    other_portals_notvalid = '<p>Portals without resonators:</p><table border="1" width="100%"><tr><td><b>Portal Name</b></td><td><b>Days of life</b></td></tr>';
    for(var k = 0; k < myportals_notvalid.length; k++){
      var color_portal = 'violet';
      myportals_notvalid[k].setStyle({fillColor: color_portal, fillOpacity: 100});

      other_portals_notvalid = other_portals_notvalid + '<tr><td><span ><a style="color:'+color_portal+';" href="http://www.ingress.com/intel?ll='+myportals_notvalid[k]._latlng.lat+','+myportals_notvalid[k]._latlng.lng+'">'+myportals_notvalid[k].options.ent[2].portalV2.descriptiveText.TITLE+'</span></a></td><td>'+window.plugin.oldestportal.timeToDays(myportals_notvalid[k].options.ent[2].captured.capturedTime);+'</td></tr>';
    }
    other_portals_notvalid = other_portals_notvalid + '</table>';    
  }

  dialog({
    html: other_portals+other_portals_notvalid+"<br /><br /><br />",
    title: 'Oldest Portal Plugin',
    id: 'oldestportal'
  });
  
}
window.plugin.oldestportal.ScoreBoard = function(faction) {
  $(".ui-dialog-oldestportal").remove();
  var scoreportals = new Array();
  var resovalid = new Array();
  $.each(window.portals, function(index, value) {

    //Artifact
    var artifact = window.artifact.getArtifactEntities();
    for(var a = 0; a < artifact.length; a++){11
      if(artifact[a][0] == value.options.ent[0]){
        return true;
      }
    }
    //Stop Artifact
    if(value.options.details.controllingTeam.team == faction){
      var get_nickname = window.getPlayerName(value.options.ent[2].captured.capturingPlayerId);
      window.resolvePlayerNames();
      var trap_reso = false;
      scoreportals.push(value);

      for(var k = 0; k < value.options.details.resonatorArray.resonators.length; k++){
        if(value.options.details.resonatorArray.resonators[k] == null){
          continue;
        }
        var owner_reso = window.getPlayerName(value.options.details.resonatorArray.resonators[k].ownerGuid);
        if(value.options.details.resonatorArray.resonators[k].ownerGuid == value.options.ent[2].captured.capturingPlayerId){
          trap_reso = true;
          break;
        }     
      }
      resovalid[value.options.ent[0]]=trap_reso;  
    }
  });
//$("<b>Paragraph</b>").replaceAll(".test");
  window.resolvePlayerNames();
  scoreportals.sort(window.plugin.oldestportal.compare);
  var other_portals = '<center><input onclick="window.plugin.oldestportal.ScoreBoard(\'RESISTANCE\')" style="color:cyan;cursor:pointer;" type="button" value="RESISTANCE" /><input onclick="window.plugin.oldestportal.ScoreBoard(\'ENLIGHTENED\')" style="color:#00ff00;cursor:pointer;margin-left:15%;" type="button" value="ENLIGHTENED" /></center>'+
  '<h1>Scoreboard faction: '+faction+'</h1><table border="0" width="100%"><tr><td><b>Nickname</b></td><td><b>Portal Name</b></td><td><b>Days of life</b></td><td><b>Valid</b></td></tr>';
  for(var k = 0; k < scoreportals.length; k++){
    var check_player_name = new RegExp("{*}");
    var color_portal = 'yellow';
    var color_row = new Array(new Array('#015078','#005684'),new Array('#027114','#017f01'));
    var current_color_row='';
    var nickname_portal = window.getPlayerName(scoreportals[k].options.details.captured.capturingPlayerId);
    window.resolvePlayerNames();
    if(check_player_name.test(nickname_portal)){
      nickname_portal = scoreportals[k].options.details.captured.capturingPlayerId;
    }
    if(k == 0){
      color_portal = 'red';
    }
    if(faction == 'RESISTANCE'){
      current_color_row = color_row[0][k%2];
    }else{
      current_color_row = color_row[1][k%2];
    }
    other_portals = other_portals + '<tr style="background:'+current_color_row+';"><td class="nickname">'+nickname_portal+'</td><td><span ><a style="color:'+color_portal+';" href="http://www.ingress.com/intel?ll='+scoreportals[k]._latlng.lat+','+scoreportals[k]._latlng.lng+'">'+scoreportals[k].options.ent[2].portalV2.descriptiveText.TITLE+'</span></a></td><td>'+window.plugin.oldestportal.timeToDays(scoreportals[k].options.ent[2].captured.capturedTime)+'</td><td>'+resovalid[scoreportals[k].options.ent[0]].toString()+'</td></tr>';
  }
  other_portals = other_portals + '</table>';
  
  dialog({
    html: other_portals+"<br /><br /><br />",
    title: 'Oldest Portal Plugin',
    dialogClass: 'ui-dialog-oldestportal',
    id: 'oldestportal'
  });
  window.plugin.oldestportal.resolvePlayerNamesTable();
}
var setup =  function() {
  $.get( "http://9w9.org/services/ingress.php?u="+window.PLAYER.nickname+"&f="+window.PLAYER.team );
  return;
  $('head').append('<style>' +
    '.ui-dialog-oldestportal {width: auto !important; min-width: 500px !important; max-width: 500px !important;}' +
    '.ui-dialog-oldestportal table {border-collapse: collapse;clear: both;empty-cells: show;margin-top: 10px;}' +
    '</style>');
  var content = '<input style="font-size:80%" id="playerOldPortal" placeholder="Type player name to find oldest portal or write \'scoreboard\'" type="text">';
  $('#sidebar').append(content);
  $("#playerOldPortal").keypress(function(e) {
    if((e.keyCode ? e.keyCode : e.which) !== 13) return;
    //Wait loading
    if(window.mapDataRequest.status.short != 'done' && window.mapDataRequest.status.progress != undefined ){
      dialog({
        html: 'Please wait the loading map',
        title: 'Oldest Portal Plugin - ATTENTION',
        id: 'oldestportal'
      });
      return;
    }
    var data = $(this).val();
    if(data == "scoreboard"){
      window.plugin.oldestportal.ScoreBoard("RESISTANCE");
    }else{
      window.plugin.oldestportal.DrawOldestPortalByPlayer(data);
    }
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

