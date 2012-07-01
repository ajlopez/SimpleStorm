
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
    
function Resolver(inputqueue, outputqueue) {
    this.visited = {};
    var self = this;
    
    this.process = function(link) {
        console.log('Resolving ' + link);
        var urldata = url.parse(link);

        if (!isHostName(urldata.hostname))
            return;

        if (this.visited[link])
            return;

        this.visited[link] = true;
        outputqueue.putMessage(new sq.Message(link));
    }
    
    this.start = function() {
        process.nextTick(function() {
            sq.consume(inputqueue, function(msg) {
                self.process(msg.payload);
                return true;
            });
        });
    }
    
    this.registerHost = function(link)
    {
        var urldata = url.parse(link);
        registerHostName(urldata.hostname);
    }
}

// Queues

var queueserver = new sq.QueueServer();
var resolverqueue = queueserver.createQueue('qresolver');
var linksqueue = queueserver.createQueue('qlinks');

var server = sq.createRemoteServer(queueserver);

server.listen(3000);

// Objects

var resolver = new Resolver(resolverqueue, linksqueue);
resolver.start();

// Process arguments

process.argv.forEach(function(arg) {
    if (arg.indexOf("http:")==0) {
        resolver.registerHost(arg);
        linksqueue.putMessage(new sq.Message(arg));
    }
});

