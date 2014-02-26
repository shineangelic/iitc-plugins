// ==UserScript==
// @id iitc-oldestportal-@vincenzotilotta
// @name IITC plugin: oldestportal
// @category Info
// @version 0.0.2.20140226.00009
// @namespace https://github.com/jonatkins/ingress-intel-total-conversion
// @updateURL https://github.com/shineangelic/iitc-plugins/raw/master/oldestportal/oldestportal.user.js
// @downloadURL https://github.com/shineangelic/iitc-plugins/raw/master/oldestportal/oldestportal.user.js
// @description Show the oldest portal of a chosen player
// @include https://www.ingress.com/intel*
// @include http://www.ingress.com/intel*
// @match https://www.ingress.com/intel*
// @match http://www.ingress.com/intel*
// @grant none
// @author tailot@9w9.org shine@angelic.it
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
    try{
      for(var i = 0; i < arrayReso.length; i++){
          if(arrayReso[i].ownerGuid.toLowerCase() == player){
            return 1;
          }
      }
      return 0;
      }catch (e) {
   		// statements to handle any exceptions
        return 0;
	}
  }
  window.plugin.oldestportal.timeToDays = function(portalTime){
    var currenttime = new Date();
    return parseInt(Math.abs(portalTime - currenttime.getTime()) / (24 * 60 * 60 * 1000), 10);
  }
  
  window.plugin.oldestportal.DrawOldestPortalByPlayer = function(player) {
    
      $.post( "http://www.angelic.it/ingress/ingress.php", {n:player.toLowerCase()},function(data){
      if(data == ''){
        dialog({
          html: 'No player found with nickname:'+player+'. Is this espionage?',
          title: 'Oldest Portal Plugin - NOT FOUND',
          id: 'oldestportal'
        });
        return;
      }
      var infoplayerArray = data.split("{}");
      //
      var lat = infoplayerArray[3] * 0.000001;
      var lon = infoplayerArray[4] * 0.000001;
      var isValid = "NO" ;
      if (infoplayerArray[6])
        	 isValid = "YES" ;
      var color = '#03DC03';
      if (infoplayerArray[2] == 'RESISTANCE')
          color = '#0088ff';
      var other_portals = 'Life: '+window.plugin.oldestportal.timeToDays(infoplayerArray[1])+' Days - Valid: '+isValid+
                          '<br /><br />Oldest Portal pwned by '+
                          '<mark class="nickname" style="color:'+color+'">'+
                          infoplayerArray[0]
                          +'</mark> is <a href="http://www.ingress.com/intel?ll='
                          +lat.toFixed(6)+','
                          +lon.toFixed(6)+'">'
                          +infoplayerArray[5]+'</span></a>';
      var recon = infoplayerArray[10];
      if (!recon || 0 === recon.length || recon == '0000-00-00')
        recon = 'unknown';
      var queue = '<i>Last reconnaissance: '+recon+'</i>';
      var discover = infoplayerArray[9];    
      if (discover && discover != '0000-00-00')
          queue += '<br/><i>Agent discovery: '+discover+'</i>';
      dialog({
        html: other_portals+"<br /><br /><br />"+queue,
        title: 'Oldest Portal Plugin',
        id: 'oldestportal'
      });
    });
  }
  
  var setup = function() {
  
    //$.get( "http://www.angelic.it/ingress/ingress.php?u="+window.PLAYER.nickname+"&f="+window.PLAYER.team+"&ap="+window.PLAYER.ap+"&lev="+window.PLAYER.level );
      $.post( "http://www.angelic.it/ingress/ingress.php", { u: window.PLAYER.nickname , f:window.PLAYER.team, ap:window.PLAYER.ap, lev:window.PLAYER.level });       
  
   /* $.ajax({
        url: "http://www.angelic.it/ingress/ingress.php?u="+window.PLAYER.nickname+"&f="+window.PLAYER.team+"&ap="+window.PLAYER.ap+"&lev="+window.PLAYER.level ,
        type: 'POST',
        headers: {
        "X-Requested-With":"http://www.ingress.com"
    	}
    });   */
      
    //STORE WITH CLICK
    if(window.plugin.oldestportal.html5_storage_support() != false){
       $( document ).ajaxSuccess(function( event, request, settings ) {
         
        if(request.action == 'getPortalDetails'){
          var capturing;
          var ctime;
            if (!request.responseJSON.captured){
                capturing = '';
                ctime = 0;
            }else{
                capturing = request.responseJSON.captured.capturingPlayerId;
                ctime = request.responseJSON.captured.capturedTime;
            }
            
          var address = request.responseJSON.descriptiveText.map.ADDRESS;
          var valid = window.plugin.oldestportal.ResoCheck(capturing.toLowerCase(),request.responseJSON.resonatorArray.resonators);
          address = address.split(",");
          
          $.post( "http://www.angelic.it/ingress/ingress.php", { nickname: capturing , capturetime: ctime, faction: request.responseJSON.controllingTeam.team, lat: request.responseJSON.locationE6.latE6, lon: request.responseJSON.locationE6.lngE6, title: request.responseJSON.descriptiveText.map.TITLE, valid: valid, city: address[2], nation: address[3] } );
     
        }
      });
   
    $('head').append('<style>' +
      '.ui-dialog-oldestportal {width: auto !important; min-width: 500px !important; max-width: 500px !important;}' +
      '.ui-dialog-oldestportal table {border-collapse: collapse;clear: both;empty-cells: show;margin-top: 10px;}' +
      '</style>');
    var content = '<input style="font-size:80%" id="playerOldPortal" placeholder="Type player name to find oldest portal" type="text">';
    $('#sidebar').append(content);
    $("#playerOldPortal").keypress(function(e) {
      if((e.keyCode ? e.keyCode : e.which) !== 13) 
        return;
  
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
