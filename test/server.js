
var ss = require('../'),
    simplemessages = require('simplemessages'),
    events = require('events');

exports['Topology connect to Server'] = function(test)
{
    test.expect(9);
	var builder = ss.createTopologyBuilder();
    var result = { sum: 0, total: 3 };
    
    // No messages from local Spout
    builder.setSpout("spout", new Spout(0, 1));
    builder.setBolt("bolt", new Bolt(test, 1, result, done)).shuffleGrouping("spout");
	
    var topology = builder.createTopology();
	topology.start();

    // messages from server
    var server = simplemessages.createServer(function (client) {
        for (var k = 0; k < 3; k++)
            client.write({ target: "bolt", message: 1 });
    });
    
    server.listen(3000);
    
    topology.connectToServer(3000);
    
    function done() {
        topology.stop();
        server.close();
    }
}

exports['Public Topology connect to Server'] = function(test)
{
    test.expect(9 + 3);
	var builder = ss.createTopologyBuilder();
    var result = { sum: 0, total: 3 };
    
    // No messages from local Spout
    builder.setSpout("spout", new Spout(0, 1));
    builder.setBolt("bolt", new Bolt(test, 1, result, done)).shuffleGrouping("spout");
	
    var topology = builder.createTopology();
	topology.start();

    // messages from server
    var server = simplemessages.createServer(function (client) {
        client.on('data', function (msg) {
            test.ok(msg);
            test.equal(msg.port, 3001);
            test.equal(msg.host, 'localhost');
            
            for (var k = 0; k < 3; k++)
                client.write({ target: "bolt", message: 1 });
        });
    });
    
    server.listen(3000);
    
    topology.connectToServer(3000);
    topology.listen(3001);
    
    function done() {
        topology.stop();
        server.close();
    }
}

function Spout(n, msg) {
    this.start = function (ctx) {
        for (var k = 0; k < n; k++)
            ctx.emit(msg);
    }
}

function Bolt(test, expected, result, done) {
    var counter = 0;
    
    this.process = function(msg, context) {
        test.ok(msg);
        test.equal(msg, expected);
        test.ok(context);
        result.sum += msg;
        
        if (result.sum === result.total) {
            test.done();
            done();            
        }
    }
}