/* 
 * Author: itssme
 * usage:
 *   Provides all functions and calculations for the game
 */

var blus_upgrades = [];

var disk_space_upgrades = [];
disk_space_upgrades.push([0, 10, 100]); // Mgnetband
disk_space_upgrades.push([0, 50, 750, 25000]);

var unlocks = Array(6);

for (i = 0; i < unlocks.length ; i++) {
    unlocks[i] = false;
}

var multip_array = Array(3);

for (i = 0; i < multip_array.length ; i++) {
    multip_array[i] = false;
}

var cross_per_turn = 0;

function initMiners(miner_json) {
    console.log(miner_json.miner);
    blus_upgrades = miner_json["miner"];

    for (let i = 0; i < blus_upgrades.length; i++) {
        hr = "";
        if (i < blus_upgrades.length - 1) {hr = "<hr>"}

        html = "<span id='miner_" + i +"'><code id='content_miner_" + i +"'>Cost " + blus_upgrades[i][2]
            +"  Blus " + blus_upgrades[i][1] +"</code><br><button onclick='add(" + i + ",false)' class='myButton'" +
            "style='width: 200px; height: 25px;'><code>" + blus_upgrades[i][5] + "</code></button>" + hr + "</span>";

        document.getElementById('miners').innerHTML += html;
    }
}


function add(miner_id, buy_all) {
    if (blus_upgrades[miner_id][2] <= current_counter_money && unlocks[miner_id]) {
        blus_upgrades[miner_id][0] += 1;
        blus_upgrades[miner_id][2] = parseFloat(blus_upgrades[miner_id][2].toFixed(2));
        document.getElementById("content_miner_" + miner_id).innerText = "Cost " + blus_upgrades[miner_id][2] +
                                " Blus " + blus_upgrades[miner_id][1];
        cross_per_turn += blus_upgrades[miner_id][1];
        current_counter_money -= blus_upgrades[miner_id][2];
        blus_upgrades[miner_id][2] *= 1.2;
        
        current_counter_money = parseFloat(current_counter_money.toFixed(4));
        cross_per_turn = parseFloat(cross_per_turn.toFixed(4));
        
        document.getElementById("money_turn").innerHTML = cross_per_turn;
        document.getElementById("miner_anz").innerHTML = blus_upgrades[miner_id][0];
        document.getElementById("user_money").innerHTML = current_counter_money;
    }
}


function over_line() {
    counter += (1 * multip) ;
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