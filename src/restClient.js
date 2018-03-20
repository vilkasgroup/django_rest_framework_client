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
    if(localStorage.getItem('token')) {
        options.user = {
            authenticated: true,
            token: 'Token ' + localStorage.getItem('token')
        };
    }
    return fetchUtils.fetchJson(url, options);
};


export default (apiUrl, httpClient = fetchJsonWithToken ) => {

    const convertRESTRequestToHTTP = (type, resource, params) => {
        let url = '';
        let options = {};

        switch (type){
        case GET_LIST: {
            const page = params.pagination.page || 1;
            const perPage = params.pagination.perPage || 10;
            const field = params.sort.field || 'id';
            const order = params.sort.order || 'ASC';
            const query = {
                ...flattenObject(params.filter),
                _sort: field,
                _order: order,
                _start: (page - 1) * perPage,
                _end: page * perPage
            };
            url = `${apiUrl}/${resource}/?${stringify(query)}`;
            options.method = 'GET';
            break;
        }
        default:
            throw new Error(`Unsupported fetch action type ${type}`);
        }
        return {url, options};
    };

    return (type, resource, params) => {
        const { url, options } = convertRESTRequestToHTTP(
            type,
            resource,
            params
        );

        return httpClient(url, options).then(
            response => (response),
            error => (error)
        );
    };
};
