# http-hash-router

Server route handler for http-hash

## Example

```js
var http = require('http');
var HttpHashRouter = require('http-hash-router');

var router = HttpHashRouter();

router.set('/health', function health(req, res) {
    res.end('OK');
});

var server = http.createServer(function handler(req, res) {
    router(req, res, {}, onError);

    function onError(err) {
        if (err) {
            // use your own custom error serialization.
            res.statusCode = err.statusCode || 500;
            res.end(err.message);
        }
    }
});
server.listen(3000);
```

## Documentation

### `var router = HttpHashRouter()`

```ocaml
type NotFoundError : Error & {
    type: "http-hash-router.not-found",
    statusCode: 404
}

type Router : {
    set: (pattern: String, handler: Function | Object) => void
} & (
    req: HttpReqest,
    res: HttpResponse,
    opts: Object,
    cb: Callback<NotFoundError | Error, void>
) => void

http-hash-router : () => Router
```

`HttpHashRouter` will create a new router function.

The `HttpHashRouter` itself takes no options and returns a
function that takes four arguments, `req`, `res`, `opts`, `cb`.

### `router(req, res, opts, cb)`

```ocaml
type NotFoundError : Error & {
    type: "http-hash-router.not-found",
    statusCode: 404
}

router : (
    req: HttpReqest,
    res: HttpResponse,
    opts: Object,
    cb: Callback<NotFoundError | Error, void>
) => void
```

 - throw `http-hash-router.expected.callback` exception.

It is expected that you call the `router` function with the
`HTTPRequest` and `HTTPResponse` as the first and second
arguments.

The third argument is the options object. The `router` will
copy the options object and set the `params` and `splat` field.

The fourth argument is a callback function, this function
either gets called with a `http-hash-router.not-found` error
or gets passed to the route handler function.

If you do not pass a callback to the `router` function then
it will throw the `http-hash-router.expected-callback` exception.

### `router.set(pattern, handler)`

```ocaml
type RoutePattern : String
type RouteHandler : Object<method: String, RouteHandler> | (
    req: HttpRequest,
    res: HttpResponse,
    opts: Object & {
        params: Object<String, String>,
        splat: String | null
    },
    cb: Callback<Error, void>
) => void

set : (RoutePattern, RouteHandler) => void
```

You can call `.set()` on the router and it will internally
store your handler against the pattern.

`.set()` takes a route pattern and a route handler. A route
    handler is either a function or an object. If you use
    an object then we will create a route handler function
    using the [`http-methods`][http-methods] module.

The `.set()` functionality is implemented by
[`http-hash`][http-hash] itself and you can find documentation
for it at [HttpHash#set][http-hash-set].

Your handler function will get called with four arguments.

 - `req` the http request stream
 - `res` the http response stream
 - `opts` options object. This contains properties defined
    in the server and also contains the `params` and `splat`
    fields.
 - `cb` callback.

If your route pattern contains a param, i.e. `"/foo/:bar"` or
your route pattern contains a splat, i.e. `"/foo/*"` then 
the values of the params and splat will be passed to the
`params` and `splat` field on `opts`.

  [http-hash]: https://github.com/Matt-Esch/http-hash
  [http-hash-set]: https://github.com/Matt-Esch/http-hash#hashsetpath-handler
  [http-methods]: https://github.com/Raynos/http-methods
