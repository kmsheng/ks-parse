[![Build Status](https://travis-ci.org/kmsheng/ks-parse.svg?branch=master)](https://travis-ci.org/kmsheng/ks-parse) 

# ks-parse
JSON.parse like function that handles Uint8Array

```js
var Parser = require('ks-parse');
var parser = new Parser();
var arr = new Uint8Array(new Buffer(JSON.stringify({test: true}), 'utf8'));

console.log(parser.parse(arr));
```
