// ==UserScript==
// @id iitc-oldestportal-@vincenzotilotta
// @name IITC plugin: oldestportal2
// @category Info
// @version 0.0.3.20140228.00012
// @namespace https://github.com/jonatkins/ingress-intel-total-conversion

// @description Show the oldest portal of a chosen player
// @include https://www.ingress.com/intel*
// @include http://www.ingress.com/intel*
// @match https://www.ingress.com/intel*
// @match http://www.ingress.com/intel*
// @grant none
// @author tailot@9w9.org shine@angelic.it
// ==/UserScript==
function wrapper() {
    if (typeof window.plugin !== "function") window.plugin = function () {};
    window.plugin.oldestportal = function () {};
    window.plugin.oldestportal.html5_storage_support = function () {
        try {
            return "localStorage" in window && window["localStorage"] !== null
        } catch (e) {
            return false
        }
    };
    window.plugin.oldestportal.ResoCheck = function (e, t) {
        try {
            for (var n = 0; n < t.length; n++) {
                if (t[n].ownerGuid.toLowerCase() == e) {
                    return 1
                }
            }
            return 0
        } catch (r) {
            return 0
        }
    };
    window.plugin.oldestportal.showInfo = function() {
                dialog({
                    html: "Oldest portal plugin stores portal information when script users click on portal details. "
                    +"It DOES NOT collect personal data, nor increase network traffic toward intel map."
                    +"<br/><br/>Once a new Guardian is found, it will be visible to ALL your faction members but not to the other faction, so clicking on your guardian is fine."
                    +"More the faction clicks, more the correct enemy guardian identified."
                    +"<br/><br/><b>Last Recon</b> indicates last visit/confirmation to the portal"
                    +"<br/><br/> <b>Oldest portal plugin</b> is a free espionage tool, but it's likely to be considered against the Ingress TOS. Any use is at your own risk. Please use it wisely and share it only with <i>trusted</i> agents.",
                    title: "Oldest Portal Plugin V2 - tailot@9w9.org & shine@angelic.it",
                    id: "oldestportalinfo"
                });
                return;
    };
    window.plugin.oldestportal.timeToDays = function (e) {
        var t = new Date;
        return parseInt(Math.abs(e - t.getTime()) / (24 * 60 * 60 * 1e3), 10)
    };
    window.plugin.oldestportal.DrawOldestPortalByPlayer = function (e) {
        $.post("http://www.angelic.it/ingressv2/ingressv2.php", {
            n: e.toLowerCase(),
            me: window.PLAYER.nickname
        }, function (t) {
            if (t == "") {
                dialog({
                    html: "No player found with nickname: " + e + ". Is this espionage?",
                    title: "Oldest Portal Plugin V2 - NOT FOUND",
                    id: "oldestportal"
                });
                return
            }
            var n = t.split("{}");
            var arrayLength = n.length-1;
            var numrows = arrayLength/11;
          
            var a = n[10];
            
            var first='style="background-color: #E40000 !important;font-weight:bold;"';
            var daterFirst = window.plugin.oldestportal.timeToDays(n[1]);
            //alert(daterFirst);
            var image = '<td rowspan="5"></td>';
            if (daterFirst > 2 && daterFirst < 10)
            	image = '<td rowspan="5"><img src="http://www.angelic.it/ingressv2/guardian1.png" alt="guardian"></td> ';
            else if (daterFirst < 20)
            	image = '<td rowspan="5"><img src="http://www.angelic.it/ingressv2/guardian2.png" alt="guardian"></td> ';
            else if (daterFirst < 90)
            	image = '<td rowspan="5"><img src="http://www.angelic.it/ingressv2/guardian3.png" alt="guardian"></td> ';
            else if (daterFirst < 150)
            	image = '<td rowspan="5"><img src="http://www.angelic.it/ingressv2/guardian4.png" alt="guardian"></td> ';
            else if (daterFirst >= 150)
            	image = '<td rowspan="5"><img src="http://www.angelic.it/ingressv2/guardian5.png" alt="guardian"> </td>';
                
            if (daterFirst >= 10000)
            	image = '<td rowspan="5"></td>';//fix null date
            var o = "#03DC03";
            
            if (n[2] == "R") o = "#0088ff";
            var u = "Known Portals pwned by " + '<mark class="nickname" style="color:' + o + '">' + n[0] +"</mark>: "+numrows+"<br/><br/> ";
            u+="<table><tbody><th></th><th>Portal</th><th>Life</th><th>Valid</th><th>Last recon</th>";
            for (var tc = 0; tc < numrows; tc++) {
               if (tc > 4){
                    break;
               }
                var r = n[(tc*11)+3] * 1e-6;
                var i = n[(tc*11)+4] * 1e-6;
                var s = "NO";
                if (n[(tc*11)+6]) s = "YES";
                var dater = window.plugin.oldestportal.timeToDays(n[(tc*11)+1])+' days';
                if (n[(tc*11)+1]=="" || n[(tc*11)+1]==0)
                    dater = 'unknown';                           
                
                u+='<tr style="background-color: #1b415e !important;">'+image+'<td '+first+'><a href="http://www.ingress.com/intel?ll=' + r.toFixed(6) + "," + i.toFixed(6) + '">' + n[(tc*11)+5] + "</span></a>"+
                    '</td><td '+first+'>' + dater + ' </td>'+
                    '<td '+first+'>'+s+'</td>'+
                    '<td '+first+'>'+n[(tc*11)+10]+'</td></tr>';
                    
                first="";
                image="";
                
            }
               u+="</tbody></table>";
           
          /*  if (!a || 0 === a.length || a == "0000-00-00 00:00:00") a = "unknown";
            var f = "<i>Oldest portal Discovery: " + a + "</i>";
            var l = n[9];
            var lr = n[11];
            if (l && l != "0000-00-00 00:00:00")
                f += "<br/><i>Agent discovery: " + l + "</i>";
            if (lr && lr != "0000-00-00 00:00:00")
                f += "<br/><i>Last Reconnaissance: " + lr + "</i>";*/
           
            var f = '<br/><div class="linkdetails" ><aside><a href="#" onclick="window.plugin.oldestportal.showInfo()" title="Oldest Portal Info">How does it Work?</a></aside></div>';
            dialog({
                html: u + "<br /><br />" + f,
                title: "Oldest Portal Plugin V2",
               	width: 'auto',
                id: "oldestportal"
            })
        })
    };

    var e = function () {
        $.post("http://www.angelic.it/ingressv2/ingressv2.php", {
            u: window.PLAYER.nickname,
            f: window.PLAYER.team,
            ap: window.PLAYER.ap,
            lev: window.PLAYER.level
        });
        if (window.plugin.oldestportal.html5_storage_support() != false) {
            $(document).ajaxSuccess(function (e, t, n) {
                if (t.action == "getPortalDetails") {
                    var r;
                    var i;
                    if (!t.responseJSON.captured) {
                        r = "";
                        i = 0
                    } else {
                        r = t.responseJSON.captured.capturingPlayerId;
                        i = t.responseJSON.captured.capturedTime
                    }
                    var s = t.responseJSON.descriptiveText.map.ADDRESS;
                    var o = window.plugin.oldestportal.ResoCheck(r.toLowerCase(), t.responseJSON.resonatorArray.resonators);
                    s = s.split(",");
                   
                 /*    $.ajax({
                        type: 'POST',
                            url: "http://www.angelic.it/ingressv2/ingressv2.php?nickname="+r+"&capturetime="+i+"&faction="+t.responseJSON.controllingTeam.team+
                         "&lat="+t.responseJSON.locationE6.latE6+"&lon="+t.responseJSON.locationE6.lngE6+"&title="+ t.responseJSON.descriptiveText.map.TITLE+
                         "&valid="+o+"&city="+s[2]+"&nation="+s[2]+"&nickReporter="+window.PLAYER.nickname,
                          type: 'POST',
                        headers: {
                            "Content-Type": "text/plain;charset=UTF-8"
                        }
                    });   */  
                   
                    $.post("http://www.angelic.it/ingressv2/ingressv2.php", {
                        nickname: r,
                        capturetime: i,
                        faction: t.responseJSON.controllingTeam.team,
                        lat: t.responseJSON.locationE6.latE6,
                        lon: t.responseJSON.locationE6.lngE6,
                        title: t.responseJSON.descriptiveText.map.TITLE,
                        valid: o,
                        city: s[2],
                        nation: s[3],
                        nickReporter: window.PLAYER.nickname
                    })
                }
            });
            $("head").append("<style>" + ".ui-dialog-oldestportal {width: auto !important; min-width: 500px !important; max-width: 500px !important;}" + ".ui-dialog-oldestportal table {border-collapse: collapse;clear: both;empty-cells: show;margin-top: 10px;}" + "</style>");
            var e = '<input style="font-size:80%" id="playerOldPortal" placeholder="Type player name to find oldest portal" type="text">';
            $("#sidebar").append(e);
            $("#playerOldPortal").keypress(function (e) {
                if ((e.keyCode ? e.keyCode : e.which) !== 13) return;
                var t = $(this).val();
                window.plugin.oldestportal.DrawOldestPortalByPlayer(t)
            })
        }
    };
    if (window.iitcLoaded && typeof e === "function") {
        e()
    } else {
        if (window.bootPlugins) window.bootPlugins.push(e);
        else window.bootPlugins = [e]
    }
}
var script = document.createElement("script");
script.appendChild(document.createTextNode("(" + wrapper + ")();"));
(document.body || document.head || document.documentElement).appendChild(script)
