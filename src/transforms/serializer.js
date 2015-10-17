var ProtoDef = require("protodef").ProtoDef;
var Serializer = require("protodef").Serializer;
var Parser = require("protodef").Parser;

var minecraft = require("../datatypes/minecraft");
var states = require("../states");

function createProtocol(types)
{
  var proto = new ProtoDef();
  proto.addTypes(minecraft);
  proto.addTypes(types);
  return proto;
}

function createSerializer({ state = states.HANDSHAKING, isServer = false , version} = {})
{
  var mcData=require("minecraft-data")(version);
  var direction = !isServer ? 'toServer' : 'toClient';
  var packets = mcData.protocol.states[state][direction];
  var proto=createProtocol(mcData.protocol.types);
  return new Serializer(proto,packets);
}

function createDeserializer({ state = states.HANDSHAKING, isServer = false,
  packetsToParse = {"packet": true}, version } = {})
{
  var mcData=require("minecraft-data")(version);
  var direction = isServer ? "toServer" : "toClient";
  var packets = mcData.protocol.states[state][direction];
  var proto=createProtocol(mcData.protocol.types);
  return new Parser(proto,packets,packetsToParse);
}

module.exports = {
  createSerializer:createSerializer,
  createDeserializer:createDeserializer
};
