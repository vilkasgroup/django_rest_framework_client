import restClient from './restClient';
import {
    GET_LIST,
    GET_ONE,
    GET_MANY,
    GET_MANY_REFERENCE,
    CREATE,
    UPDATE,
    DELETE,
} from 'admin-on-rest/lib/rest/types';

const fakeHttpClient = (url, options = {}) => {
    // Currently this is really dumb method, that returns
    // response according to the http method. It doesn't know
    // if you are trying to get list or single item etc.
    const response_map = {
        'GET': [
            {
                "id": 1,
                "value": "first fake element"
            },
            {
                "id": 2,
                "value": "second fake element"
            }
        ]
    };
    const response = response_map[options.method];
    console.log('Do fake request: ', options.method);
    if(response){
        return Promise.resolve(response);
    }else{
        // TODO: Check what fetcjJson returns if it fails to connect to server etc.
        return Promise.reject('Fake server did not have response for that request');
    }
};

const client = restClient('localhost:8000/api', fakeHttpClient);
client(GET_LIST, 'users',{
    pagination: {},
    sort: {},
    filter: {}
}).then(response => console.log('RESPONSE: ', response));


