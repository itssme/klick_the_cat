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
// 0 number of bought items, cross per turn, cost, cost for unlock, disk space usage, name
blus_upgrades.push([0, 0.1, 20, 100, 1, '"Tag"']);
blus_upgrades.push([0, 1, 50, 500, 50, '"Comment"']);
blus_upgrades.push([0, 15, 200, 5000, 20, '"Funny Comment"']);
blus_upgrades.push([0, 100, 5000, 30000, 30, '"Top Comment"']);

var diskspace_upgrades = [];
// number of bought items, disk space (in kb), cost,unlock cost, name
diskspace_upgrades.push([0, 10, 50 ,100, '"Magnetband"']);
diskspace_upgrades.push([0, 50, 750, 25000, '"Floppy-Disk"']);
diskspace_upgrades.push([0, 200, 12000, 50000, '"USB-Stick"']);

cross_per_turn = -1;

blus_upgrades_str = config_array_to_string(blus_upgrades);
diskspace_upgrades_str = config_array_to_string(diskspace_upgrades);

console.log(blus_upgrades_str);
console.log(diskspace_upgrades_str);

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

app.get('/js/functions.js', function(req, res){
    res.sendFile(__dirname + '/js/functions.js');
});

app.get('/resources/schmuserkadser.png', function(req, res) {
    res.sendFile(__dirname + '/resources/schmuserkadser.png');
});

http.listen(3000, function(){
    console.log('listening on *:3000');
});

io.on('connection', function(socket){
    console.log('a schmuser connected');
    socket.emit('config_miners', '{"miner": ' + blus_upgrades_str + ', "cross_per_turn": ' + cross_per_turn + '}');
    socket.emit('config_diskspace', '{"disks": ' + diskspace_upgrades_str + '}');

    socket.on('disconnect', function(){
        console.log('schmuser disconnected');
    });
});