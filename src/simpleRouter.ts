export enum HttpMethod {
    PUT = "PUT",
    POST = "POST",
    PATCH = "PATCH",
    GET = "GET",
    DELETE = "DELETE",
    OPTIONS = "OPTIONS",
    HEAD = "HEAD",
    TRACE = "TRACE",
    CONNECT = "CONNECT",
    ANY = "ANY"
}

const WILDCARD = "*";

export interface SimpleHandler {
    method: HttpMethod,
    path: string,
    fn: (ctx: RequestContext) => Promise<any>
}

export interface RequestContext {
    method: HttpMethod,
    body: any,
    queryParams: any,
    headers: any,
    pathParams: any,
    path: string
}

const deaultNotFoundHandler = async (ctx: RequestContext) => {
    return `${ctx.method} ${ctx.path} not found.`
}

export const simpleRouter = (): SimpleRouter => new SimpleRouter();


class SimpleRouter {
    private handlers: SimpleHandler[];
    private notFoundHandler: (ctx: RequestContext) => Promise<any> = deaultNotFoundHandler;

    constructor () {
        this.handlers = [] as any;
    }

    handleNotFound = (handler: (ctx: RequestContext) => Promise<any>) =>
        this.notFoundHandler = handler;
    

    handle = (method: HttpMethod, path: string, fn: (ctx: RequestContext) => Promise<any>) => {
        this.handlers.push({
            method,
            path,
            fn
        });
    }

    execute = async (method: HttpMethod, url: string, headers?: any, body?: any) => {

        // turn path with host in qualified url
        // host doesnt matter, just helps with matching later
        if (url.startsWith("/")) {
            url = `http://localhost${url}`;
        }

        try {
            var uri = new URL(this.stripTrailingSlash(url));
            var handler = this.handlers.find(handler => 
                ( handler.method === method || handler.method == HttpMethod.ANY ) && 
                this.isPathMatch(uri, handler.path)
            );

            const ctx = this.buildContext(method, uri, uri.pathname, headers, body);

            if (handler) {
                return await handler?.fn(ctx);
            }
        
            // if no match, return not found handler response
            return await this.notFoundHandler(ctx);

        } catch (e) {
            console.log((e as Error).message);
        }
        
    }

    private buildContext = (method: HttpMethod, uri: URL, matchPath: string, headers: any, body: any) : RequestContext => ({
        method,
        body,
        queryParams: this.getQueryParams(uri),
        pathParams: this.getPathParams(uri, matchPath),
        headers,
        path: uri.pathname
    })

    private getQueryParams = (uri: URL) => {
        const params: any = {}
        uri.searchParams.forEach((val, key) => {
            params[key] = val
        });

        return params;
    }

    private getPathParams = (uri: URL, matchPath: string) => {
        const params: any = {};
        const reqParts = matchPath.split("/");
        const uriParts = uri.pathname.split("/");

        reqParts.forEach((part, i) => {
            if (part.startsWith("{") && part.endsWith("}")) {
                const paramName = part.slice(1, -1);

                params[paramName] = uriParts[i];
            }
        })

        return params;
    }

    private stripTrailingSlash = (url: string) => {
        if (url.endsWith("/")) {
            return url.substring(-1);
        }

        return url;
    }


    private isPathMatch = (uri: URL, matchAgainst: string ) => {
        const urlParts = uri.pathname.split("/");

        const matchAgainstParts = matchAgainst.split("/");

        // short curcuit false if length differ and no wild card matcher
        if (urlParts.length !== matchAgainstParts.length && !matchAgainstParts.includes(WILDCARD)) {
            return false;
        }

        let isEqual = true;
        matchAgainstParts.forEach((val, i) => {
            // wild card matches everything after as true so assume is match
            if (val === WILDCARD) {
                return (isEqual && true);
            }

            if (val !== urlParts[i] && !(val.startsWith("{") && val.endsWith("}"))) {
                isEqual = false;
            }
        })

        return isEqual;
    }
}
