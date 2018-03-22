[![Build Status](https://travis-ci.org/vilkasgroup/django_rest_framework_client.svg?branch=master)](https://travis-ci.org/vilkasgroup/django_rest_framework_client)

[![Coverage Status](https://coveralls.io/repos/github/vilkasgroup/django_rest_framework_client/badge.svg?branch=master)](https://coveralls.io/github/vilkasgroup/django_rest_framework_client?branch=master)

# django_rest_framework_client
Djang REST Framework client for admin-on-rest

## Usage
    //Add these to your App.js
    ...
    import DjangoRestClient from "aor-django-rest-framework";
    const restClient = DjangoRestClient("http://my.domain/api");
    ...
    const App = () => (
       <Admin dashboard={Dashboard} restClient={restClient}>
        ...

    


## Installation and development

first install npm, and install required packages:

    npm install


Then you need to build the modules. This will take the src from ./src/ and build them using babel:

    npm run build

Then run the test

    npm run test
