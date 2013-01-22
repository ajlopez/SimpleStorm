
var ss = require('../');

exports['Start and Stop Empty Topology'] = function(test)
{
	var builder = ss.createTopologyBuilder();
	var topology = builder.createTopology();
	topology.start();
	topology.stop();
	test.done();
}

exports['Create Simple Topology'] = function(test)
{
	var builder = ss.createTopologyBuilder();
    builder.setSpout("spout", new Spout());
    builder.setBolt("bolt", new Bolt()).shuffleGrouping("spout");
	var topology = builder.createTopology();
    test.ok(topology);
	test.done();
}

exports['Create and Run Simple Topology'] = function(test)
{
	var builder = ss.createTopologyBuilder();
    var spout = new Spout();
    builder.setSpout("spout", spout);
    builder.setBolt("bolt", new Bolt(test, "foo")).shuffleGrouping("spout");
	var topology = builder.createTopology();
    test.expect(3);
    test.ok(topology);
    spout.emitMessage("foo");
}

function Spout() {
    var controller;
    
    this.prepare = function(contr) {
        controller = contr;
    }
    
    this.emitMessage = function(msg)
    {
        controller.emit(msg);
    }
}

function Bolt(test, expected) {
    var controller;
    
    this.prepare = function(contr) {
        controller = contr;
    }
    
    this.execute = function(msg) {
        test.ok(msg);
        test.equal(msg, expected);
        test.done();
    }
}