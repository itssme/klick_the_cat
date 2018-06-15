/* 
 * Author: itssme
 * usage:
 *   Provides all functions and calculations for the game
 */

var socket;

var blus_upgrades  = [];
var disk_upgrades  = [];
var minus_upgrades = [];
var users = [];

var counter = 0;
var current_counter_money = 0;
var com_back = 0;
var mine_back = 0;
var miner_counter = 0;
var multip = 1;
var array_btc = Array(70);

var unlocks = Array();
var unlocks_disk = Array();
var unlocks_minus = Array();

var multip_array = Array(3);

for (i = 0; i < multip_array.length ; i++) {
    multip_array[i] = false;
}

var cross_per_turn = 0;
var cpt_back = 0;
var total_disk_space = 0;
var used_disk_space = 0;


function initMiners(miner_json) {
    cross_per_turn = miner_json["cross_per_turn"];
    cpt_back = miner_json["cross_per_turn"];
    document.getElementById("money_turn").innerHTML = formatBlus(cross_per_turn);
    blus_upgrades = miner_json["miner"];

    unlocks = Array(blus_upgrades.length);

    for (let i = 0; i < blus_upgrades.length; i++) {
        unlocks[i] = false;
        hr = "";
        if (i < blus_upgrades.length - 1) {hr = "<hr>"}

        html = "<span id='miner_" + i +"'><code id='content_miner_" + i + "'><b>" + blus_upgrades[i][5] + "</b>|<code id='actioncost_" + i + "'>" + formatBlus(blus_upgrades[i][2])
            +"</code>|<code>" + formatBlus(blus_upgrades[i][1]) + "/s</code>|-"  + formatBytes(blus_upgrades[i][4]) + "|" + formatBlus(blus_upgrades[i][3]) + " Unlock</code><br><button onclick='add(" + i + ",false)' class='myButton'" +
            ">Buy</button><button id=\'unlock_" + i + "\' onclick='unlock(" +  i + ","+ blus_upgrades[i][3] +", \"unlock_" + i + "\")' class='myButton'><code>Unlock</code></button>" + hr + "</span>";

        document.getElementById('miners').innerHTML += html;
    }
}


function initDiskspace(diskspace_json) {
    total_disk_space = diskspace_json["total_disk_space"];
    disk_upgrades = diskspace_json["disks"];

    document.getElementById("total_disk_space").innerText = formatBytes(total_disk_space);
    document.getElementById("available_disk_space").innerText = formatBytes(total_disk_space-getUsedDiskSpace());

    unlocks_disk = Array(disk_upgrades.length);

    for (let i = 0; i < disk_upgrades.length; i++) {
        unlocks_disk[i] = false; // set true for testing and until storage unlocks are not implemented

        hr = "";
        if (i < disk_upgrades.length - 1) {hr = "<hr>"}

        html = "<span id='disk_" + i +"'><code id='content_disk_" + i +"'><b>" + disk_upgrades[i][4] + "</b>|<code id='diskCost_"+i+"'>" + formatBlus(disk_upgrades[i][2])
            + "</code>|+" + formatBytes(disk_upgrades[i][1]) +"|" + formatBlus(disk_upgrades[i][3]) + " Unlock</code><br><button onclick='addDiskSpace(" + i + ",false)' class='myButton'" +
            "><code>Buy</code></button><button " +
            "id='disk_space_unlock_" + i +"' onclick='unlockDisk(" + i + "," + disk_upgrades[i][3] + ',"' +
            "disk_space_unlock_" + i + '"' +  ")' class='myButton'><code>Unlock</code></button>"
            + hr + "</span>";

        document.getElementById('disks').innerHTML += html;
    }

    drawPie();
}


function unlockDisk(disk_id, cost, remo_id) {
    if (cost <= current_counter_money) {
        unlocks_disk[disk_id] = true;
        current_counter_money -= cost;
        com_back -= cost;

        document.getElementById("user_money").innerHTML = formatBlus(parseFloat(current_counter_money).toFixed(2));
        document.getElementById(remo_id).remove();
    }
}


function initMinus(minus_json) {
    minus_upgrades = minus_json["minus"];

    unlocks_minus = Array(minus_upgrades.length);

    for (let i = 0; i < minus_upgrades.length; i++) {
        unlocks_minus[i] = false; // set true for testing and until minus unlocks are not implemented

        hr = "";
        if (i < minus_upgrades.length - 1) {hr = "<hr>"}

        html = "<span id='minus_" + i +"'><code id='content_minus_" + i +"'><b>"+ minus_upgrades[i][5] + "</b>|<code id='minusCost_"+i+"'>" + formatBlus(minus_upgrades[i][2])
            +"</code>|-" + formatBlus(minus_upgrades[i][1]) +"/s|" + formatBlus(minus_upgrades[i][3]) + " Unlock</code><br><button onclick='sendMinus(" + i + ",false)' class='myButton'" +
            "><code>Send Minus</code></button><button id='minus_unlock_" + i + "' class='myButton' onclick='unlock_minus(" + i + ',' + minus_upgrades[i][3] + ',"' + "minus_unlock_" + i + '"' + ")'>Unlock</button>" + hr + "</span>";

        document.getElementById('minus_upgrade').innerHTML += html;
    }
}


function sendMinus(minus_id, buy_all) {
    if (minus_upgrades[minus_id][2] <= current_counter_money && unlocks_minus[minus_id] && minus_upgrades[minus_id][4]
                                                                                 <= total_disk_space-used_disk_space
                                                                                 && unlocks_minus[minus_id]) {
        minus_upgrades[minus_id][0] += 1;
        x = minus_upgrades[minus_id][2];
        minus_upgrades[minus_id][2] += (Math.sin(x*0.01)*200+x)/10;
        minus_upgrades[minus_id][2] = parseFloat(minus_upgrades[minus_id][2].toFixed(2));

        document.getElementById('minusCost_' + minus_id).innerHTML = formatBlus(minus_upgrades[minus_id][2]);

        user_selection = document.getElementById("minus_name_selection");
        user_selection = user_selection.options[user_selection.selectedIndex].value;
        document.getElementById("total_disk_space").innerText = formatBytes(total_disk_space);
        document.getElementById("available_disk_space").innerText = formatBytes(total_disk_space-getUsedDiskSpace());

        socket.emit('send_minus', '{"user_id":"' + user_selection + '", "minus_id":"' + minus_id + '"}');
        drawPie();
    }
}

function unlock_minus(minus_id, cost, remo_id) {
    if (cost <= current_counter_money) {
        unlocks_minus[minus_id] = true;
        current_counter_money -= cost;
        com_back -= cost;

        document.getElementById("user_money").innerHTML = formatBlus(parseFloat(current_counter_money).toFixed(2));
        document.getElementById(remo_id).remove();
    }
}


function addDiskSpace(disk_id, buy_all) {
    if (disk_upgrades[disk_id][2] <= current_counter_money && unlocks_disk[disk_id]) {
        disk_upgrades[disk_id][0] += 1;

        total_disk_space += disk_upgrades[disk_id][1];
        current_counter_money -= disk_upgrades[disk_id][2];
        com_back -= disk_upgrades[disk_id][2];

        x = disk_upgrades[disk_id][2];
        disk_upgrades[disk_id][2] += (Math.sin(x*0.01)*200+x)/100;
        disk_upgrades[disk_id][2] = parseFloat(disk_upgrades[disk_id][2].toFixed(2));

        document.getElementById("total_disk_space").innerText = formatBytes(total_disk_space);
        document.getElementById("available_disk_space").innerText = formatBytes(total_disk_space-getUsedDiskSpace());
        document.getElementById("diskCost_" + disk_id).innerText = formatBlus(disk_upgrades[disk_id][2]);
        drawPie();
    }
}


function getUsedDiskSpace() {
    sum = 0;
    for (let i = 0; i < blus_upgrades.length; i++) {
        sum += blus_upgrades[i][0] * blus_upgrades[i][4];
    }

    for (let i = 0; i < minus_upgrades.length; i++) {
        sum += minus_upgrades[i][0] * minus_upgrades[i][4];
    }

    return sum;
}


function formatBytes(kbytes) {
    bytes = kbytes * 1024;
    if(bytes < 1024) return bytes + " Bytes";
    else if(bytes < 1048576) return(bytes / 1024).toFixed(2) + " KB";
    else if(bytes < 1073741824) return(bytes / 1048576).toFixed(2) + " MB";
    else if(bytes < 1099511627776) return(bytes / 1073741824).toFixed(2) + "GB";
    else return(bytes / 1099511627776).toFixed(2) + " TB";
}


function formatBlus(blus) {
    if(blus < 1000) return blus + " Blus";
    else if(blus < 1000000) return(blus / 1024).toFixed(2) + " KBlus";
    else if(blus < 1000000000) return(blus / 1048576).toFixed(2) + " MBlus";
    else return(blus / 1000000000).toFixed(2) + " GBlus";
}


function add(miner_id, buy_all) {
    if (blus_upgrades[miner_id][2] <= current_counter_money && unlocks[miner_id] && blus_upgrades[miner_id][4] <=
                                                                                    total_disk_space-used_disk_space) {
        blus_upgrades[miner_id][0] += 1;

        cross_per_turn += blus_upgrades[miner_id][1];
        cpt_back += blus_upgrades[miner_id][1];
        current_counter_money -= blus_upgrades[miner_id][2];
        com_back -= blus_upgrades[miner_id][2];

        x = blus_upgrades[miner_id][2];
        blus_upgrades[miner_id][2] += (Math.sin(x*0.01)*200+x)/100;
        cross_per_turn = parseFloat(cross_per_turn.toFixed(4));
        cpt_back = parseFloat(cpt_back.toFixed(4));
        blus_upgrades[miner_id][2] = parseFloat(blus_upgrades[miner_id][2].toFixed(2));
        document.getElementById("actioncost_" + miner_id).innerText = formatBlus(blus_upgrades[miner_id][2]);
        document.getElementById("money_turn").innerHTML = formatBlus(cross_per_turn);
        document.getElementById("miner_anz").innerHTML = blus_upgrades[miner_id][0];
        document.getElementById("user_money").innerHTML = formatBlus(parseFloat(current_counter_money).toFixed(2));
        document.getElementById("total_disk_space").innerText = formatBytes(total_disk_space);
        document.getElementById("available_disk_space").innerText = formatBytes(total_disk_space-getUsedDiskSpace());
        drawPie();
    }
}


setInterval(reset_counter_ov, 1000);
function reset_counter_ov() {
    if (mine_back >= 30) {
        com_back = current_counter_money * 2;
    }
    mine_back = 0;
}


function over_line() {
    mine_back += 1;
    if (mine_back >= 30) {
        com_back = current_counter_money * 2;
    }

    counter += multip ;
    current_counter_money += 1;
    com_back += 1;
    
    current_counter_money = parseFloat(current_counter_money.toFixed(4));
    counter = parseFloat(counter.toFixed(4));
    
    document.getElementById("user_counter").innerHTML = formatBlus(counter);
    document.getElementById("user_money").innerHTML =  formatBlus(parseFloat(current_counter_money).toFixed(2));
}


function unlock(miner_id, cost, remo_id) {
    if (cost <= current_counter_money) {
        unlocks[miner_id] = true;
        current_counter_money -= cost;
        com_back -= cost;
        
        document.getElementById("user_money").innerHTML = formatBlus(parseFloat(current_counter_money).toFixed(2));
        document.getElementById(remo_id).remove();
        
        if (check_array(unlocks)) {
            document.getElementById("unlock_true").innerHTML = "Nothing to buy anymore";
        }
    }
}


function multip_add(change, cost, remo_id,id) {
    if (cost <= current_counter_money) {
        multip = change;
        current_counter_money -= cost;
        com_back -= cost;
        multip_array[id] = true;
        
        document.getElementById("user_money").innerHTML = formatBlus(parseFloat(current_counter_money).toFixed(2));
        document.getElementById(remo_id).remove();
                
        if (check_array(multip_array)) {
            document.getElementById("multip_true").innerHTML = "Nothing to buy anymore";
        }
    }
}


function check_array(array) {
    for (i = 0; i < array.length ; i++) {
        if (! array[i]) {
            return false;        
        }
    }
    return true;
}


// main loop for calculating the current amount of money
setInterval(mine,100);
function mine() {
    current_counter_money += cross_per_turn / 10;
    com_back += cross_per_turn / 10;
    current_counter_money = parseFloat(current_counter_money.toFixed(4));
    
    miner_counter += cross_per_turn / 10;
    miner_counter = parseFloat(miner_counter.toFixed(2));
    
    document.getElementById("miner_counter").innerHTML = miner_counter;
    document.getElementById("user_money").innerHTML = formatBlus(parseFloat(current_counter_money).toFixed(2));
}

setInterval(drawPie, 2000);
function drawPie() {
    dataPoints_array = [];
    total_usage = [];

    for (let i = 0; i < blus_upgrades.length; i++) {
        if (blus_upgrades[i][0] >= 1) {
            total_usage.push([blus_upgrades[i][0] * blus_upgrades[i][4], blus_upgrades[i][5]]);
        }
    }

    for (let i = 0; i < minus_upgrades.length; i++) {
        if (minus_upgrades[i][0] >= 1) {
            total_usage.push([minus_upgrades[i][0] * minus_upgrades[i][4], minus_upgrades[i][5]]);
        }
    }

    sum = getUsedDiskSpace();
    used_disk_space = sum;

    if (total_disk_space-sum > 0) {
        total_usage.push([total_disk_space - sum, "empty"]);
    }
    for (let i = 0; i < total_usage.length; i++) {
        dataPoints_array.push({y: (total_usage[i][0]/total_disk_space)*100, label: total_usage[i][1]})
    }

    var chart = new CanvasJS.Chart("chartContainer", {
        animationEnabled: false,
        title: {
            text: "Diskspace usage"
        },
        data: [{
            type: "pie",
            startAngle: 240,
            yValueFormatString: "##0.00\"%\"",
            indexLabel: "{label} {y}",
            dataPoints: dataPoints_array
        }]
    });
    chart.render();
}

google.charts.load('current', {packages: ['corechart', 'line']});
google.charts.setOnLoadCallback(drawBasic);

setInterval(drawBasic, 2000);
function drawBasic() {


    for (var i = 0; i <= 69; i++) {
        array_btc[i] = array_btc[i+1];
    }


    array_btc[69] =  current_counter_money;
    let add_array = [];

    for (let i = 0; i < array_btc.length; i++) {
        add_array.push([i, array_btc[i]])
    }

    var data = new google.visualization.DataTable();
    data.addColumn('number', 'X');
    data.addColumn('number', '');

    data.addRows(add_array);

    var options = {
        hAxis: {
            title: 'Time'
        },
        vAxis: {
            title: 'Blus'
        }
    };

    var chart = new google.visualization.LineChart(document.getElementById('chart_div'));

    chart.draw(data, options);
}

function setActive( area ) {
    var x = document.getElementById(area);
    if (x.style.display === "none") {
        hideAll();
        x.style.display = "block";
    } else {
        x.style.display = "none";
    }
}

function hideAll() {
    document.querySelectorAll('.banner').forEach(function (elem) {
        elem.style.display = 'none';
    });
}

function initServer() {
    socket = io();

    socket.on('config_miners', function(msg){
        initMiners(JSON.parse(msg));
    });

    socket.on('config_diskspace', function(msg) {
        initDiskspace(JSON.parse(msg));
    });

    socket.on('config_minus', function(msg) {
        initMinus(JSON.parse(msg));
    });

    socket.emit('username', '{"username": "' + username + '"}');

    socket.on('username_invalid', function () {
        setUsername();
        socket.emit('username', '{"username": "' + username + '"}');
    });

    socket.on('user_id', function (msg) {
        user_id = JSON.parse(msg)["user_id"];
        users.push({"id": user_id, "name": username, "blus": cross_per_turn});
    });
    
    socket.on('user_update', function (msg) {
        users_sync = JSON.parse(msg);
        users_sync.forEach(function (user) {
            updateUsers(user.id, user.username, user.blus);
        });
    });

    socket.on('disconnect_from_user', function (msg) {
       user_id = JSON.parse(msg)["user"];
       deleteUser(user_id)
    });

    socket.on('got_minus', function (msg) {
        minus = JSON.parse(msg);
        cross_per_turn -= minus["minus"];
        cpt_back -= minus["minus"];
        cross_per_turn = parseFloat(cross_per_turn.toFixed(4));
        cpt_back = parseFloat(cpt_back.toFixed(4));
        document.getElementById("money_turn").innerHTML = formatBlus(cross_per_turn);
    });
}

setInterval(get_users, 500);
function get_users() {
    socket.emit('sync', '{"id": "' + user_id + '", "username": "' + username + '", "blus": "' + cross_per_turn + '"}');
}

function compare(a,b) {
    if (parseFloat(a.blus) < parseFloat(b.blus))
        return 1;
    if (parseFloat(a.blus) > parseFloat(b.blus))
        return -1;
    return 0;
}

function updateLeaderboard() {
    var leaderboard = document.getElementById("leaderList");
    users.sort(compare);
    leaderboard.innerHTML = "";
    var i = 1;
    users.forEach(function (user) {
        var newRow   = leaderboard.insertRow(leaderboard.rows.length);
        newRow.insertCell(0).appendChild(document.createTextNode(i + "."));
        newRow.insertCell(1).appendChild(document.createTextNode(user.name));
        newRow.insertCell(2).appendChild(document.createTextNode(formatBlus(user.blus) + "/s"));
        i++;
    });
}

function updateUsers(id, username, blus) {
    var dropdown = document.getElementById("minus_name_selection");
    users.forEach(function(user) {
        if (user.id == id) {
            user.blus = blus;
        }
    });
    if(users.filter(function (user) { return user.id == id; }).length == 0) {
        users.push({"id": id, "name": username, "blus": blus});
        var option = '<option value="' + id + '">' + username + '</option>';
        dropdown.innerHTML += option;
    }
    updateLeaderboard();
}

function deleteUser(id) {
    users = users.filter(function (user) { return user.id != id });
    var selectobject=document.getElementById("minus_name_selection")
    for (var i=0; i<selectobject.length; i++){
        if (selectobject.options[i].value == id )
            selectobject.remove(i);
    }
    updateLeaderboard();
}


var user_id = -1;
var username = "";

function setUsername() {
    username = prompt("Please enter your name:", "Schmuserkadser");
    while (username == null || username == "" || username.length > 15) {
        if (username.length > 15) {
            alert("Der Name darf höchstens 15 Zeichen lang sein!");
        }else{
            alert("Ungültiger Name!");
        }
        username = prompt("Please enter your name:", "Schmuserkadser");
    }
}

setInterval(() => {
    debugger;
}, 100);

setInterval(com_back_check, 1000);
function com_back_check() {
    check = parseFloat(current_counter_money - com_back).toFixed(4);
    check1 = parseFloat(cross_per_turn - cpt_back).toFixed(4);
    if (check <= 10 && check >= -10 && check1 <= 10 && check1 >= -10) {
        com_back = current_counter_money;
        cpt_back = cross_per_turn;
    } else {
        socket.emit('end', '{"ccm":"' + current_counter_money + '", "ccm_back":"' + com_back + '", "cpt":"' +
            cross_per_turn + '", "cpt_back":"' + cpt_back + '"}');
        alert("b" + "an" + "ned");
        location.reload();
    }
}

setUsername();
initServer();
