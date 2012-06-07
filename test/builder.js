
var ss = require('../');

exports['Create Builder'] = function(test) {
	var builder = ss.createTopologyBuilder();
	test.ok(builder);
	test.done();
}

exports['Create Topology'] = function(test) {
	var builder = ss.createTopologyBuilder();
    var topology = builder.createTopology();
	test.ok(topology);
	test.done();
}

exports['Set and Get Spout'] = function(test) {
	var builder = ss.createTopologyBuilder();
    var spout = {};
    builder.setSpout("myspout", spout);
    
    test.ok(builder.getSpout("myspout"));
    test.equal(builder.getSpout("myspout"), spout);
    
	test.done();
}

