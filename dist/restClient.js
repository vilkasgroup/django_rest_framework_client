'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _adminOnRest = require('admin-on-rest');

var _fetch = require('admin-on-rest/lib/util/fetch');

var _queryString = require('query-string');

var _types = require('admin-on-rest/lib/rest/types');

var fetchJsonWithToken = function fetchJsonWithToken(url) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    if (localStorage.getItem('token')) {
        options.user = {
            authenticated: true,
            token: 'Token ' + localStorage.getItem('token')
        };
    }
    return _adminOnRest.fetchUtils.fetchJson(url, options);
};

exports.default = function (apiUrl) {
    var httpClient = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : fetchJsonWithToken;


    var convertRESTRequestToHTTP = function convertRESTRequestToHTTP(type, resource, params) {
        var url = '';
        var options = {};

        switch (type) {
            case _types.GET_LIST:
                {
                    var page = params.pagination.page || 1;
                    var perPage = params.pagination.perPage || 10;
                    var field = params.sort.field || 'id';
                    var order = params.sort.order || 'ASC';
                    var query = _extends({}, (0, _fetch.flattenObject)(params.filter), {
                        _sort: field,
                        _order: order,
                        _start: (page - 1) * perPage,
                        _end: page * perPage
                    });
                    url = apiUrl + '/' + resource + '/?' + (0, _queryString.stringify)(query);
                    options.method = 'GET';
                    break;
                }
            default:
                throw new Error('Unsupported fetch action type ' + type);
        }
        return { url: url, options: options };
    };

    return function (type, resource, params) {
        var _convertRESTRequestTo = convertRESTRequestToHTTP(type, resource, params),
            url = _convertRESTRequestTo.url,
            options = _convertRESTRequestTo.options;

        return httpClient(url, options).then(function (response) {
            return response;
        }, function (error) {
            return error;
        });
    };
};