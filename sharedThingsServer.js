// Remember to require config.js for the port number

var config = require('./config_node.js');

var WebSocketServer = require('ws').Server, wss = new WebSocketServer({port: config.port});
function NewWord() {
	this.world = {"x1":{"x":8,"y":8}, "x2":{"x":8,"y":51}, "x3":{"x":8,"y":94},
             "x4":{"x":8,"y":137}, "x5":{"x":8,"y":180}, "o1":{"x":240,"y":8},
             "o2":{"x":240,"y":51}, "o3":{"x":240,"y":94}, "o4":{"x":240,"y":137},
             "o5":{"x":240,"y":180},"tttboard":{"x":30,"y":30}};
}

var server_world = {};

var world_location = {};

var serverNameList=[];

wss.on('close', function() {
    console.log('disconnected');
});

wss.broadcast = function(data) {
    for(var i in this.clients)
        this.clients[i].send(data);
};

wss.on('connection', function(ws) {
	var nameList=[];
	// sending the world name list
	for (var name in server_world) {
	   nameList.push(name);
    }
    ws.send(JSON.stringify({type:"list", data:JSON.stringify(nameList)}));


	ws.on('message', function(message) {
		var changed = JSON.parse(message);


		if (changed.type == "getPos") {
			console.log(changed);
			// get the position of the correspoding world
			if (player_position[changed.world] != undefined) {
				for (var key = 0; key < player_position[changed.world]["pack"].length; key++) {
					if (player_position[changed.world]["pack"][key]["userid"] == changed.userid) {
						player_position[changed.world]["pack"][key]["position"] = JSON.parse(changed.newPos);
						var posi = player_position[changed.world]["pack"];
						var initial = JSON.stringify({type:"pos", allposition:JSON.stringify(posi), world:changed.world});
						console.log(initial);
						wss.broadcast(initial);
					}
				}
			}
		}


		if (changed.type == "move") {
			// console.log(changed);
			// change the data stored on the server
			var state = server_world[changed.world];
			state[changed.id].x=changed.x;
			state[changed.id].y=changed.y;
			console.log(state);
			// tell other client
			wss.broadcast(message);
		}

		// if get the reset order, reset and broadcast the initial world
		if (changed.type == "reset") {
			// create a new world
			// console.log(changed.world);
			var newWorld = new NewWord();
			server_world[changed.world] = newWorld.world;

			var initial = JSON.stringify({type:"initial", world: changed.world, data:JSON.stringify(newWorld.world)});
			wss.broadcast(initial);
		}

		if (changed.type == "create") {
			if (server_world[changed.world]==undefined) {
				// prepare a new world data
				var newWorld = new NewWord();
				server_world[changed.world] = newWorld.world;

				// get newly connected user's location information
				var geoLocation = JSON.parse(changed.gps);
				world_location[changed.world] =[];
				if (geoLocation.lat!=undefined && geoLocation.lng!=undefined) {
					// store the location information
					world_location[changed.world].push(geoLocation);
				}

				// adding the position of players
				var position = JSON.parse(changed.pack.pos);
				if (player_position[changed.world] == undefined) {
					player_position[changed.world] = [];
					player_position[changed.world]["pack"] = [];
				}
				var pack = {"userid" : changed.pack.userid,
							"position" : position};
				player_position[changed.world]["pack"].push(pack);


				// update the world list data		
				serverNameList.push(changed.world);
				// sending the world name list
			    wss.broadcast(JSON.stringify({type:"list", data:JSON.stringify(serverNameList)}));

			    // send a success message
			    ws.send(JSON.stringify({type:"success", world:changed.world, data:"Create successfully."}));
				// once create the world, send the world to the user
				var initial = JSON.stringify({type:"initial", world: changed.world, data:JSON.stringify(newWorld.world)});
				//Send the initial position to the newly connected client.
				ws.send(initial);
			} else {
				ws.send(JSON.stringify({type:"error", data:"World already exists."}));
			}
			
		}

		if (changed.type == "join") {
			// a user want to join a existing world
			// console.log(JSON.stringify(changed));
			// first pull out the world data
			var data = server_world[changed.world];
			// get newly connected user's location information
			var geoLocation = JSON.parse(changed.gps);

			if (geoLocation.lat!=undefined && geoLocation.lng!=undefined) {
				var temp = [];
				temp.push(geoLocation);
				// console.log(temp);
				// keep other users update
				wss.broadcast(JSON.stringify({type:"geo", world:changed.world, data:JSON.stringify(temp)}));
			}
			
			// adding the position of players
			var position = JSON.parse(changed.pack.pos);
			if (player_position[changed.world] == undefined) {
				player_position[changed.world] = [];
				player_position[changed.world]["pack"] = [];
			}
			var pack = {"userid" : changed.pack.userid,
						"position" : position};
			player_position[changed.world]["pack"].push(pack);

			// send a success message
			ws.send(JSON.stringify({type:"success", world:changed.world, data:"Join successfully."}));
			
			// push the updated clients location to the users
			ws.send(JSON.stringify({type:"geo", world:changed.world, data:JSON.stringify(world_location[changed.world])}));

			if (geoLocation.lat!=undefined && geoLocation.lng!=undefined) {
				// store the location information
				world_location[changed.world].push(geoLocation);
			}
			

			// once create the world, send the world to the user
			var initial = JSON.stringify({type:"initial", world: changed.world, data:JSON.stringify(data)});
			//Send the initial position to the newly connected client.
			ws.send(initial);
			
		}

	});
});
