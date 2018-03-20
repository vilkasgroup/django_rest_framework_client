import assert from 'assert';
var expect = require('chai').expect;
import restClient from './restClient';
import localStorage from 'mock-local-storage';
import "isomorphic-fetch";
import {
    GET_LIST,
    GET_ONE,
    GET_MANY,
    GET_MANY_REFERENCE,
    CREATE,
    UPDATE,
    DELETE,
} from 'admin-on-rest/lib/rest/types';

global.window = {};
window.localStorage = global.localStorage;
window.localStorage.setItem('token', 'cdf564def8a97170bb5b4a28f9564df08235f50c');


// Well this doesn't work for some reason...
assert.equal(1, 1);


const fakeHttpClient = (url, options = {}) => {
    // Currently this is really dumb method, that returns
    // response according to the http method. It doesn't know
    // if you are trying to get list or single item etc.
    //
    // For now, we are going to use an actual server (app vilkas_integrations).
    // Once we have more example request, we can add the responses here, so this test can
    // be run without server.
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

const client = restClient('http://localhost:8000/api');


// I don't really like the way we're testing these. Too much boilerplate,
// and it's hard to read. Need to check later, if we should use another
// library for testing.
describe('test get methods', function () {
    // This is a shorthand for what is explained here:
    // https://stackoverflow.com/questions/11235815
    // Note that you can only run 1 test with this.
    // If you need more, you need to include the try block in
    // to your test code. See test below for an example.
    function expect_to_eq(a, b, done){
        const expect_a_to_eq_b = (a, b) => expect(a).to.eq(b);
        try{
            expect_a_to_eq_b(a,b);
            done();
        }catch(e){
            done(e);
        }
    }

    it('should return list of items', function(done){
        client(GET_LIST, 'users',{
            pagination: {},
            sort: {},
            filter: {}
        }).then(response => {
            try {
                expect(response.data[0].id).to.eq(1);
                expect(response.data.length).to.eq(1);
                done();
            } catch( e ) {
                done( e );
            }
        });
    });



    it('should return one item', function(done){
        client(GET_ONE, 'users', { id: 1 }).then(response => {
            expect_to_eq(response.data.id, 1, done);
        });
    });

    it('should throw 404 error', function(done){
        client(GET_ONE, 'users', { id: 999 }).then(
            response => {
                console.error('This promise was supposed to be rejected');
                expect_to_eq(true, false, done);
            },
            error => {
                expect_to_eq(error.message, 'Not found.', done);
            }
        );
    });


});
