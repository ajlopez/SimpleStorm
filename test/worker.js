
var ss = require('../'),
    events = require('events');

exports['One Worker'] = function(test)
{
    test.expect(9);
	var builder = ss.createTopologyBuilder();
    var result = { sum: 0, total: 3 };
    builder.setSpout("spout", new Spout(3, 1));
    builder.setBolt("bolt", new Bolt(test, 1, result)).shuffleGrouping("spout");
	var topology = builder.createTopology();
	topology.start();
}

exports['Two Disconnected Workers'] = function(test)
{
    test.expect(18);
	var builder = ss.createTopologyBuilder();
    var result = { sum: 0, total: 6 };
    builder.setSpout("spout", new Spout(3, 1));
    builder.setBolt("bolt", new Bolt(test, 1, result)).shuffleGrouping("spout");
	var topology = builder.createTopology();
    var topology2 = builder.createTopology();
	topology.start();
	topology2.start();
}

exports['Two Connected Workers'] = function(test)
{
    test.expect(10 * 3 * 2);
	var builder = ss.createTopologyBuilder();
    var result = { sum: 0, total: 20 };
    builder.setSpout("spout", new Spout(10, 1));
    builder.setBolt("bolt", new Bolt(test, 1, result)).shuffleGrouping("spout");
	
    var topology = builder.createTopology();
    var topology2 = builder.createTopology();
    
    var stream1 = new events.EventEmitter();
    stream1.write = function (msg) {
        this.emit('data', msg);
    };
    
    var stream2 = new events.EventEmitter();
    stream2.write = function (msg) {
        this.emit('data', msg);
    };
    
    topology.registerWorker(stream1, stream2);
    topology2.registerWorker(stream2, stream1);
    
	topology.start();
	topology2.start();
}

function Spout(n, msg) {
    this.start = function (ctx) {
        for (var k = 0; k < n; k++)
            ctx.emit(msg);
    }
}

function Bolt(test, expected, result) {
    var counter = 0;
    
    this.process = function(msg, context) {
        test.ok(msg);
        test.equal(msg, expected);
        test.ok(context);
        result.sum += msg;
        
        if (result.sum === result.total)
            test.done();
    }
}

