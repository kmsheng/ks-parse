var should = require('should');
var Parse = require('../src/parse');

function getUint8ArrayData(data) {
  return new Uint8Array(new Buffer(JSON.stringify(data), 'utf8'));
}

describe('parse', function() {

  it('should handle null', function() {

    var parse = new Parse();
    var data = null;
    var arr = getUint8ArrayData(null);
    should(parse.parse(arr)).equal(null);
  });

  it('should handle number', function() {

    var parse = new Parse();

    var arr = getUint8ArrayData(1);
    parse.parse(arr).should.equal(1);

    arr = getUint8ArrayData(1.1);
    parse.parse(arr).should.equal(1.1);

    arr = getUint8ArrayData(-1.1);
    parse.parse(arr).should.equal(-1.1);
  });

  it('should handle string', function() {

    var parse = new Parse();
    var data = 'testing རངས།';
    var arr = getUint8ArrayData(data);

    parse.parse(arr).should.equal('testing རངས།');
  });

  it('should escape characters', function() {

    var parse = new Parse();
    var data = 'te\\st\'ing';
    var arr = getUint8ArrayData(data);

    parse.parse(arr).should.equal('te\\st\'ing');
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

  it('should handle string array', function() {

    var parse = new Parse();
    var data = [
      'str1',
      'str2',
      'str3'
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

  it('should handle object (2)', function() {

    var parse = new Parse();

    var data = {
      contents: [1, 2, 3],
      tokenData: {
        test: [1, 2, 3],
        test2: [3, 4, 5]
      }
    };

    var arr = getUint8ArrayData(data);
    parse.parse(arr).should.deepEqual(data);
  });

});
