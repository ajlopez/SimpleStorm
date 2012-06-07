
var ss = require('../');

exports['Set and Get Bolt'] = function(test) {
	var builder = ss.createTopologyBuilder();
    var bolt = {};
    
    test.ok(builder.setBolt("mybolt", bolt));    
    test.ok(builder.getBolt("mybolt"));
    test.equal(builder.getBolt("mybolt"), bolt);
    
	test.done();
}

exports['Set Shuffle Grouping'] = function(test) {
	var builder = ss.createTopologyBuilder();
    var bolt = {};
    
    var result = builder.setBolt("mybolt", bolt);
    result.shuffleGrouping("myspout");
    var groupings = result.getGroupings();
    test.ok(groupings);
    test.ok(Array.isArray(groupings));
    test.equal(groupings.length, 1);
    test.equal(groupings[0], "myspout");
    
	test.done();
}

