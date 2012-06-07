
var ss = require('../');

exports['Start and Stop Topology'] = function(test)
{
	var builder = ss.createTopologyBuilder();
	var topology = builder.createTopology();
	topology.start();
	topology.stop();
	test.done();
}