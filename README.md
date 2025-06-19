# Simple Router

A simple router to route traffic to a desired handler. The idea came from the lambda only back end with lambda to lambda communication.

## Usage

```(js)

const router = simpleRouter();

const handlerA = async (ctx: RequestContext) => {
    return 'hello from A';
};

const handlerA = async (ctx: RequestContext) => {
    return 'hello from B';
};

// add as manny handler as you desire
router.handle(HttpMethod.GET, '/example/{id}', handlerA);
router.handle(HttpMethod.ANY, '/example/*', handlerB);


// after handlers are added to router
// call however you desire
await router.execute(method, url);


// if headers and body are present
await router.execute(method, url, headers, body);

```

## Not Found Handler

`SimpleRouter` comes with a default `notFoundHandler`. You can also specify a custom not found handler

```(js)

const router = simpleRouter();

const notFoundHandler = async (ctx: RequestContext) => {
    return 'not found :(';
};

sr.handleNotFound(notFoundHandler);

```