import { fetchUtils } from 'admin-on-rest';
import { flattenObject } from 'admin-on-rest/lib/util/fetch';
import { stringify } from 'query-string';
import {
    GET_LIST,
    GET_ONE,
    GET_MANY,
    GET_MANY_REFERENCE,
    CREATE,
    UPDATE,
    DELETE,
} from 'admin-on-rest/lib/rest/types';

const fetchJsonWithToken = (url, options = {}) => {
    if (localStorage.getItem('token')) {
        options.user = {
            authenticated: true,
            token: 'Token ' + localStorage.getItem('token')
        };
    }
    return fetchUtils.fetchJson(url, options);
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
export default (apiUrl, httpClient = fetchJsonWithToken) => {

    /**
     * @param {String} type One of the constants appearing at the top if this file, e.g. 'UPDATE'
     * @param {String} resource Name of the resource to fetch, e.g. 'posts'
     * @param {Object} params The REST request params, depending on the type
     * @returns {Object} { url, options } The HTTP request parameters
     */
    const convertRESTRequestToHTTP = (type, resource, params) => {
        let url = '';
        let options = {};

        switch (type) {
            case GET_MANY_REFERENCE:
            case GET_LIST: {
                const page = params.pagination.page || 1;
                const perPage = params.pagination.perPage || 10;
                // specify reverse orderings by prefixing the field name with '-'
                const order = params.sort.order == 'DESC' ? '-' : '';
                const field = params.sort.field || 'id';
                const query = {
                    ...flattenObject(params.filter),
                    ordering: order + field,
                    // The limit indicates the maximum number of items to return
                    limit: perPage,
                    // for LimitOffsetPagination. The offset indicates the starting position of the query in relation
                    offset: (page - 1) * perPage
                };
                url = `${apiUrl}/${resource}/?${stringify(query)}`;
                options.method = 'GET';
                break;
            }
            case GET_ONE:
                url = `${apiUrl}/${resource}/${params.id}/`;
                break;
            case UPDATE:
                url = `${apiUrl}/${resource}/${params.id}/`;
                options.method = 'PUT';
                options.body = JSON.stringify(params.data);
                break;
            case CREATE:
                url = `${apiUrl}/${resource}/`;
                options.method = 'POST';
                options.body = JSON.stringify(params.data);
                break;
            case DELETE:
                url = `${apiUrl}/${resource}/${params.id}/`;
                options.method = 'DELETE';
                break;

            default:
                throw new Error(`Unsupported fetch action type ${type}`);
        }
        return { url, options };
    };

    /**
     * @param {Object} response HTTP response from fetch(). Includes status, header and json content.
     * @param {String} type One of the constants appearing at the top if this file, e.g. 'UPDATE'
     * @param {String} resource Name of the resource to fetch, e.g. 'posts'
     * @param {Object} params The REST request params, depending on the type
     * @returns {Object} REST response in json { data: json } form
     */
    const convertHTTPResponseToREST = (response, type, resource, params) => {
        const { status, headers, json } = response;

        switch (type) {
            case GET_LIST:
            case GET_MANY_REFERENCE:
                // For rest_framework.pagination.LimitOffsetPagination for pagination,
                const data = json.results || json;
                const count = parseInt(headers.get('x-total-count') || json.count || json.length);
                return {
                    data: data,
                    total: count
                };

            case DELETE:
                if (status === 204) {
                    return { data: { "id": params.id } };
                }
                throw new Error('Element not deleted');

            case CREATE:
            case UPDATE:
            case GET_ONE:
                return { data: json };
            default:
                throw new Error(`Unsupported fetch action type ${type}`);
        }
    };

    const convertHTTPErrorToREST = (httpError) => {
        const { status, body, name } = httpError;

        if (typeof (body) === 'object' && body.detail) {
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
    return (type, resource, params) => {
        const { url, options } = convertRESTRequestToHTTP(
            type,
            resource,
            params
        );

        return httpClient(url, options).then(
            response => convertHTTPResponseToREST(response, type, resource, params),
            httpError => convertHTTPErrorToREST(httpError)
        );
    };
};
