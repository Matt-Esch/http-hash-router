'use strict';

var test = require('tape');
var http = require('http');
var makeRequest = require('test-server-request');

var HttpHashRouter = require('../index.js');

test('is function', function t(assert) {
    assert.equal(typeof HttpHashRouter, 'function');
    assert.end();
});

test('fails without callback', function t(assert) {
    var handler = HttpHashRouter();

    assert.throws(function throwIt() {
        handler();
    }, /Expected a callback/);

    assert.end();
});

test('can request multiple urls', function t(assert) {
    var router = HttpHashRouter();
    var server = http.createServer(defaultHandler(router));
    server.listen(0);

    router.set('/foo', function foo(req, res) {
        res.end('foo');
    });
    router.set('/bar', function bar(req, res) {
        res.end('bar');
    });

    makeRequest(server, {
        url: '/foo'
    }, function onResp(err, resp) {
        assert.ifError(err);

        assert.equal(resp.statusCode, 200);
        assert.equal(resp.body, 'foo');

        makeRequest(server, {
            url: '/bar'
        }, function onResp(err, resp) {
            assert.ifError(err);

            assert.equal(resp.statusCode, 200);
            assert.equal(resp.body, 'bar');

            server.close();
            assert.end();
        });
    });
});

test('returns a 404 error', function t(assert) {
    var router = HttpHashRouter();
    var server = http.createServer(defaultHandler(router));
    server.listen(0);

    makeRequest(server, {
        url: '/'
    }, function onResp(err, resp) {
        assert.ifError(err);

        assert.equal(resp.statusCode, 404);
        assert.equal(resp.body, 'Resource Not Found');

        server.close();
        assert.end();
    });
});

test('supports params', function t(assert) {
    var router = HttpHashRouter();
    var server = http.createServer(defaultHandler(router));
    server.listen(0);

    router.set('/:foo', function onFoo(req, res, opts) {
        res.end(opts.params.foo);
    });

    makeRequest(server, {
        url: '/bar'
    }, function onResp(err, resp) {
        assert.ifError(err);

        assert.equal(resp.statusCode, 200);
        assert.equal(resp.body, 'bar');

        server.close();
        assert.end();
    });
});

test('supports splats', function t(assert) {
    var router = HttpHashRouter();
    var server = http.createServer(defaultHandler(router));
    server.listen(0);

    router.set('/*', function onFoo(req, res, opts) {
        res.end(JSON.stringify(opts.splat));
    });

    makeRequest(server, {
        url: '/bar'
    }, function onResp(err, resp) {
        assert.ifError(err);

        assert.equal(resp.statusCode, 200);
        assert.equal(resp.body, '"bar"');

        server.close();
        assert.end();
    });
});

test('supports methods', function t(assert) {
    var router = HttpHashRouter();
    var server = http.createServer(defaultHandler(router));
    server.listen(0);

    router.set('/foo', {
        GET: function onFoo(req, res) {
            res.end('get');
        },
        POST: function onPost(req, res) {
            res.end('post');
        }
    });

    makeRequest(server, {
        url: '/foo',
        method: 'GET'
    }, function onResp(err, resp) {
        assert.ifError(err);

        assert.equal(resp.statusCode, 200);
        assert.equal(resp.body, 'get');

        makeRequest(server, {
            url: '/foo',
            method: 'POST'
        }, function onResp(err, resp) {
            assert.ifError(err);

            assert.equal(resp.statusCode, 200);
            assert.equal(resp.body, 'post');

            makeRequest(server, {
                url: '/foo',
                method: 'PUT'
            }, function onResp(err, resp) {
                assert.ifError(err);

                assert.equal(resp.statusCode, 405);
                assert.equal(resp.body,
                    '405 Method Not Allowed');

                server.close();
                assert.end();
            });
        });
    });
});

function defaultHandler(hashRouter) {
    return function handler(req, res) {
        hashRouter(req, res, {}, function onError(err) {
            if (err) {
                res.statusCode = err.statusCode || 500;
                res.end(err.message);
            }
        });
    };
}
