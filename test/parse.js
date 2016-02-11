var should = require('should');
var Parse = require('../src/parse');

function getUint8ArrayData(data) {
  return new Uint8Array(new Buffer(JSON.stringify(data), 'utf8'));
}

describe('parse', function() {

  it('should handle null', function() {

    var parse = new Parse();
    var arr = getUint8ArrayData(null);

    parse.parse(arr).should.equal('null');
  });

  it('should handle number', function() {

    var parse = new Parse();
    var arr = getUint8ArrayData(1);

    parse.parse(arr).should.equal('1');

    arr = getUint8ArrayData(1.1);
    parse.parse(arr).should.equal('1.1');
  });

  it('should handle string', function() {

    var parse = new Parse();
    var data = 'testing';
    var arr = getUint8ArrayData(data);

    parse.parse(arr).should.equal('testing');
  });

  it('should handle array', function() {

    var parse = new Parse();
    var data = [
      1,
      2.1,
      'str',
      null,
      {
        nested: true,
        nestedObject: {
          omg: {
            again: {},
            test: 1
          }
        }
      }
    ];
    var arr = getUint8ArrayData(data);

    parse.parse(arr).should.deepEqual(data);
  });

  it('should handle object', function() {

    var parse = new Parse();
    var data = {
      str: '',
      num1: 1,
      num2: 1.1,
      nullProp: null,
      undef: undefined,
      func: function() {},
      obj: {
        num1: 2,
        num2: 2.2
      }
    };

    var arr = getUint8ArrayData(data);
    var res = parse.parse(arr);

    res.should.deepEqual({
      str: '',
      num1: 1,
      num2: 1.1,
      nullProp: null,
      obj: {
        num1: 2,
        num2: 2.2
      }
    });
  });

});
