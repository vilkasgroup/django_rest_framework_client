'use strict';

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _restClient = require('./restClient');

var _restClient2 = _interopRequireDefault(_restClient);

var _mockLocalStorage = require('mock-local-storage');

var _mockLocalStorage2 = _interopRequireDefault(_mockLocalStorage);

require('isomorphic-fetch');

var _types = require('admin-on-rest/lib/rest/types');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var expect = require('chai').expect;


global.window = {};
window.localStorage = global.localStorage;
window.localStorage.setItem('token', 'cdf564def8a97170bb5b4a28f9564df08235f50c');

// Well this doesn't work for some reason...
_assert2.default.equal(1, 1);

var fakeHttpClient = function fakeHttpClient(url) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    // Currently this is really dumb method, that returns
    // response according to the http method. It doesn't know
    // if you are trying to get list or single item etc.
    //
    // For now, we are going to use an actual server (app vilkas_integrations).
    // Once we have more example request, we can add the responses here, so this test can
    // be run without server.
    var response_map = {
        'GET': [{
            "id": 1,
            "value": "first fake element"
        }, {
            "id": 2,
            "value": "second fake element"
        }]
    };
    var response = response_map[options.method];
    console.log('Do fake request: ', options.method);
    if (response) {
        return Promise.resolve(response);
    } else {
        // TODO: Check what fetcjJson returns if it fails to connect to server etc.
        return Promise.reject('Fake server did not have response for that request');
    }
};

var client = (0, _restClient2.default)('http://localhost:8000/api');

// I don't really like the way we're testing these. Too much boilerplate,
// and it's hard to read. Need to check later, if we should use another
// library for testing.
describe('test get methods', function () {
    // This is a shorthand for what is explained here:
    // https://stackoverflow.com/questions/11235815
    // Note that you can only run 1 test with this.
    // If you need more, you need to include the try block in
    // to your test code. See test below for an example.
    function expect_to_eq(a, b, done) {
        var expect_a_to_eq_b = function expect_a_to_eq_b(a, b) {
            return expect(a).to.eq(b);
        };
        try {
            expect_a_to_eq_b(a, b);
            done();
        } catch (e) {
            done(e);
        }
    }

    it('should return list of items', function (done) {
        client(_types.GET_LIST, 'users', {
            pagination: {},
            sort: {},
            filter: {}
        }).then(function (response) {
            try {
                expect(response.data[0].id).to.eq(1);
                expect(response.data.length).to.eq(1);
                done();
            } catch (e) {
                done(e);
            }
        });
    });

    it('should return one item', function (done) {
        client(_types.GET_ONE, 'users', { id: 1 }).then(function (response) {
            expect_to_eq(response.data.id, 1, done);
        });
    });

    it('should throw 404 error', function (done) {
        client(_types.GET_ONE, 'users', { id: 999 }).then(function (response) {
            console.error('This promise was supposed to be rejected');
            expect_to_eq(true, false, done);
        }, function (error) {
            expect_to_eq(error.message, 'Not found.', done);
        });
    });
});