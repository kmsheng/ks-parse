
var _ = require('lodash');

var LEFT_BRACE = 123;    // {
var RIGHT_BRACE = 125;   // }
var LEFT_BRACKET = 91;    // [
var RIGHT_BRACKET = 93;    // ]
var DOUBLE_QUOTE = 34;    // "
var BACKSLASH = 92;    // \
var COMMA = 44;    // ,
var COLON = 58;    // :

function Parse() {

  this.stacks = [];
  this.propStacks = [];
  this.str = undefined;
  this.nonStr = '';    // non str

  this.objectOpened = false;
  this.arrayOpened = false;
  this.stringOpened = false;
  this.skipOne = false;
}

Parse.prototype.parse = function(arr) {

  var self = this;

  arr.forEach(function(num) {

    if (self.skipOne) {
      self.skipOne = false;
      return self.handleDefault(num);
    }

    switch (num) {
      case BACKSLASH:
        return self.handleBackSlash();
      case COLON:
        return self.handleColon(num);
      case COMMA:
        return self.handleComma(num);
      case LEFT_BRACE:
        return self.handleLeftBrace(num);
      case RIGHT_BRACE:
        return self.handleRightBrace(num);
      case LEFT_BRACKET:
        return self.handleLeftBracket(num);
      case RIGHT_BRACKET:
        return self.handleRightBracket(num);
      case DOUBLE_QUOTE:
        return self.handleDoubleQuote();
      default:
        return self.handleDefault(num);
    }
  });

  return self.getResult(arr[arr.length - 1]);
};

Parse.prototype.clear = function() {

  this.stacks = [];
  this.propStacks = [];
  this.str = undefined;
  this.nonStr = '';
  this.objectOpened = false;
  this.arrayOpened = false;
  this.stringOpened = false;
  this.skipOne = false;
};

Parse.prototype.getResult = function(lastNum) {

  var result;

  if (DOUBLE_QUOTE === lastNum) {
    result = this.str;
  }
  else if (RIGHT_BRACKET === lastNum) {
    result = _.first(this.stacks);
  }
  else if (RIGHT_BRACE === lastNum) {
    result = _.first(this.stacks);
  }
  else {
    result = this.parseNonStr(this.nonStr);
  }

  this.clear();

  return result;
};

Parse.prototype.parseNonStr = function(nonStr) {

  if ('null' === nonStr) {
    return null;
  }

  if ('true' === nonStr) {
    return true;
  }

  if ('false' === nonStr) {
    return false;
  }

  var value = parseFloat(nonStr);

  if (_.isNumber(value) && ! _.isNaN(value)) {
    return value;
  }
  throw 'Parsed failed: ' + nonStr;
};

Parse.prototype.handleColon = function(num) {
  if (this.stringOpened) {
    return this.handleDefault(num);
  }
  this.propStacks.push(this.str);
  this.str = undefined;
};

Parse.prototype.handleComma = function(num) {

  if (this.stringOpened) {
    return this.handleDefault(num);
  }

  var stack = this.getCurrentStack();
  var currentProp = this.getCurrentProp();

  if (_.isPlainObject(stack) && currentProp && _.isString(this.str)) {
    // write property and value
    stack[currentProp] = this.str;
    this.propStacks.pop();
    this.str = undefined;
  }
  else if (_.isPlainObject(stack) && this.nonStr) {
    // write property and value
    stack[currentProp] = this.parseNonStr(this.nonStr);
    this.propStacks.pop();
    this.nonStr = '';
  }
  else if (_.isArray(stack) && _.isString(this.str)) {
    stack.push(this.str);
    this.str = undefined;
  }
  else if (_.isArray(stack) && this.nonStr) {
    stack.push(this.parseNonStr(this.nonStr));
    this.nonStr = '';
  }
};

Parse.prototype.handleBackSlash = function() {
  this.skipOne = true;
};

Parse.prototype.getParentStack = function() {
  return this.stacks[this.stacks.length - 2];
};

Parse.prototype.getCurrentStack = function() {
  return this.stacks[this.stacks.length - 1];
};

Parse.prototype.getCurrentProp = function() {
  return this.propStacks[this.propStacks.length - 1];
};

Parse.prototype.handleLeftBrace = function(num) {

  if (this.stringOpened) {
    return this.handleDefault(num);
  }
  this.stacks.push({});
  this.objectOpened = true;
};

Parse.prototype.handleLeftBracket = function(num) {

  if (this.stringOpened) {
    return this.handleDefault(num);
  }

  this.stacks.push([]);
  this.arrayOpened = true;
};

Parse.prototype.handleRightBracket = function(num) {

  if (this.stringOpened) {
    return this.handleDefault(num);
  }

  if (this.nonStr || this.str) {
    this.write(this.getCurrentStack());
  }

  var parentStack = this.getParentStack();

  if (_.isPlainObject(parentStack)) {
    this.write(parentStack, this.stacks.pop());
  }

  if (_.isArray(parentStack)) {
    this.write(parentStack, this.stacks.pop());
  }

  this.arrayOpened = false;
};

Parse.prototype.write = function(stack, assignedValue) {

  var value;

  if (this.str) {
    value = this.str;
    this.str = undefined;
  }

  if (this.nonStr) {
    value = this.parseNonStr(this.nonStr);
    this.nonStr = '';
  }

  if (assignedValue) {
    value = assignedValue;
  }

  if (_.isPlainObject(stack) && (undefined !== value)) {
    var currentProp = this.getCurrentProp();
    stack[currentProp] = value;
    this.propStacks.pop();
  }

  if (_.isArray(stack) && (undefined !== value)) {
    stack.push(value);
  }
};

Parse.prototype.handleRightBrace = function(num) {

  if (this.stringOpened) {
    return this.handleDefault(num);
  }

  this.objectOpened = false;
  var parentStack = this.getParentStack();
  var currentStack = this.getCurrentStack();

  this.write(currentStack);

  if (parentStack) {
    this.write(parentStack, this.stacks.pop());
  }
};

Parse.prototype.handleDoubleQuote = function() {
  this.stringOpened = ! this.stringOpened;

  if (this.stringOpened) {
    this.str = '';
  }
  else if (this.str) {
    // decode UTF8
    this.str = decodeURIComponent(escape(this.str));
  }
};

Parse.prototype.handleDefault = function(num) {
  if (this.stringOpened) {
    this.str += String.fromCharCode(num);
  }
  else {
    this.nonStr += String.fromCharCode(num);
  }
};

module.exports = Parse;
