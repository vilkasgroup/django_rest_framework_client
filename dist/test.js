'use strict';

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _fetchMock = require('fetch-mock');

var _fetchMock2 = _interopRequireDefault(_fetchMock);

var _restClient = require('./restClient');

var _restClient2 = _interopRequireDefault(_restClient);

var _mockLocalStorage = require('mock-local-storage');

var _mockLocalStorage2 = _interopRequireDefault(_mockLocalStorage);

require('isomorphic-fetch');

var _types = require('admin-on-rest/lib/rest/types');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var expect = require('chai').expect;


// Well this doesn't work for some reason... use chai instead.
_assert2.default.equal(1, 1);

var fakeData = {
    "users": [{
        "id": 1,
        "username": "user 1"
    }]
};

_fetchMock2.default.get(/.*\/api\/users\/\?.*/, { body: fakeData.users, headers: { 'x-total-count': 1 } });
_fetchMock2.default.get(/.*\/api\/users\/1\//, fakeData.users[0]);
_fetchMock2.default.get(/.*\/api\/users\/999\//, { status: 404, body: { detail: "Not found." } });
_fetchMock2.default.post(/.*\/api\/users\/\?.*/, { status: 200, body: fakeData.users[0] });
_fetchMock2.default.delete('*', { status: 204, body: {} });

var client = (0, _restClient2.default)('http://localhost:8000/api');

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
        }, function (error) {
            return console.error(error);
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

    /* Not working with mock-fetch
    it('should create new user and return id', function(done){
        client(CREATE, "users", { "data": {"username": "foobar" }}).then(
            response => {
                expect_to_eq(1,1, done);
            },
            error => console.error(error)
        );
    });
    */

    it('should delete and return 204 with empty body', function (done) {
        client(_types.DELETE, 'users', { id: 2 }).then(function (response) {
            expect_to_eq(response.data.id, 2, done);
        }, function (error) {
            return console.error(error);
        });
    });

    it('should fail because such method does not exist', function (done) {
        var failed = 0;
        try {
            client('FOOBAR', 'users', {}).then(function (response) {
                return console.error('This should have failed');
            }, function (error) {
                return console.error('This should have failed');
            });
        } catch (e) {
            failed = 1;
        }
        expect_to_eq(failed, 1, done);
    });
});