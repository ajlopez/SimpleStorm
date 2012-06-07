
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

