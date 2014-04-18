// Remember to require config.js for the port number

var config = require('./config_node.js');

var WebSocketServer = require('ws').Server, wss = new WebSocketServer({port: config.port});
var world = {"x1":{"x":8,"y":8}, "x2":{"x":8,"y":8}, "x3":{"x":8,"y":8},
			 "x4":{"x":8,"y":8}, "x5":{"x":8,"y":8}, "o1":{"x":8,"y":8},
			 "o2":{"x":8,"y":8}, "o3":{"x":8,"y":8}, "o4":{"x":8,"y":8},
			 "o5":{"x":8,"y":8},"tttboard":{"x":8,"y":8}};

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
		world[mes["id"]]["x"] = mes["pack"]["x"];
		world[mes["id"]]["y"] = mes["pack"]["y"];
		console.log('current world: %s', JSON.stringify(world));
		wss.broadcast(JSON.stringify(world));
		if(message=="delay"){
			console.log('delaying');
			while(1);
		}
	});
});
