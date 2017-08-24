namespace ngApp.Configs {
    // DEFINE CLIENT-SIDE ROUTING
    routeCfg.$inject = ["$routeProvider", "$locationProvider"];
    export function routeCfg($routeProvider: angular.route.IRouteProvider, $locationProvider: angular.ILocationProvider) {
        $routeProvider
            .when("/prova", {
                name: "default",
                controller: "ProvaCtrl",
                controllerAs: "$ctrl",
                templateUrl: "tpl/prova.html"
            })
            .when("/async", {
                controller: "AsyncCtrl",
                controllerAs: "$ctrl",
                templateUrl: "tpl/async.html"
            })
            .when("/ping", {
                controller: "PingFactCtrl",
                controllerAs: "$ctrl",
                templateUrl: "tpl/pingfact.html"
                //template: "<rx-ping-cmp></rx-ping-cmp>"
            })
            .when("/count", { //directly use a component passing input data with $resolve
                template: "<rx-counter store='$resolve.root$'></rx-counter>",
                resolve: {
                    root$: (store$: ngStore.store$Service) => { //WORKS WITHOUT $inject IF EXACT MATCH token=par name
                        return store$.rootStore$(); //GET OR INIT rootStore$ AND PASS IT TO COMPONENT AS @Input store
                    }
                }
            })
            .when("/todos/:id", { //directly use a component passing input data with $resolve
                template: "<todos-app-cmp input='$resolve.data'></todos-app-cmp>",
                resolve: {
                    data: ["$route","debugSvc", ($route: angular.route.IRouteService, dbg: Services.debugSvc) => { 
                        //read params from route to pass into $resolve using explicit DI tokens
                        dbg.info("INSIDE RESOLVE", $route, dbg);
                        return $route.current!.params.id; //READ CURRENT PARAMS FROM URL/$route
                    }]
                }
            })
            .when("/lookup/:id", { //directly use a component passing input data with $resolve
                template: "<lookup-app-cmp curr-route='$resolve.data'></lookup-app-cmp>",
                resolve: {
                    data: _resolveCurrentRoute
                }
            })
            .otherwise({name:"default"});
        $locationProvider.hashPrefix(""); //usa vecchia convenzione #/<path>
    }
    
    _resolveCurrentRoute.$inject = ["$route", "debugSvc"]
    function _resolveCurrentRoute($route: angular.route.IRouteService, dbg: Services.debugSvc) { 
        //read params from route to pass into $resolve using fn.$inject for DI
        dbg.info("FUNCITON USED IN RESOLVE WITH EXPLICIT $inject", $route, dbg);
        console.log("$route.current", $route.current);
        return JSON.stringify($route.current); //READ CURRENT PARAMS FROM URL/$route
    }
}