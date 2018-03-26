[![Build Status](https://travis-ci.org/vilkasgroup/django_rest_framework_client.svg?branch=master)](https://travis-ci.org/vilkasgroup/django_rest_framework_client)
[![Coverage Status](https://coveralls.io/repos/github/vilkasgroup/django_rest_framework_client/badge.svg?branch=master)](https://coveralls.io/github/vilkasgroup/django_rest_framework_client?branch=master)

# django_rest_framework_client
Djang REST Framework client for admin-on-rest

## Usage

Install the package from npmjs.com:

    npm install aor-django-rest-framework --save

Add these to your App.js


    import DjangoRestClient from "aor-django-rest-framework";
    const restClient = DjangoRestClient("http://my.domain/api");
    const App = () => (
       <Admin dashboard={Dashboard} restClient={restClient}>
        ...

    


## Installation and development

first install npm, and install required packages, build and run tests

    npm install
    npm run build
    npm run test

Travis-ci handles the deployment to npmjs.com.
To deploy a new version:

 - increase the version number in package.json
 - merge changes to master branch
 - git tag the master branch with the same version number
