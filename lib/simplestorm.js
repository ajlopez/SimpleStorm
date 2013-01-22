
function Topology(spouts, bolts, outputs)
{
    this.spouts = spouts;
    this.bolts = bolts;
    this.outputs = outputs;
}

Topology.prototype.start = function() 
{
    for (var n in this.spouts) {
        var spout = this.spouts[n];
        spout.start(this.outputs[n]);
    }
}

Topology.prototype.stop = function()
{
}

function OutputCollector()
{
    var receivers = [];
    
    this.emit = function(msg) {
        receivers.forEach(function(rec) {
            process.nextTick( function() { rec.receiver.process(msg, rec.output); });
        });
    }
    
    this.addReceiver = function(receiver, output) {
        receivers.push({ receiver: receiver, output: output });
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
        }
        
        for (var name in bolts) {
            var collector = new OutputCollector();
            outputs[name] = collector;
        }
        
        for (var name in inputDeclarers)
        {
            var inputDeclarer = inputDeclarers[name];
            var bolt = bolts[name];
            var output = outputs[name];
            inputDeclarer.getGroupings().forEach(function(groupname) {
                outputs[groupname].addReceiver(bolt, output);
            });
        }
        
        return new Topology(spouts, bolts, outputs); 
    }
}

exports.createTopologyBuilder = function() { return new TopologyBuilder(); }

