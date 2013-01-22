
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
    spout.start = function (ctx) { ctx.emit("foo"); };
    builder.setSpout("spout", spout);
    builder.setBolt("bolt", new Bolt(test, "foo")).shuffleGrouping("spout");
	var topology = builder.createTopology();
    test.expect(4);
    test.ok(topology);
    topology.start();
}

function Spout() {
}

function Bolt(test, expected) {
    this.process = function(msg, context) {
        test.ok(msg);
        test.equal(msg, expected);
        test.ok(context);
        test.done();
    }
}