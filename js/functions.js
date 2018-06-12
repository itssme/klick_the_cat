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
var total_disk_space = 0;
var used_disk_space = 0;


function initMiners(miner_json) {
    cross_per_turn = miner_json["cross_per_turn"];
    document.getElementById("money_turn").innerHTML = cross_per_turn;
    console.log(miner_json.miner);
    blus_upgrades = miner_json["miner"];

    unlocks = Array(blus_upgrades.length);

    for (let i = 0; i < blus_upgrades.length; i++) {
        unlocks[i] = false;
        hr = "";
        if (i < blus_upgrades.length - 1) {hr = "<hr>"}

        html = "<span id='miner_" + i +"'><code id='content_miner_" + i + "'><b>" + blus_upgrades[i][5] + "</b>|<code id='actioncost_" + i + "'>" + blus_upgrades[i][2]
            +"</code>  Blus|-"  + formatBytes(blus_upgrades[i][4]) + "|" + blus_upgrades[i][3] + "B Unlock</code><br><button onclick='add(" + i + ",false)' class='myButton'" +
            ">Buy</button><button id=\'unlock_" + i + "\' onclick='unlock(" +  i + ","+ blus_upgrades[i][3] +", \"unlock_" + i + "\")' class='myButton'><code>Unlock</code></button>" + hr + "</span>";

        document.getElementById('miners').innerHTML += html;

    }
}


function initDiskspace(diskspace_json) {
    total_disk_space = diskspace_json["total_disk_space"];
    console.log(diskspace_json.disks);
    disk_upgrades = diskspace_json["disks"];

    document.getElementById("total_disk_space").innerText = formatBytes(total_disk_space);
    document.getElementById("available_disk_space").innerText = formatBytes(total_disk_space-getUsedDiskSpace());

    unlocks_disk = Array(disk_upgrades.length);

    for (let i = 0; i < disk_upgrades.length; i++) {
        unlocks_disk[i] = true; // set true for testing and until storage unlocks are not implemented

        hr = "";
        if (i < disk_upgrades.length - 1) {hr = "<hr>"}

        html = "<span id='disk_" + i +"'><code id='content_disk_" + i +"'>Cost " + disk_upgrades[i][2]
            +"  Storage Space " + disk_upgrades[i][1] +"KB</code><br><button onclick='addDiskSpace(" + i + ",false)' class='myButton'" +
            " style='width: 200px; height: 25px;'><code>" + disk_upgrades[i][4] + "</code></button>" + hr + "</span>";

        document.getElementById('disks').innerHTML += html;
    }

    drawPie();
}

function initMinus(minus_json) {
    minus_upgrades = minus_json["minus"];

    unlocks_minus = Array(minus_upgrades.length)

    for (let i = 0; i < minus_upgrades.length; i++) {
        unlocks_minus[i] = true; // set true for testing and until minus unlocks are not implemented

        hr = "";
        if (i < minus_upgrades.length - 1) {hr = "<hr>"}

        html = "<span id='minus_" + i +"'><code id='content_minus_" + i +"'>Cost " + minus_upgrades[i][2]
            +"  Minus -" + minus_upgrades[i][1] +"B/s</code><br><button onclick='sendMinus(" + i + ",false)' class='myButton'" +
            " style='width: 200px; height: 25px;'><code>" + minus_upgrades[i][4] + "</code></button>" + hr + "</span>";

        document.getElementById('minus_upgrade').innerHTML += html;
    }
}


function sendMinus(minus_id, buy_all) {
    if (minus_upgrades[minus_id][2] <= current_counter_money && unlocks_minus[minus_id]) {
        console.log("send minus");
        user_selection = document.getElementById("minus_name_selection");
        user_selection = user_selection.options[user_selection.selectedIndex].value;

        socket.emit('send_minus', '{"user_id":"' + user_selection + '", "minus_id":"' + minus_id + '"}');
    }
}


function addDiskSpace(disk_id, buy_all) {
    if (disk_upgrades[disk_id][2] <= current_counter_money && unlocks_disk[disk_id]) {
        disk_upgrades[disk_id][0] += 1;

        total_disk_space += disk_upgrades[disk_id][1];
        current_counter_money -= disk_upgrades[disk_id][2];

        document.getElementById("total_disk_space").innerText = formatBytes(total_disk_space);
        document.getElementById("available_disk_space").innerText = formatBytes(total_disk_space-getUsedDiskSpace());

        drawPie();
    }
}


function getUsedDiskSpace() {
    sum = 0;
    for (let i = 0; i < blus_upgrades.length; i++) {
        sum += blus_upgrades[i][0] * blus_upgrades[i][4];
    }

    // TODO: do the same for the minus_upgrades
    return sum;
}


function formatBytes(kbytes) {
    bytes = kbytes * 1024;
    if(bytes < 1024) return bytes + " Bytes";
    else if(bytes < 1048576) return(bytes / 1024).toFixed(2) + " KB";
    else if(bytes < 1073741824) return(bytes / 1048576).toFixed(2) + " MB";
    else return(bytes / 1073741824).toFixed(2) + " GB";
}


function add(miner_id, buy_all) {
    if (blus_upgrades[miner_id][2] <= current_counter_money && unlocks[miner_id] && blus_upgrades[miner_id][4] <=
                                                                                    total_disk_space-used_disk_space) {
        blus_upgrades[miner_id][0] += 1;

        cross_per_turn += blus_upgrades[miner_id][1];
        current_counter_money -= blus_upgrades[miner_id][2];

        x = blus_upgrades[miner_id][2];
        blus_upgrades[miner_id][2] += (Math.sin(x*0.01)*200+x)/100;
        current_counter_money = parseFloat(current_counter_money.toFixed(4));
        cross_per_turn = parseFloat(cross_per_turn.toFixed(4));
        blus_upgrades[miner_id][2] = parseFloat(blus_upgrades[miner_id][2].toFixed(2));
        document.getElementById("actioncost_" + miner_id).innerText = blus_upgrades[miner_id][2];
        document.getElementById("money_turn").innerHTML = cross_per_turn;
        document.getElementById("miner_anz").innerHTML = blus_upgrades[miner_id][0];
        document.getElementById("user_money").innerHTML = current_counter_money;
        document.getElementById("total_disk_space").innerText = formatBytes(total_disk_space);
        document.getElementById("available_disk_space").innerText = formatBytes(total_disk_space-getUsedDiskSpace());
        drawPie();
    }
}


function over_line() {
    counter += multip ;
    current_counter_money += 1;
    
    current_counter_money = parseFloat(current_counter_money.toFixed(4));
    counter = parseFloat(counter.toFixed(4));
    
    document.getElementById("user_counter").innerHTML = counter;
    document.getElementById("user_money").innerHTML = current_counter_money;
    
}


function unlock(miner_id, cost, remo_id) {
    if (cost <= current_counter_money) {
        unlocks[miner_id] = true;
        current_counter_money -= cost;
        
        document.getElementById("user_money").innerHTML = current_counter_money;
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
        multip_array[id] = true;
        
        document.getElementById("user_money").innerHTML = current_counter_money;
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
    current_counter_money = parseFloat(current_counter_money.toFixed(4));
    
    miner_counter += cross_per_turn / 10;
    miner_counter = parseFloat(miner_counter.toFixed(2));
    
    document.getElementById("miner_counter").innerHTML = miner_counter;
    document.getElementById("user_money").innerHTML = current_counter_money;
}

setInterval(drawPie, 2000);
function drawPie() {
    dataPoints_array = [];
    total_usage = [];

    for (let i = 0; i < blus_upgrades.length; i++) {
        total_usage.push([blus_upgrades[i][0] * blus_upgrades[i][4], blus_upgrades[i][5]]);
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
        console.log('message: ' + msg);
        initMiners(JSON.parse(msg));
    });

    socket.on('config_diskspace', function(msg) {
        console.log('message: ' + msg);
        initDiskspace(JSON.parse(msg));
    });

    socket.on('config_minus', function(msg) {
        console.log('message: ' + msg);
        initMinus(JSON.parse(msg));
    });

    socket.emit('username', '{"username": "' + username + '"}');

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
    
    socket.on('got_minus', function (msg) {
        minus = JSON.parse(msg);
        cross_per_turn -= minus["minus"];
    });
}

setInterval(get_users, 200);
function get_users() {
    socket.emit('sync', '{"id": "' + user_id + '", "username": "' + username + '", "blus": "' + cross_per_turn + '"}');
}

function compare(a,b) {
    if (parseInt(a.blus) < parseInt(b.blus))
        return 1;
    if (parseInt(a.blus) > parseInt(b.blus))
        return -1;
    return 0;
}

function updateLeaderboard() {
    var leaderboard = document.getElementById("leaderList");
    var dropdown = document.getElementById("minus_name_selection");
    users.sort(compare);
    leaderboard.innerHTML = "";
    dropdown.innerHTML = "";
    var i = 1;
    users.forEach(function (user) {
        var newRow   = leaderboard.insertRow(leaderboard.rows.length);
        newRow.insertCell(0).appendChild(document.createTextNode(i + "."));
        newRow.insertCell(1).appendChild(document.createTextNode(user.name));
        newRow.insertCell(2).appendChild(document.createTextNode(user.blus + " B/s"));
        var option = '<option value="' + user.id + '">' + user.name + '</option>';
        dropdown.innerHTML += option;
        i++;
    });
}

function updateUsers(id, username, blus) {
    users.forEach(function(user) {
        if (user.id == id) {
            user.blus = blus;
        }
    });
    if(users.filter(function (user) { return user.id == id; }).length == 0) {
        users.push({"id": id, "name": username, "blus": blus});
    }
    updateLeaderboard();
}

function deleteUser(id) {
    users = users.filter(function (user) { return user.id != id });
    updateLeaderboard();
}

var user_id = -1;
var username = "";
username = prompt("Please enter your name:", "Schmuserkadser");
while (username == null || username == "" || username.length > 15) {
    if (username.length > 15) {
        alert("Der Name darf höchstens 15 Zeichen lang sein!");
    }else{
        alert("Ungültiger Name!");
    }
    username = prompt("Please enter your name:", "Schmuserkadser");
}
initServer();