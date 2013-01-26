
var ss = require('../../'),
    sq = require('simplequeue'),
	http = require('http'),
    url = require('url');

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
        outputqueue.putMessage(link);
    }
    
    this.start = function() {
        process.nextTick(function() {
            function processMessage(err, msg) {
                if (err)
                    console.log(err);
                else
                    self.process(msg);
                inputqueue.getMessage(processMessage);
            }

            inputqueue.getMessage(processMessage);
        });
    }
    
    this.registerHost = function(link)
    {
        var urldata = url.parse(link);
        registerHostName(urldata.hostname);
    }
}

// Queues

var queueserver = sq.createQueueServer();
var resolverqueue = queueserver.createQueue('qresolver');
var linksqueue = queueserver.createQueue('qlinks');

var server = sq.createRemoteServer(queueserver);

server.listen(3000);

// Topology server

var tserver = ss.createTopologyServer();
tserver.listen(3001);

// Objects

var resolver = new Resolver(resolverqueue, linksqueue);
resolver.start();

// Process arguments

process.argv.forEach(function(arg) {
    if (arg.indexOf("http:")==0) {
        resolver.registerHost(arg);
        linksqueue.putMessage(arg);
    }
});

