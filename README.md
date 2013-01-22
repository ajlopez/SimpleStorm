# SimpleStorm

Simple Storm-like distributed application, implementation, for Node.js.
See

- https://github.com/nathanmarz/storm
- https://github.com/nathanmarz/storm/wiki/Tutorial

## Installation

Via npm on Node:

```
npm install simplestorm
```

Reference in your program:

```js
var simplestorm = require('simplestorm');
```

## Usage

You have Spouts (message sources) and Bolts (message processor). An Spout should have a `prepare` function.
```js
function Spout() {    
    this.prepare = function(controller) {
        this.controller = controller;
    }
    
    this.emitMessage = function(msg) {
        this.controller.emit(msg);
    }
}
```
An spout emit message via its controller, in any of its methods.

The `prepare` function receives a controller, that can be used to emit messages.

A Bolt has `prepare` and `execute` methods:
```js
function MyBolt() {    
    this.prepare = function(controller) {
        this.controller = controller;
    }
    
    this.execute = function(msg) {
		// Message process
		// and emit new message(s)
		this.controller.emit(newmsg);
	}
}
```
There is a topology builder:
```js
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
```

## Development

```
git clone git://github.com/ajlopez/SimpleStorm.git
cd SimpleStorm
npm install
npm test
```

## Samples

- [Web Crawler](https://github.com/ajlopez/SimpleStorm/tree/master/samples/WebCrawler) sample shows
a local topology running a web crawler.
- [Distributed Web Crawler](https://github.com/ajlopez/SimpleStorm/tree/master/samples/DistributedWebCrawler) is a central server using
queues and many SimpleStorm topologies running in nodes.

## Versions

- 0.0.1: Published.
- 0.0.2: Published. Using SimpleQueue 0.0.2 for Distributed Web Crawler.

## Contribution

Feel free to [file issues](https://github.com/ajlopez/SimpleStorm) and submit
[pull requests](https://github.com/ajlopez/SimpleStorm/pulls) — contributions are
welcome.

If you submit a pull request, please be sure to add or update corresponding
test cases, and ensure that `npm test` continues to pass.

(Thanks to [JSON5](https://github.com/aseemk/json5) by [aseemk](https://github.com/aseemk). 
This file is based on that project README.md).