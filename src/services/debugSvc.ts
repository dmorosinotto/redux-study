declare function ngDebug(set?: boolean):boolean; //GLOBAL VAR IN WINDOW

namespace ngApp.Services {

    export class debugSvc {
        static $inject = ["$http", "Session"];
        constructor(private $http: ng.IHttpService, public Session: Models.Session) { }

        public isDebug(): boolean {
            return ngDebug(); //READ GLOBAL VAR IN WINDOW.diDebug INITIALIZED IN diapp.cshtml
        }

        public setDebug(val: boolean) {
            ngDebug(val);
        }

        public info(...args: any[]): void {
            if (ngDebug()) console.info("@" + arguments && arguments.callee && arguments.callee.caller && arguments.callee.caller.toString(), "\n->", ...args);
        }

        public warn(...args: any[]): void {
            console.warn("@" + arguments && arguments.callee && arguments.callee.caller && arguments.callee.caller.toString(), "\n->", ...args);
        }

        public error(...args: any[]): void {
            console.error("@" + arguments && arguments.callee && arguments.callee.caller && arguments.callee.caller.toString(), "\n->", ...args);
            try {
                var errinfo = {
                    error: JSON.stringify(args),
                    fn: "@" + arguments && arguments.callee && arguments.callee.caller && arguments.callee.caller.toString()
                }
                setTimeout(() => this.$http.post(this.Session.baseAPI + "LogClientError", errinfo).then(angular.noop, angular.noop), 100);
            } catch (ex) {
                console.log("PROBLEM SENDING ERROR TO SERVER:", ex);
            }
        }

    }
}

