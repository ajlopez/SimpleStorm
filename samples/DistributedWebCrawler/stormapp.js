
var ss = require('../../'),
    sq = require('simplequeue'),
	http = require('http'),
    url = require('url'),
    util = require('util'),
    events = require('events');
    
var hostnames = {};

function registerHostName(hostname)
{
    if (!hostnames[hostname])
    {
        console.log('Host: ' + hostname);
        hostnames[hostname] = true;
    }
}

function isHostName(hostname)
{
    return hostnames[hostname];
}
    
function Spout(queue) {    
    var self = this;
    
    this.prepare = function(controller) {
        this.controller = controller;
    }
    
    this.emitMessage = function(msg) {
        this.controller.emit(msg);
    }
    
    this.start = function() {
        console.log('spout started');
        process.nextTick(function() {
            sq.remoteConsume(queue, function(err, msg) {
                if (err) {
                    console.log(err);
                    return false;
                }
                
                console.log('Received ' + msg.payload);
                self.emitMessage(msg.payload);
                return true;
            });
        });
    }
}
    
function Resolver(queue) {
    this.visited = {};
    
    this.prepare = function(controller) {
        this.controller = controller;
    }
    
    this.execute = function(link) {
        queue.putMessage(new sq.Message(link));
    }
}

function Downloader() {    
    this.prepare = function(controller) {
        this.controller = controller;
    }
    
    this.execute = function(link) {
        var downloader = this;
        var urldata = url.parse(link);
        
        registerHostName(urldata.hostname);
        
        options = {
            host: urldata.hostname,
            port: urldata.port,
            path: urldata.path,
            method: 'GET'
        };
        
        http.get(options, function(res) { 
                console.log('Url: ' + link);
                res.setEncoding('utf8');
                res.on('data', function(data) {
                    downloader.controller.emit(data);
                });
           }).on('error', function(e) {
                console.log('Url: ' + link);
                console.log('Error: ' + e.message);
            });
    }
}

var match1 = /href=\s*"([^&"]*)"/i;
var match2= /href=\s*'([^&']*)'/i;

function Harvester() {
    this.prepare = function(controller) {
        this.controller = controller;
    }
    
    this.execute = function(data) {
        var harvester = this;
        var links = match1.exec(data);

        if (links)
            links.forEach(function(link) { 
                if (link.indexOf('http:') == 0)
                    harvester.controller.emit(link);
            });

        links = match2.exec(data);

        if (links)
            links.forEach(function(link) { 
                if (link.indexOf('http:') == 0)
                    harvester.controller.emit(link);
            });
    }
}

// Queues

var qclient = sq.createRemoteClient();

qclient.on('remote', function(remote) {
    console.log('connected');
    
    remote.getQueue('qlinks', function(err, linkqueue) {
        if (err) {
            console.log(err);
            process.exit(1);
        }
        
        console.log('links queue');
        
        remote.getQueue('qresolver', function(err, resolverqueue) {
            if (err) {
                console.log(err);
                process.exit(1);
            }
            
            console.log('resolver queue');
            
            // Objects

            var spout = new Spout(linkqueue);
            var downloader = new Downloader();
            var harvester = new Harvester();
            var resolver = new Resolver(resolverqueue);

            // Setting Builder

            var builder = ss.createTopologyBuilder();

            builder.setSpout("spout", spout);
            builder.setBolt("downloader", downloader).shuffleGrouping("spout");
            builder.setBolt("harvester", harvester).shuffleGrouping("downloader");
            builder.setBolt("resolver", resolver).shuffleGrouping("harvester");

            var topology = builder.createTopology();

            spout.start();
        });
    });
});

qclient.connect(3000);



