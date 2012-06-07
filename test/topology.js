
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

function Spout() {
    var controller;
    
    this.prepare = function(contr) {
        controller = contr;
    }
}

function Bolt(test) {
    var controller;
    
    this.prepare = function(contr) {
        controller = contr;
    }
    
    this.execute = function(msg) {
        test.ok(msg);
        test.done();
    }
}