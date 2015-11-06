var mc = require('../../') // import nmp
  , states = mc.states // import states as var from nmp
  , server = new mc.Server("1.8");

server.listen(25566);

server.on('connection', function(client) {
  var addr = client.socket.remoteAddress; // get the ip
  console.log('Incoming connection', '(' + addr + ')'); // print ip on connection
  var endedClient = false;
  var endedTargetClient = false;
  client.on('end', function() { // end event when client disconnects
    endedClient = true;
    console.log('Connection closed by client', '(' + addr + ')');
    if(!endedTargetClient) {
      targetClient.end("End");
    }
  });
  client.on('error', function() { // error event when something goes wrong
    endedClient = true;
    console.log('Connection error by client', '(' + addr + ')');
    if(!endedTargetClient) {
      targetClient.end("Error");
    }
  });
  client.on('set_protocol', function(packet) {
    client.state = states.LOGIN;
  });
  var targetClient = new mc.Client(false,"1.8");
  targetClient.connect(25565, 'localhost');
  client.on('raw', function(buffer, state) { // raw event forwarding raw data to the minecraft server
    console.log(buffer);
    targetClient.writeRaw(buffer);
  });
  targetClient.on('raw', function(buffer, state) { // raw event forwarding raw data to client from minecraft server
    if (!endedClient) {
      client.writeRaw(buffer);
    }
  });
  targetClient.on('end', function() { // When server stops
    endedTargetClient = true;
    console.log('Connection closed by server', '(' + addr + ')');
    if(!endedClient) {
      client.end("End");
    }
  });
  targetClient.on('error', function(err) { // When theres a server error
    endedTargetClient = true;
    console.log(err.stack);
    console.log('Connection error by server', '(' + addr + ')');
    if(!endedClient) {
      client.end("Error");
    }
  });
});
