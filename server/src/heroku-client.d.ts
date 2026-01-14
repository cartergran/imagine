/**
  - type declarations for heroku-client module
  - this module doesn't have official ts types, so we provide minimal typings for the methods used
*/
declare module 'heroku-client' {
  interface HerokuClientOptions {
    token: string;
  }

  interface HerokuRequestOptions {
    body: unknown;
    [key: string]: unknown;
  }

  class Heroku {
    constructor(options: HerokuClientOptions);

    get(path: string, options?: HerokuRequestOptions): HerokuConfigVars;

    patch(path: string, options: HerokuRequestOptions): Promise<unknown>;

    delete(path: string, options?: HerokuRequestOptions): Promise<unknown>;
  }

  export = Heroku;
}
