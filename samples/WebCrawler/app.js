
var ss = require('../../'),
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
    
function Spout() {    
    this.start = function(context) {
        process.argv.forEach(function(arg) {
            if (arg.indexOf("http:")==0)
                context.emit(arg);
        });
    }
}
    
function Resolver() {
    this.visited = {};
    
    this.process = function(link, context) {
        var urldata = url.parse(link);

        if (!isHostName(urldata.hostname))
            return;

        if (this.visited[link])
            return;

        this.visited[link] = true;
        context.emit(link);
    }
}

function Downloader() {    
    this.process = function(link, context) {
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
                    context.emit(data);
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
    this.process = function(data, context) {
        var harvester = this;
        var links = match1.exec(data);

        if (links)
            links.forEach(function(link) { 
                if (link.indexOf('http:') == 0)
                    context.emit(link);
            });

        links = match2.exec(data);

        if (links)
            links.forEach(function(link) { 
                if (link.indexOf('http:') == 0)
                    context.emit(link);
            });
    }
}

// Objects

var spout = new Spout();
var downloader = new Downloader();
var resolver = new Resolver();
var harvester = new Harvester();

// Setting Builder

var builder = ss.createTopologyBuilder();

builder.setSpout("spout", spout);
builder.setBolt("downloader", downloader).shuffleGrouping("resolver").shuffleGrouping("spout");
builder.setBolt("resolver", resolver).shuffleGrouping("harvester");
builder.setBolt("harvester", harvester).shuffleGrouping("downloader");

var topology = builder.createTopology();

topology.start();
// Process arguments

