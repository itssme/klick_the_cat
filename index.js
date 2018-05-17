/*
 * Author: itssme
 * desc: Serves files with express js
 *       and handles events with socket.io
 */

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var blus_upgrades = [];
// 0 number of bought items, cross per turn, costs, cost for unlock, disk space usage, name
blus_upgrades.push([0, 0.1, 20, 100, 1, '"Tag"']);
blus_upgrades.push([0, 1, 50, 500, 50, '"Comment"']);
blus_upgrades.push([0, 15, 200, 5000, 20, '"Funny Comment"']);
blus_upgrades.push([0, 100, 5000, 30000, 30, '"Top Comment"']);

blus_upgrades_str = "[[" + blus_upgrades[0] + "]";
for (let i = 1; i < blus_upgrades.length; i++) {
    blus_upgrades_str += ", [" + blus_upgrades[i] + "]";
}

blus_upgrades_str += "]";
console.log(blus_upgrades_str);

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

app.get('/js/functions.js', function(req, res){
    res.sendFile(__dirname + '/js/functions.js');
});

http.listen(3000, function(){
    console.log('listening on *:3000');
});

io.on('connection', function(socket){
    console.log('a schmuser connected');
    socket.emit('config_miners', '{"miner": ' + blus_upgrades_str + '}');

    socket.on('disconnect', function(){
        console.log('schmuser disconnected');
    });
});