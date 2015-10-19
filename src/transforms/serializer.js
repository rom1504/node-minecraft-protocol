var ProtoDef = require("protodef").ProtoDef;
var Serializer = require("protodef").Serializer;
var Parser = require("protodef").Parser;

var minecraft = require("../datatypes/minecraft");
var states = require("../states");

function createProtocol(types,packets)
{
  var proto = new ProtoDef();
  proto.addTypes(minecraft);
  proto.addTypes(types);

  Object.keys(packets).forEach(function(name) {
    proto.addType("packet_"+name,["container",packets[name].fields]);
  });

  proto.addType("packet",["container", [
    { "name": "id", "type": "varint" },
    { "name": "params", "type": ["switch", {
      "compareTo": "id",
      "fields": Object.keys(packets).reduce(function(acc,name){
        acc[parseInt(packets[name].id)]="packet_"+name;
        return acc;
      },{})
    }]}
  ]]);
  return proto;
}



function createSerializer({ state = states.HANDSHAKING, isServer = false , version} = {})
{
  var mcData=require("minecraft-data")(version);
  var direction = !isServer ? 'toServer' : 'toClient';
  var packets = mcData.protocol.states[state][direction];
  var proto=createProtocol(mcData.protocol.types,packets);
  var serializer=new Serializer(proto,"packet");
  var originalWrite=serializer.write.bind(serializer);
  serializer.write=({packetName,params}={}) =>
     originalWrite({
      id:parseInt(packets[packetName].id),
      params:params
    });
  return serializer;
}

function createDeserializer({ state = states.HANDSHAKING, isServer = false,
  packetsToParse = {"packet": true}, version } = {})
{
  var mcData=require("minecraft-data")(version);
  var direction = isServer ? "toServer" : "toClient";
  var packets = mcData.protocol.states[state][direction];
  var proto=createProtocol(mcData.protocol.types,packets);
  return new Parser(proto,"packet");
}

module.exports = {
  createSerializer:createSerializer,
  createDeserializer:createDeserializer
};
