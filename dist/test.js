'use strict';

var _restClient = require('./restClient');

var _restClient2 = _interopRequireDefault(_restClient);

var _types = require('admin-on-rest/lib/rest/types');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var fakeHttpClient = function fakeHttpClient(url) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    // Currently this is really dumb method, that returns
    // response according to the http method. It doesn't know
    // if you are trying to get list or single item etc.
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

var client = (0, _restClient2.default)('localhost:8000/api', fakeHttpClient);
client(_types.GET_LIST, 'users', {
    pagination: {},
    sort: {},
    filter: {}
}).then(function (response) {
    return console.log('RESPONSE: ', response);
});