
var events = require('events'),
    simplemessages = require('simplemessages');

function isOuterMessage(msg) {
    return msg && msg.target && msg.message;
}

function isHostMessage(msg) {
    return msg && msg.host && msg.port;
}

function Topology(spouts, bolts, outputs, inputs)
{
    var workers = [];
    var nworkers = 0;
    var topology = this;
    
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
    
    this.stop = function () { 
        if (server)
            server.end(); 
        
        if (listener)
            listener.close(); 
        
        workers.forEach(function (worker) { worker.end(); });
    };    
    
    function processOuterMessage(msg) {
        bolts[msg.target].process(msg.message, outputs[msg.target]);
    }
    
    this.registerWorker = function (readstream, writestream) {
        readstream.on('data', function (msg) {
            if (isOuterMessage(msg))
                processOuterMessage(msg);
        });
        
        var nworker = workers.length;
        workers.push(writestream);
        nworkers++;
        
        writestream.on('close', function() {
            if (workers[nworker])
                nworkers--;
            delete workers[nworker];            
        });
        
        writestream.on('error', function() {
            if (workers[nworker])
                nworkers--;
            delete workers[nworker];
        });
    };
    
    this.getTask = function (name) {
        if (!nworkers)
            return null;
            
        if (Math.random() <= 0.5)
            return null;
            
        var position = Math.floor(Math.random() * workers.length);
        
        if (!workers[position])
            return null;
        
        return new OuterTask(name, workers[position]);
    };
    
    var server;
    var connected;
    var listener;
    var local;
    
    this.connectToServer = function (port, host) {
        server = simplemessages.createClient(port, host, function () {
            connected = true;
            
            if (local)
                server.write(local);
            
            server.on('data', function (msg) {
                if (isOuterMessage(msg))
                    processOuterMessage(msg);
                else if (isHostMessage(msg)) {                    
                    var remote = simplemessages.createClient(msg.port, msg.host, function() {
                        topology.registerWorker(remote, remote);
                    });
                }
            });
        });
    };
    
    this.listen = function (port, host) {
        listener = simplemessages.createServer(function (client) {
            client.on('data', function (msg) {
                if (isOuterMessage(msg))
                    processOuterMessage(msg);
            });
        });
        
        listener.listen(port, host);
        
        host = host || 'localhost';
        local = { port: port, host: host };
        
        if (connected)
            server.write(local);
    }
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

exports.createTopologyBuilder = function () { return new TopologyBuilder(); }

exports.createTopologyServer = function () { 
    var clients = [];
    
    function removeClient(client) {
        var position = clients.indexOf(client);
        
        delete clients[position];
    }
    
    function addClient(client) {
        clients.push(client);
    }
    
    function broadcast(msg, sender) {
        clients.forEach(function (client) {
            if (client !== sender)
                client.write(msg);
        });
    }
    
    return simplemessages.createServer(function (client) {
        addClient(client);

        client.on('error', function() { removeClient(client); });
        client.on('close', function() { removeClient(client); });
        client.on('data', function(msg) {
            if (isHostMessage(msg))
                broadcast(msg, client);
        });
    });
}
