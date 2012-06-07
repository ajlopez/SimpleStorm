
function Topology(spouts, bolts)
{
    this.spouts = spouts;
    this.bolts = bolts;
}

Topology.prototype.start = function() 
{
}

Topology.prototype.stop = function()
{
}

function OutputCollector()
{
    var receivers = [];
    
    this.emit = function(msg) {
        receivers.forEach(function(receiver) {
            process.nextTick( function() { receiver.execute(msg); });
        });
    }
    
    this.addReceiver = function(receiver) {
        receivers.push(receiver);
    }
}

function InputDeclarer()
{
    var groupings = [];
    
    this.shuffleGrouping = function(name) {
        groupings.push(name);
        return this;
    }
    
    this.getGroupings = function() {
        return groupings;
    }
}

function TopologyBuilder()
{
    var spouts = {};
    var bolts = {};
    var inputDeclarers = {};
    
    this.setSpout = function(name, spout) {
        spouts[name] = spout;
    }
    
    this.getSpout = function(name) {
        return spouts[name];
    }
    
    this.setBolt = function(name, bolt) {
        bolts[name] = bolt;
        var declarer = new InputDeclarer(bolt);
        inputDeclarers[name] = declarer;
        return declarer;
    }
    
    this.getBolt = function(name) {
        return bolts[name];
    }
    
    this.createTopology = function() { 
        var outputs = {};
        
        for (var name in spouts) {
            var collector = new OutputCollector();
            outputs[name] = collector;
            spouts[name].prepare(collector);
        }
        
        for (var name in bolts) {
            var collector = new OutputCollector();
            outputs[name] = collector;
            bolts[name].prepare(collector);
        }
        
        for (var name in inputDeclarers)
        {
            var inputDeclarer = inputDeclarers[name];
            var bolt = bolts[name];
            inputDeclarer.getGroupings().forEach(function(groupname) {
                outputs[groupname].addReceiver(bolt);
            });
        }
        
        return new Topology(spouts, bolts); 
    }
}

exports.createTopologyBuilder = function() { return new TopologyBuilder(); }

