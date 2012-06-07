
function Topology()
{
}

Topology.prototype.start = function() 
{
}

Topology.prototype.stop = function()
{
}

function InputDeclarer()
{
    var grouping;
    
    this.shuffleGrouping = function(name) {
        grouping = name;
    }
    
    this.getGroupingName = function() {
        return grouping;
    }
}

function TopologyBuilder()
{
    var spouts = {};
    var bolts = {};
    
    this.setSpout = function(name, spout) {
        spouts[name] = spout;
    }
    
    this.getSpout = function(name) {
        return spouts[name];
    }
    
    this.setBolt = function(name, bolt) {
        bolts[name] = bolt;
        return new InputDeclarer(bolt);
    }
    
    this.getBolt = function(name) {
        return bolts[name];
    }
    
    this.createTopology = function() { return new Topology(); }
}

exports.createTopologyBuilder = function() { return new TopologyBuilder(); }

