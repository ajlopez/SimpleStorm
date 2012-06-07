
var ss = require('../');

exports['Set and Get Spout'] = function(test) {
	var builder = ss.createTopologyBuilder();
    var spout = {};
    builder.setSpout("myspout", spout);
    
    test.ok(builder.getSpout("myspout"));
    test.equal(builder.getSpout("myspout"), spout);
    
	test.done();
}

