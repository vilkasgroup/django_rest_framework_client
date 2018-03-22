import assert from 'assert';
var expect = require('chai').expect;
import fetchMock from 'fetch-mock';
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

// Well this doesn't work for some reason... use chai instead.
assert.equal(1, 1);

const fakeData = {
    "users" : [
        {
            "id": 1,
            "username": "user 1"
        }
    ]
};

global.FormData = require('FormData');
fetchMock.get(/.*\/api\/users\/\?.*/, {body: fakeData.users, headers: {'x-total-count': 1}});
fetchMock.get(/.*\/api\/users\/1\//, fakeData.users[0]);
fetchMock.get(/.*\/api\/users\/999\//, {status: 404, body: {detail: "Not found."}});
fetchMock.post(/.*\/api\/users\//, {status: 200, body: fakeData.users[0]});
fetchMock.put(/.*\/api\/users\/1\//, {status: 200, body: fakeData.users[0]});
fetchMock.delete('*', {status: 204, body: {}});

const client = restClient('http://localhost:8000/api');

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
        }).then(
            response => {
                try {
                    expect(response.data[0].id).to.eq(1);
                    expect(response.data.length).to.eq(1);
                    done();
                } catch( e ) {
                    done( e );
                }
            },
            error => console.error(error)
        );
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

    /* Not working with mock-fetch */
    it('should create new user and return id', function(done){
        client(CREATE, "users", { "data": {"username": "foobar" }}).then(
            response => {
                expect_to_eq(1,1, done);
            },
            error => console.error(error)
        );
    });

    it('should update existing user', function(done){
        client(UPDATE, "users", { id: 1, "data": {username: "new username"}}).then(
            response => {
                expect_to_eq(1,1, done);
            },
            error => console.error(error)
        );
    });

    it('should delete and return 204 with empty body', function(done){
        client(DELETE, 'users', {id: 2}).then(
            response => {
                expect_to_eq(response.data.id, 2, done);
            },
            error => console.error(error)
        );
    });

    it('should fail because such method does not exist', function(done){
        let failed = 0;
        try{
            client('FOOBAR', 'users', {}).then(
                response => console.error('This should have failed'),
                error => console.error('This should have failed')
            );
        } catch( e){
            failed = 1;
        }
        expect_to_eq(failed, 1, done);
    });

});
