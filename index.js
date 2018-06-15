/*
 * Author: itssme
 * desc: Serves files with express js
 *       and handles events with socket.io
 */

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

function config_array_to_string(config_array) {
    config_string = "[[" + config_array[0] + "]";
    for (let i = 1; i < config_array.length; i++) {
        config_string += ", [" + config_array[i] + "]";
    }
    config_string += "]";
    return config_string;
}

var blus_upgrades = [];
// 0 number of bought items, blus per turn, cost, cost for unlock, disk space usage, name
blus_upgrades.push([0, 0.1, 20, 100, 1, '"Tag"']);
blus_upgrades.push([0, 1, 50, 500, 15, '"Comment"']);
blus_upgrades.push([0, 15, 200, 5000, 20, '"Funny Comment"']);
blus_upgrades.push([0, 100, 5000, 30000, 30, '"Top Comment"']);
blus_upgrades.push([0, 1000, 75000, 50000, 12*1024, '"Invite"']);
blus_upgrades.push([0, 5000, 200000, 1500000, 150*1024, '"Post"']);
blus_upgrades.push([0, 12500, 800000, 2000000, 1024*1024, '"NSFW Post"']);
blus_upgrades.push([0, 50000, 1500000, 2500000, 2*1024*1024, '"NSFL Post"']);
blus_upgrades.push([0, 125000, 3000000, 5000000, 6*1024*1024, '"Top Post"']);
blus_upgrades.push([0, 125000, 4500000, 10000000, 32*1024*1024, '"OC Post"']);
blus_upgrades.push([0, 500000, 10000000, 70000000, 48*1024*1024, '"Top NSFL Post"']);
blus_upgrades.push([0, 1250000, 25000000, 150000000, 64*1024*1024, '"Top NSFW Post"']);
blus_upgrades.push([0, 2000000, 75000000, 1000000000, 128*1024*1024, '"Schmuserkadser OC"']);
blus_upgrades.push([0, 1750000, 100000000, 2500000000, 512*1024*1024, '"Top Cat Post"']);
blus_upgrades.push([0, 5000000, 1000000000, 10000000000, 5*1024*1024*1024, '"Post of the Month"']);
blus_upgrades.push([0, 15000000, 5000000000, 75000000000, 128*1024*1024*1024, '"NSFW OC"']);
blus_upgrades.push([0, 100000000, 55000000000, 125000000000, 512*1024*1024*1024, '"Schmuserkadser"']);


var diskspace_upgrades = [];
// number of bought items, disk space (in kb), cost, unlock cost, name
diskspace_upgrades.push([0, 10, 50 ,100, '"Magnetband"']);
diskspace_upgrades.push([0, 50, 200, 2500, '"Floppy-Disk"']);
diskspace_upgrades.push([0, 1024, 5000, 15000, '"Floppy-Disk 2.0"']);
diskspace_upgrades.push([0, 64*1024, 50000, 45000, '"USB-Stick"']);
diskspace_upgrades.push([0, 512*1024, 450000, 1000000, '"SD-Card"']);
diskspace_upgrades.push([0, 4*1024*1024, 1000000, 2225000, '"USB-2.0"']);
diskspace_upgrades.push([0, 32*1024*1024, 4200000, 5000000, '"USB-3.0"']);
diskspace_upgrades.push([0, 128*1024*1024, 10000000, 15000000, '"SSD"']);
diskspace_upgrades.push([0, 2*1024*1024*1024, 100000000, 500000000, '"HDD"']);
diskspace_upgrades.push([0, 64*1024*1024*1024, 1500000000, 1500000000, '"Datacenter"']);


var minus_upgrades = [];
// 0 number of bought items, minus per turn, cost, cost for unlock, disk space usage, name
minus_upgrades.push([0, 1, 500, 15000, 15, '"Hate Comment"']);
minus_upgrades.push([0, 15, 7500, 42500, 50, '"Downvote Spam"']);
minus_upgrades.push([0, 128, 200000, 150000, 100*1024, '"Bad Post"']);
minus_upgrades.push([0, 500, 650000, 1750000, 450*1024, '"Shittypost"']);
minus_upgrades.push([0, 100000, 5000000, 7000000, 32*1024*1024, '"Repost"']);
minus_upgrades.push([0, 500000, 200000000, 5000000000, 1.5*1024*1024*1024, '"Very Bad Repost"']);


cross_per_turn = -1;
total_disk_space = 10;

blus_upgrades_str = config_array_to_string(blus_upgrades);
diskspace_upgrades_str = config_array_to_string(diskspace_upgrades);
minus_upgrades_str = config_array_to_string(minus_upgrades);

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

app.get('/js/functions_min.js', function(req, res){
    res.sendFile(__dirname + '/js/functions_min.js');
});

app.get('/resources/schmuserkadser.png', function(req, res) {
    res.sendFile(__dirname + '/resources/schmuserkadser.png');
});

http.listen(3000, function(){
    console.log('listening on *:3000');
});

var users = Array();
var users_sockets = Array();
var user_id_counter = 0;
io.on('connection', function(socket){
    let username = "";
    user_id_counter += 1;
    let user_id = user_id_counter
    console.log('a schmuser connected with id: ' + user_id);
    socket.emit('config_miners', '{"miner": ' + blus_upgrades_str + ', "cross_per_turn": ' + cross_per_turn + '}');
    socket.emit('config_diskspace', '{"disks": ' + diskspace_upgrades_str + ', "total_disk_space": ' + total_disk_space + '}');
    socket.emit('config_minus', '{"minus": ' + minus_upgrades_str + '}');

    socket.on('username', function (msg) {
        username = JSON.parse(msg)["username"];
        invalid = false;
        users.forEach(function (user) {
            if (user.username == username) {
                invalid = true;
                socket.emit('username_invalid');
            }
        });

        if (! invalid)  {
            users.push({"id": user_id, "username": username, "blus": 0})
            users_sockets.push({"id": user_id, "socket": socket});
            console.log("user id: " + user_id_counter + " set name: " + username);
            socket.emit('user_id', '{"user_id": "' + user_id + '"}');
        }
    });

    socket.on('disconnect', function() {
        console.log("Username: " + username + " ID: " + user_id + " disconnected");
        users = users.filter(function (user) { return user.id != user_id });
        users_sockets.forEach(function (user) {
            user.socket.emit("disconnect_from_user", '{"user":"' + user_id + '"}');
        });
    });

    socket.on('sync', function (msg) {
        user_update = JSON.parse(msg)
        users.forEach(function (user) {
            if (user.id == user_update["id"]) {
                user.blus = user_update["blus"];
            }
        });
        socket.emit('user_update', JSON.stringify(users));
    });

    socket.on('send_minus', function (msg) {
        sent_minus = JSON.parse(msg);
        minus = minus_upgrades[sent_minus["minus_id"]][1];
        users_sockets.forEach(function (user) {
            if (user.id == sent_minus["user_id"]) {
                user.socket.emit('got_minus', '{"minus":"' + minus + '"}');
            }
        });
    });

    socket.on('end', function (msg) {
        msg = JSON.parse(msg);
        console.log("USER " + username + " HAS BEEN BANNED");
        console.log("ccm: " + msg["ccm"] + " to " + msg["ccm_back"]);
        console.log("cpt: " + msg["cpt"] + " to " + msg["cpt_back"]);
    });
});
