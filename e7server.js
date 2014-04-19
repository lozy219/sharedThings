// Remember to require config.js for the port number

var config = require('./config_node.js');

var WebSocketServer = require('ws').Server, wss = new WebSocketServer({port: config.port});
var world = {"x1":{"x":8,"y":38}, "x2":{"x":8,"y":81}, "x3":{"x":8,"y":124},"x4":{"x":8,"y":167}, "x5":{"x":8,"y":210}, "o1":{"x":290,"y":38},"o2":{"x":290,"y":81}, "o3":{"x":290,"y":124}, "o4":{"x":290,"y":167},"o5":{"x":290,"y":210},"tttboard":{"x":70,"y":60}};

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
			if (mes["id"] != 'tttboard'){
				world[mes["id"]]["x"] = mes["pack"]["x"];
				world[mes["id"]]["y"] = mes["pack"]["y"];
				console.log('current world: %s', JSON.stringify(world));
				wss.broadcast(message);
			}
		} else if (mes["mode"] == 'init') {
			console.log(JSON.stringify(world));
			var initMes = {"mode" : 'init',
						   "world": world};
			wss.broadcast(JSON.stringify(initMes));
		} else if (mes["mode"] == 'change') {
			world[mes["id"]]["x"] = mes["pack"]["x"];
			world[mes["id"]]["y"] = mes["pack"]["y"];
			console.log('current world: %s', JSON.stringify(world));
		}

		if(message=="delay"){
			console.log('delaying');
			while(1);
		}
	});
});
