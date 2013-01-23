
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

exports['Create and Run Two bolt in line Topology'] = function(test)
{
	var builder = ss.createTopologyBuilder();
    var spout = new Spout();
    spout.start = function (ctx) { ctx.emit("foo"); };
    builder.setSpout("spout", spout);
    builder.setBolt("bolt", new Bolt(test, "foo", true)).shuffleGrouping("spout");
    builder.setBolt("bolt2", new Bolt(test, "foox")).shuffleGrouping("bolt");
	var topology = builder.createTopology();
    test.expect(7);
    test.ok(topology);
    topology.start();
}

exports['Create and Run Three Bolt in fork Topology'] = function(test)
{
	var builder = ss.createTopologyBuilder();
    var spout = new Spout();
    spout.start = function (ctx) { ctx.emit("foo"); };
    builder.setSpout("spout", spout);
    builder.setBolt("boltA", new Bolt(test, "foo", true)).shuffleGrouping("spout");
    builder.setBolt("boltB", new Bolt(test, "foox", true)).shuffleGrouping("boltA");
    builder.setBolt("boltC", new Bolt(test, "foox", true)).shuffleGrouping("boltA");
    builder.setBolt("boltD", new Bolt(test, "fooxx", false, 2)).shuffleGrouping("boltB").shuffleGrouping("boltC");
	var topology = builder.createTopology();
    test.expect(16);
    test.ok(topology);
    topology.start();
}

function Spout() {
}

function Bolt(test, expected, isnotfinal, count) {
    var counter = 0;
    
    this.process = function(msg, context) {
        test.ok(msg);
        test.equal(msg, expected);
        test.ok(context);
        counter++;
        
        if (isnotfinal || (count && counter != count))
            context.emit(msg + "x");
        else
            test.done();
    }
}