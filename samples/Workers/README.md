# Distributed Web Crawler Sample using connected Workers

A distributed web crawler sample. A central server has queues with links to process. The topology can be
manually launched in many nodes. Each node is a worker that can send and receive messages from the other ones.

## Install
Execute
```
npm install
```
to install the dependencies.

## Usage
Launch the server
```
node server.js <url> [<url>... ]
```
Example
```
node server.js http://ajlopez.wordpress.com
```
Launch one or more clients
```
node stormnode.js port [host:port  ...] 
```
The node starts to listen other nodes at `port`. The optional additional addresses refers to already running
nodes.




