// ==UserScript==
// @id             iitc-oldestportal-@vincenzotilotta
// @name           IITC plugin: oldestportalV2
// @category       Info
// @version        0.0.3.20140305.00019
// @namespace      https://github.com/jonatkins/ingress-intel-total-conversion
// @updateURL      https://github.com/shineangelic/iitc-plugins/raw/master/oldestportal/oldestportal.user.js
// @downloadURL    https://github.com/shineangelic/iitc-plugins/raw/master/oldestportal/oldestportal.user.js
// @description    Show the oldest portals of a chosen player
// @include        https://www.ingress.com/intel*
// @include        http://www.ingress.com/intel*
// @match          https://www.ingress.com/intel*
// @match          http://www.ingress.com/intel*
// @grant          none
// @author         tailot@9w9.org shine@angelic.it
// ==/UserScript==

function wrapper(plugin_info) {
// ensure plugin framework is there, even if iitc is not yet loaded
if(typeof window.plugin !== 'function') window.plugin = function() {};

// PLUGIN START ////////////////////////////////////////////////////////

    window.plugin.oldestportal = function () {};

    window.plugin.oldestportal.getFactionColor = function (faction) {
        var o = window.COLORS[2];
        if(faction == 'R'){ o = window.COLORS[1]; }
        return o;
    }

    window.plugin.oldestportal.ResoCheck = function (e, t) {
        try {
            for (var n = 0; n < t.length; n++) {
                if (t[n].ownerGuid.toLowerCase() == e) {
                    return 1;
                }
            }
            return 0;
        } catch (r) {
            return 0;
        }
    }

    window.plugin.oldestportal.showInfo = function() {
        dialog({
            html: 'Oldest portal plugin stores portal information when script users click on portal details. '
                +'It DOES NOT collect personal data, nor increase network traffic toward intel map.'
                +'<br/><br/>Once a new Guardian is found, it will be visible to ALL your faction members but not to the other faction, so clicking on your guardian is fine.'
                +' More the faction clicks, more the correct enemy guardian identified.'
                +'<br/><br/><b>Last Recon</b> indicates last visit/confirmation to the portal.'
                +'<br/><br/> <b>Oldest portal plugin</b> is a free espionage tool, but it\'s likely to be considered against the Ingress TOS. Any use is at your own risk. Please use it wisely and share it only with <i>trusted</i> agents.',
            title: 'Oldest Portal Plugin V2 - tailot@9w9.org & shine@angelic.it',
            id: 'oldestportalinfo'
        });
        return;
    }
    
    window.plugin.oldestportal.sendPortalInfo = function (data) {
        var p = data.details;

        var r;
        var i;
        if (!p.captured) {
            r = '';
            i = 0
        } else {
            r = p.captured.capturingPlayerId;
            i = p.captured.capturedTime
        }
        var s = p.descriptiveText.map.ADDRESS;
        var o = window.plugin.oldestportal.ResoCheck(r.toLowerCase(), p.resonatorArray.resonators);

        $.post('http://www.angelic.it/ingressv2/ingressv2.php',{
            nickname: r,
            guid: data.guid,
            capturetime: i,
            faction: p.controllingTeam.team,
            lat: p.locationE6.latE6,
            lon: p.locationE6.lngE6,
            title: p.descriptiveText.map.TITLE,
            valid: o,
            address: s,
            nickReporter: window.PLAYER.nickname
        });
    }

    window.plugin.oldestportal.timeToDays = function (e) {
        var t = new Date;
        return parseInt(Math.abs(e - t.getTime()) / (24 * 60 * 60 * 1e3), 10);
    }

    window.plugin.oldestportal.DrawOldestPortalByPlayer = function (e) {
        $.post("http://www.angelic.it/ingressv2/ingressv2.php", {
            n: e.toLowerCase(),
            me: window.PLAYER.nickname
        }, function (t) {
            if (t == '') {
                dialog({
                    html: 'No player found with nickname: ' + e + '. Is this espionage?',
                    title: 'Oldest Portal Plugin V2 - NOT FOUND',
                    id: 'oldestportal'
                });
                return;
            }
            var n = t.split('{}');
            var arrayLength = n.length-1;
            var numrows = arrayLength/11;
          
            var a = n[10];
            
            var first='style="background-color: #E40000 !important;font-weight:bold;"';
            var daterFirst = window.plugin.oldestportal.timeToDays(n[1]);

            var image = '<td rowspan="5"></td>';//fix when capture is 0
            var grade = 0;
            if (daterFirst > 1 && daterFirst < 10) {
                grade = 1;
            } else if (daterFirst >= 10 && daterFirst < 20) {
                grade = 2;
            } else if (daterFirst >= 20 && daterFirst < 90) {
                grade = 3;
            } else if (daterFirst >= 90 && daterFirst < 150) {
                grade = 4;
            } else if (daterFirst < 10000 && daterFirst >= 150) {
                grade = 5;
            }
            if (grade !== 0) {
                image = '<td rowspan="5"><img src="http://www.angelic.it/ingressv2/guardian'+grade+'.png" alt="guardian"></td>';
            }       

            var u = 'Known Portals owned by <mark class="nickname" style="color:' + window.plugin.oldestportal.getFactionColor(n[2]) + '">' + n[0] +'</mark>: '+numrows+'<br/><br/>';
            u += '<table><tbody><th></th><th>Portal</th><th>Life</th><th>Valid</th><th>Reported By</th><th>Last recon</th>';

            for (var tc = 0; tc < numrows; tc++) {
                if (tc > 4) {
                    break;
                }
                var r = n[(tc*11)+3] * 1e-6;
                var i = n[(tc*11)+4] * 1e-6;
                var s = 'NO';
                if (n[(tc*11)+6]) s = 'YES';
                var dater = window.plugin.oldestportal.timeToDays(n[(tc*11)+1])+' days';
                if (n[(tc*11)+1]=="" || n[(tc*11)+1]==0)
                    dater = 'unknown';                           
                
                u+='<tr style="background-color: #1b415e !important;">'+image+'<td '+first+'><a onclick="window.map.setView(['+r.toFixed(6)+','+i.toFixed(6)+']);return false();">' + n[(tc*11)+5] + "</span></a>"
                    +'</td><td '+first+'>' + dater + ' </td>'
                    +'<td '+first+'>'+s+'</td>'
                    +'<td '+first+'>'+'<mark class="nickname" style="color:' + window.plugin.oldestportal.getFactionColor(n[(tc*11)+9]) + '">'+n[(tc*11)+8]+'</mark></td>'
                    +'<td '+first+'>'+n[(tc*11)+10]+'</td></tr>';
                first='';
                image='';
            }
            u += '</tbody></table>';

            var f = '<br/><div class="linkdetails"><aside><a onclick="window.plugin.oldestportal.showInfo();return false();" title="Oldest Portal Info">How does it Work?</a></aside></div>';
            dialog({
                html: u + '<br /><br />' + f,
                title: 'Oldest Portal Plugin V2',
                width: 'auto',
                id: 'oldestportal'
            });
        });
    }

    window.plugin.oldestportal.setupCSS = function(){
        $('<style>').prop('type', 'text/css').html(''
            +'.ui-dialog-oldestportal{width:auto !important; min-width:500px !important; max-width:500px !important;}'
            +'.ui-dialog-oldestportal table{border-collapse:collapse; clear:both;empty-cells:show; margin-top:10px;}'
            +'#playerOldPortal{font-size:80%;}'
        ).appendTo('head');
    }

    var setup = function () {
        window.plugin.oldestportal.setupCSS();
        $.post('http://www.angelic.it/ingressv2/ingressv2.php', {
            u: window.PLAYER.nickname,
            f: window.PLAYER.team,
            ap: window.PLAYER.ap,
            lev: window.PLAYER.level
        });

        var e = '<input id="playerOldPortal" placeholder="Type player name to find oldest portal" type="text">';
        $('#sidebar').append(e);
        $("#playerOldPortal").keypress(function (e) {
            if ((e.keyCode ? e.keyCode : e.which) !== 13) return;
            var t = $(this).val();
            window.plugin.oldestportal.DrawOldestPortalByPlayer(t);
        });

        window.addHook('portalDetailLoaded', window.plugin.oldestportal.sendPortalInfo);
    }

// PLUGIN END //////////////////////////////////////////////////////////
setup.info = plugin_info; //add the script info data to the function as a property
if(!window.bootPlugins) window.bootPlugins = [];
window.bootPlugins.push(setup);
// if IITC has already booted, immediately run the 'setup' function
if(window.iitcLoaded && typeof setup === 'function') 
setup();
} // wrapper end
// inject code into site context
var script = document.createElement('script');
var info = {};
if (typeof GM_info !== 'undefined' && GM_info && GM_info.script) 
info.script = { version: GM_info.script.version, name: GM_info.script.name, description: GM_info.script.description };
script.appendChild(document.createTextNode('('+ wrapper +')('+JSON.stringify(info)+');'));
(document.body || document.head || document.documentElement).appendChild(script);
