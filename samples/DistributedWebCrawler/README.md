# Distributed Web Crawler Sample

A distributed web crawler sample. A central server has queues with links to process. The topology can be
manually launched in many nodes.

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
node stormnode.js
```




