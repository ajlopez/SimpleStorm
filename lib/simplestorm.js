
var events = require('events');

function Topology(spouts, bolts, outputs, inputs)
{
    if (inputs)
        for (var n in inputs) {
            inputs[n].topology = this;
        }
        
    this.start = function () {
        for (var n in spouts) {
            var spout = spouts[n];
            spout.start(outputs[n]);
        }
    };
    
    this.stop = function () { };
}

function OutputCollector()
{
    var stream = new events.EventEmitter();
    
    this.emit = function(msg) {
        stream.emit('data', msg);
    }
    
    this.addListener = function(listener) {
        stream.on('data', function(msg) {
            listener.process(msg);
        });
    }
}

function InputCollector(task, output)
{
    this.process = function (msg) {
        task.process(msg, output);
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
        var inputs = {};
        
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
            var inputCollector = new InputCollector(bolt, output);
            inputs[name] = inputCollector;
            inputDeclarer.getGroupings().forEach(function(groupname) {
                outputs[groupname].addListener(inputCollector);
            });
        }
        
        return new Topology(spouts, bolts, outputs, inputs); 
    }
}

exports.createTopologyBuilder = function() { return new TopologyBuilder(); }

