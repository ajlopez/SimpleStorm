
var ss = require('../');

exports['Set and Get Bolt'] = function(test) {
	var builder = ss.createTopologyBuilder();
    var bolt = {};
    
    test.ok(builder.setBolt("mybolt", bolt));    
    test.ok(builder.getBolt("mybolt"));
    test.equal(builder.getBolt("mybolt"), bolt);
    
	test.done();
}

