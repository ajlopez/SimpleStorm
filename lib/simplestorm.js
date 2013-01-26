
var events = require('events');

function Topology(spouts, bolts, outputs, inputs)
{
    var workers = [];
    
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
    
    this.registerWorker = function (readstream, writestream) {
        readstream.on('data', function (outermsg) {
            bolts[outermsg.target].process(outermsg.message, outputs[outermsg.target]);
        });
        
        workers.push(writestream);
    };
    
    this.getTask = function (name) {
        if (!workers.length)
            return null;
            
        if (Math.random() <= 0.5)
            return null;
            
        var position = Math.floor(Math.random() * workers.length);
        
        return new OuterTask(name, workers[position]);
    };
}

function OuterTask(name, stream)
{
    this.process = function (msg) {
        stream.write({ target: name, message: msg });
    }
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

function InputCollector(name, task, output)
{
    this.process = function (msg) {
        if (this.topology) {
            var outertask = this.topology.getTask(name);
            
            if (outertask) {
                outertask.process(msg);
                return;
            }
        }
        
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
            var inputCollector = new InputCollector(name, bolt, output);
            inputs[name] = inputCollector;
            inputDeclarer.getGroupings().forEach(function(groupname) {
                outputs[groupname].addListener(inputCollector);
            });
        }
        
        return new Topology(spouts, bolts, outputs, inputs); 
    }
}

exports.createTopologyBuilder = function() { return new TopologyBuilder(); }

