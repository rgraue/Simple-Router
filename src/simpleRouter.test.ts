import { HttpMethod, RequestContext, simpleRouter } from "./simpleRouter";

var simpleFn = jest.fn();

const testHandler = async (a: any) => {
    console.log("im here", a);
    simpleFn(a);
    return a;
}

describe("simpleRouter", () => {
    it("should call handler with context", async () => {
        var sr = simpleRouter();

        sr.handle(
            HttpMethod.ANY,
            "/test/{any}",
            testHandler
        );

        sr.handle(
            HttpMethod.ANY,
            "/test2",
            async (x) => {}
        );


        var result = await sr.execute(HttpMethod.ANY, "http://localhost:8080/test/3?id=2&a=b");
        expect(simpleFn).toHaveBeenCalledWith(result);
    });

    it('should call handler with headers and body', async () => {
        var sr = simpleRouter();

        var body = { a:'b' };
        var headers = { c: 'd' };

        sr.handle(
            HttpMethod.POST,
            "/test",
            testHandler
        );

        var result = await sr.execute(HttpMethod.POST, "http://localhost:8080/test", headers, body);
        expect(simpleFn).toHaveBeenCalledWith(result);
    });

    it ('should call handler with wild card', async () => {
        var sr = simpleRouter();

        sr.handle(
            HttpMethod.ANY,
            "/test/*",
            testHandler
        );

        sr.handle(
            HttpMethod.ANY,
            "/test2",
            async (x) => {}
        );


        var result = await sr.execute(HttpMethod.ANY, "http://localhost:8080/test/blah/3?id=2&a=b");
        expect(simpleFn).toHaveBeenCalledWith(result);
    })

    it('should call default not found handler if not set', async () => {
        var sr = simpleRouter();

        var result = await sr.execute(HttpMethod.ANY, "http://localhost:8080/test");
        expect(result).toContain("not found.");
    });

    it('should call not found handler', async () => {
        var sr = simpleRouter();

        var notFoundFn = jest.fn();
        var handler = async (ctx: RequestContext) => {
            notFoundFn(ctx);
            return "override";
        };

        sr.handleNotFound(handler);

        var result = await sr.execute(HttpMethod.ANY, "http://localhost:8080/test");
        expect(notFoundFn).toHaveBeenCalled();
        expect(result).toContain("override");
    })
});