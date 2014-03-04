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
Server exposes a queue server using port 3000. It listens to topology workers at port 3001.

Launch one or more clients
```
node stormapp.js [port]
```
The node starts to listen other nodes at `port`. It communicates its address to the topology server
listening at port 3001.





