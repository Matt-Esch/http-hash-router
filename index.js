'use strict';

var HttpHash = require('http-hash');
var url = require('url');
var TypedError = require('error/typed');
var extend = require('xtend');
var httpMethods = require('http-methods/method');

var ExpectedCallbackError = TypedError({
    type: 'http-hash-router.expected.callback',
    message: 'http-hash-router: Expected a callback to be ' +
        'passed as the 4th parameter to handleRequest.\n' +
        'SUGGESTED FIX: call the router with ' +
        '`router(req, res, opts, cb).\n',
    value: null
});
var NotFoundError = TypedError({
    type: 'http-hash-router.not-found',
    message: 'Resource Not Found',
    statusCode: 404
});

module.exports = HttpHashRouter;

function HttpHashRouter() {
    var hash = HttpHash();

    handleRequest.hash = hash;
    handleRequest.set = set;

    return handleRequest;

    function set(name, handler) {
        if (handler && typeof handler === 'object') {
            handler = httpMethods(handler);
        }

        return hash.set(name, handler);
    }

    function handleRequest(req, res, opts, cb) {
        if (typeof cb !== 'function') {
            throw ExpectedCallbackError({
                value: cb
            });
        }

        var pathname = url.parse(req.url).pathname;

        var route = hash.get(pathname);
        if (route.handler === null) {
            return cb(NotFoundError({
                pathname: pathname
            }));
        }

        opts = extend(opts, {
            params: route.params,
            splat: route.splat
        });
        return route.handler(req, res, opts, cb);
    }
}
