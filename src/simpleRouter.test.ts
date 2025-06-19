import { HttpMethod, RequestContext, simpleRouter } from "./simpleRouter";

const simpleFn = jest.fn();

const testHandler = async (a: any) => {
    console.log("im here", a);
    simpleFn(a);
    return a;
}

describe("simpleRouter", () => {
    it("should call handler with context", async () => {
        const sr = simpleRouter();

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


        const result = await sr.execute(HttpMethod.ANY, "http://localhost:8080/test/3?id=2&a=b");
        expect(simpleFn).toHaveBeenCalledWith(result);
    });

    it('should call handler with headers and body', async () => {
        const sr = simpleRouter();

        const body = { a:'b' };
        const headers = { c: 'd' };

        sr.handle(
            HttpMethod.POST,
            "/test",
            testHandler
        );

        const result = await sr.execute(HttpMethod.POST, "http://localhost:8080/test", headers, body);
        expect(simpleFn).toHaveBeenCalledWith(result);
    });

    it ('should call handler with wild card', async () => {
        const sr = simpleRouter();

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


        const result = await sr.execute(HttpMethod.ANY, "http://localhost:8080/test/blah/3?id=2&a=b");
        expect(simpleFn).toHaveBeenCalledWith(result);
    })

    it('should call default not found handler if not set', async () => {
        const sr = simpleRouter();

        const result = await sr.execute(HttpMethod.ANY, "http://localhost:8080/test");
        expect(result).toContain("not found.");
    });

    it('should call not found handler', async () => {
        const sr = simpleRouter();

        const notFoundFn = jest.fn();
        const handler = async (ctx: RequestContext) => {
            notFoundFn(ctx);
            return "override";
        };

        sr.handleNotFound(handler);

        const result = await sr.execute(HttpMethod.ANY, "http://localhost:8080/test");
        expect(notFoundFn).toHaveBeenCalled();
        expect(result).toContain("override");
    });

    it('should call not found handler if lengths differ and missmastch wildcard', async () => {
        const sr = simpleRouter();

        sr.handle(
            HttpMethod.ANY,
            "/test",
            testHandler
        );


        const result1 = await sr.execute(HttpMethod.ANY, "http://localhost:8080/test/blah/lots/*");
        const result2= await sr.execute(HttpMethod.ANY, "http://localhost:8080/test/blah");

        expect(result1).toContain("not found.");
        expect(result2).toContain("not found.");
    })
});