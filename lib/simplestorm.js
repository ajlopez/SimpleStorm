
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
}

TopologyBuilder.prototype.createTopology = function()
{
    return new Topology();
}

exports.createTopologyBuilder = function() { return new TopologyBuilder(); }

