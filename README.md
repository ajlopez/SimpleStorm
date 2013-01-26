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

You have Spouts (message sources) and Bolts (message processor). An Spout should have a `start` function.
```js
function Spout() {    
    this.start = function(context) {
        // ...
        context.emit(msg); // you can emit a message many times
        // ....
    }
}
```
An spout emit message via its controller, in any of its methods.

A Bolt has a `process` method:
```js
function MyBolt() {    
    this.process = function(msg, context) {
		// Message process
		// and emit new message(s)
		context.emit(newmsg);
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

Start a topology:
```js
topology.start();
```

Stop a topology (WIP):
```js
topology.stop();
```

A topology worker can listen external messages, sent from other topology workers:
```js
topology.listen(port);
```

If they are many topology workers, they can share its address using a central server. In a process,
create a topology server:
```js
var tserver = ss.createTopologyServer();
tserver.listen(port);
```

In each topology worker, connect to the topology server:
```js
topology.connectToServer(port, host);
```

When a topology worker connects to the central server, it sends its address. The server shares that address
with the rest of the topology workers. See [Distributed Web Crawler with Server/Workers](https://github.com/ajlopez/SimpleStorm/tree/master/samples/Workers)
for a running example.

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
- [Distributed Web Crawler with Server/Workers](https://github.com/ajlopez/SimpleStorm/tree/master/samples/Workers) A central topology
server and many topologies running in worker processes.

## Versions

- 0.0.1: Published.
- 0.0.2: Published. Using SimpleQueue 0.0.2 for Distributed Web Crawler.
- 0.0.3: Under development, in master. Major internal/external refactor. Spout.start, Bold.process.

## Contribution

Feel free to [file issues](https://github.com/ajlopez/SimpleStorm) and submit
[pull requests](https://github.com/ajlopez/SimpleStorm/pulls) — contributions are
welcome.

If you submit a pull request, please be sure to add or update corresponding
test cases, and ensure that `npm test` continues to pass.

(Thanks to [JSON5](https://github.com/aseemk/json5) by [aseemk](https://github.com/aseemk). 
This file is based on that project README.md).

