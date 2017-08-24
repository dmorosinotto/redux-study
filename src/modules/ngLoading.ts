module ngLoading {
    export interface ISpinner {
        show(backdrop?: boolean): void; //default false
        hide(force?: boolean): void;    //default false
    }

    $spinner.$inject = ["$rootScope"];
    export function $spinner($rootScope: angular.IRootScopeService): ISpinner {
        return {
            show: (backdrop?: boolean) => $rootScope.$emit("ngLoading.show", backdrop), //to show spinner emit "ngLoading.show" on $rootscope that is handled by ng-spinner directive
            hide: (force?: boolean) => $rootScope.$emit("ngLoading.hide", force) //to hide spinner emit "ngLoading.hide" on $rootscope that is handled by ng-spinner directive
        }
    }

    var _counter = 0;
    ngSpinner.$inject = ["$log"];
    export function ngSpinner($log: angular.ILogService): angular.IDirective {
        return {
            restrict: "E",
            template: "<div id='ngLoading-backdrop' style='position: fixed; z-index: 999999998; top: 0; right: 0; bottom: 0; left: 0; background-color: white; opacity: 0.3; display:none;'></div>" + //BACKDROP HIDDEN BY DEFAULT
            "<div id='ngLoading-spinner' style='position: absolute; z-index: 999999999; top:50%; left:50%; width:100px; height:50px; margin-left:-50px; margin-top:-25px; border: 1px solid; background-color: white; opacity: 1.0; display:none;' ><img src='data:image/gif;base64,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' /></div>", // <!--"/Content/spinner.gif"-->
            controller: ["$scope", "$element", "$attrs", function ($scope: angular.IScope, $element: angular.IAugmentedJQuery, $attrs: angular.IAttributes) {
                var $off: (()=>void)[] = [];
                //handle event "ngLoading.show" increment _counter and showing loading spinner if >0
                $off.push($scope.$root.$on("ngLoading.show", (evt: angular.IAngularEvent, backdrop?: boolean) => {
                    ++_counter;
                    if (_counter >= 1) {
                        console.log("Show spinner...", _counter);
                        if (backdrop) $element.children("#ngLoading-backdrop").show();
                        $element.children("#ngLoading-spinner").show();
                        $element.fadeIn(0.25);
                    }
                }));
                //handle event "ngLoading.hide" decrement _counter and hiding loading spinner when =0
                $off.push($scope.$root.$on("ngLoading.hide", (evt: angular.IAngularEvent, force?: boolean) => {
                    --_counter;
                    if (_counter <= 0 || force) {
                        console.log("Hide spinner...", _counter);
                        _counter = 0;
                        $element.children("#ngLoading-backdrop").hide();
                        $element.children("#ngLoading-spinner").hide();
                        $element.fadeOut(0.1);
                    }
                }));
                //cleanup event handler when $destroy directive
                $scope.$on("$destroy", () => {
                    console.log("$destory spinner - cleanup event handlers");
                    $off.map(off => off());
                });
            }]
        }
    }

    LoggingRoute.$inject = ["$rootScope", "$spinner", "$log"];
    export function LoggingRoute($rootScope: angular.IRootScopeService, $spinner: ngLoading.ISpinner, $log: angular.ILogService) {
        console.log("Handling $route change: dispose logic on closing + loading spinner + warning on error");
        $rootScope.$on("$routeChangeStart", (evt: angular.IAngularEvent, next: angular.route.IRoute, curr: angular.route.ICurrentRoute) => {
            if (curr && curr.controller) {
                console.log("$route leave controller:", curr.controller);
                $spinner.show();
                /* if (curr.locals.$scope) {
                    var ctrl = curr.controllerAs ? curr.locals.$scope[curr.controllerAs] : curr.locals.$scope;
                    if (ctrl && ctrl["dispose"]) {
                        $log.debug("closing with DISPOSE --> invoking dispose(...)");
                        ctrl.dispose();
                    } else {
                        $log.debug("without dispose normal closing...");
                    }
                } */
            }
        });

        $rootScope.$on("$routeChangeSuccess", (evt: angular.IAngularEvent) => {
            $spinner.hide();
        });

        $rootScope.$on("$routeChangeError", (evt: angular.IAngularEvent, err) => {
            $log.error("ERROR ROUTE", err);
            $spinner.hide(true);
        });
    }

    LoggingRequest.$inject = ["$q", "$spinner", "$log"]
    export function LoggingRequest($q: angular.IQService, $spinner: ngLoading.ISpinner, $log: angular.ILogService) {
        console.log("Logging $http request: loading spinner + warning on error");
        return {
            request: (config: angular.IRequestConfig) => {
                if (config.url.indexOf("/api/") == 0) {
                    console.log("Request --> ", config);
                    //$log.debug("Request: ", config.method, config.url, " --> ", config.data, config.params);
                    $spinner.show();
                }
                return config || $q.when(config);
            },
            requestError: (rejection: any) => {
                console.error("ERROR REQUEST", rejection);
                //$log.error("ERROR REQUEST", rejection);
                $spinner.hide(true);
                return $q.reject(rejection);
            },
            response: (response: angular.IHttpPromiseCallbackArg<any>) => {
                if (response.config && response.config.url.indexOf("/api/") == 0) {
                    console.log("Response: <-- ", response);
                    //$log.debug("Response: ", response.config.method, response.config.url, " <-- ", response.status, response.data);
                    $spinner.hide();
                }
                return response || $q.when(response);
            },
            responseError: (rejection: any) => {
                console.error("ERROR RESPONSE", rejection);
                //$log.error("ERROR RESPONSE", rejection);
                $spinner.hide(true);
                return $q.reject(rejection);
            }
        }
    }
}

angular.module("ngLoading", []).factory("$spinner", ngLoading.$spinner).directive("ngSpinner", ngLoading.ngSpinner);
