'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

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

/**
 * Maps admin-on-rest queries to a Django REST Framework (DRF) powered REST API
 *
 * @see 
 * http://www.django-rest-framework.org/ 
 * https://github.com/marmelab/admin-on-rest/blob/master/docs/RestClients.md
 * @example
 * GET_MANY_REFERENCE
 * GET_LIST     => GET http://my.api.url/posts/?_sort=title&_order=ASC&_start=0&_end=24
 * GET_ONE      => GET http://my.api.url/posts/123/
 * UPDATE       => PUT http://my.api.url/posts/123/
 * CREATE       => POST http://my.api.url/posts/123/
 * DELETE       => DELETE http://my.api.url/posts/123/
 */

exports.default = function (apiUrl) {
    var httpClient = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : fetchJsonWithToken;


    /**
     * @param {String} type One of the constants appearing at the top if this file, e.g. 'UPDATE'
     * @param {String} resource Name of the resource to fetch, e.g. 'posts'
     * @param {Object} params The REST request params, depending on the type
     * @returns {Object} { url, options } The HTTP request parameters
     */
    var convertRESTRequestToHTTP = function convertRESTRequestToHTTP(type, resource, params) {
        var url = '';
        var options = {};

        switch (type) {
            case _types.GET_MANY_REFERENCE:
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
            case _types.GET_ONE:
                url = apiUrl + '/' + resource + '/' + params.id + '/';
                break;
            case _types.UPDATE:
                url = apiUrl + '/' + resource + '/' + params.id + '/';
                options.method = 'PUT';
                options.body = JSON.stringify(params.data);
                break;
            case _types.CREATE:
                url = apiUrl + '/' + resource + '/';
                options.method = 'POST';
                options.body = JSON.stringify(params.data);
                break;
            case _types.DELETE:
                url = apiUrl + '/' + resource + '/' + params.id + '/';
                options.method = 'DELETE';
                break;

            default:
                throw new Error('Unsupported fetch action type ' + type);
        }
        return { url: url, options: options };
    };

    /**
     * @param {Object} response HTTP response from fetch(). Includes status, header and json content.
     * @param {String} type One of the constants appearing at the top if this file, e.g. 'UPDATE'
     * @param {String} resource Name of the resource to fetch, e.g. 'posts'
     * @param {Object} params The REST request params, depending on the type
     * @returns {Object} REST response in json { data: json } form
     */
    var convertHTTPResponseToREST = function convertHTTPResponseToREST(response, type, resource, params) {
        var status = response.status,
            headers = response.headers,
            json = response.json;


        switch (type) {
            case _types.GET_LIST:
            case _types.GET_MANY_REFERENCE:
                if (!headers.has('x-total-count')) {
                    throw new Error('The X-Total-Count header is missing in the HTTP Response.');
                }
                return {
                    data: json,
                    total: parseInt(headers.get('x-total-count'))
                };

            case _types.DELETE:
                if (status === 204) {
                    return { data: { "id": params.id } };
                }
                throw new Error('Element not deleted');

            case _types.CREATE:
            case _types.UPDATE:
            case _types.GET_ONE:
                return { data: json };
            default:
                throw new Error('Unsupported fetch action type ' + type);
        }
    };

    var convertHTTPErrorToREST = function convertHTTPErrorToREST(httpError) {
        var status = httpError.status,
            body = httpError.body,
            name = httpError.name;


        if ((typeof body === 'undefined' ? 'undefined' : _typeof(body)) === 'object' && body.detail) {
            httpError.message = body.detail;
        }
        return Promise.reject(httpError);
    };

    /**
     * @param {string} type Request type, e.g GET_LIST
     * @param {string} resource Resource name, e.g. "posts"
     * @param {Object} payload Request parameters. Depends on the request type
     * @returns {Promise} the Promise for a REST response
     */
    return function (type, resource, params) {
        var _convertRESTRequestTo = convertRESTRequestToHTTP(type, resource, params),
            url = _convertRESTRequestTo.url,
            options = _convertRESTRequestTo.options;

        return httpClient(url, options).then(function (response) {
            return convertHTTPResponseToREST(response, type, resource, params);
        }, function (httpError) {
            return convertHTTPErrorToREST(httpError);
        });
    };
};