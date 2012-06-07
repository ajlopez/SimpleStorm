
function Topology()
{
}

Topology.prototype.start = function() 
{
}

Topology.prototype.stop = function()
{
}

function TopologyBuilder()
{
    var spouts = {};
    
    this.setSpout = function(name, spout) {
        spouts[name] = spout;
    }
    
    this.getSpout = function(name) {
        return spouts[name];
    }
    
    this.createTopology = function() { return new Topology(); }
}

exports.createTopologyBuilder = function() { return new TopologyBuilder(); }

