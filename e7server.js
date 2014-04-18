// Remember to require config.js for the port number

var config = require('./config_node.js');

var WebSocketServer = require('ws').Server, wss = new WebSocketServer({port: config.port});
var world = {"x1":{"x":8,"y":8}, "x2":{"x":8,"y":51}, "x3":{"x":8,"y":94},
			 "x4":{"x":8,"y":137}, "x5":{"x":8,"y":180}, "o1":{"x":290,"y":8},
			 "o2":{"x":290,"y":51}, "o3":{"x":290,"y":94}, "o4":{"x":290,"y":137},
			 "o5":{"x":290,"y":180},"tttboard":{"x":70,"y":30}};

wss.on('close', function() {
    console.log('disconnected');
});

wss.broadcast = function(data) {
    for(var i in this.clients)
        this.clients[i].send(data);
};

wss.on('connection', function(ws) {
	ws.on('message', function(message) {
		console.log('received: %s', message);
		var mes = JSON.parse(message);
		if (mes["mode"] != 'init') {
			world[mes["id"]]["x"] = mes["pack"]["x"];
			world[mes["id"]]["y"] = mes["pack"]["y"];
		}
		console.log('current world: %s', JSON.stringify(world));
		wss.broadcast(JSON.stringify(world));
		if(message=="delay"){
			console.log('delaying');
			while(1);
		}
	});
});
