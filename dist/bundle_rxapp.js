var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
// POLYFILL ANGULAR GLOBAL OBJECT TO ADD AN HELPER METHOD TO REGISTER A COMPLETE MODULE FROM A TYPESCRIPT NAMESPACE OBJECT
angular.createModuleAndRegister = function createModuleAndRegister(nsApp, modName, modDeps) {
    if (modDeps === void 0) { modDeps = []; }
    var mod = angular.module(modName, modDeps); //create new module instace with specific name and dependencies
    if (nsApp.Components)
        angular.forEach(nsApp.Components, function (options, name) { return mod.component(name, options); });
    if (nsApp.Directives)
        mod.directive(nsApp.Directives); //use object syntax to register all Directive "name": function->DDO
    if (nsApp.Controllers)
        mod.controller(nsApp.Controllers); //use object syntax to register all Controller "name": class+$inject[] 
    if (nsApp.Services)
        mod.service(nsApp.Services); //use object syntax to register all Service "name": class (expose this.methods)
    if (nsApp.Filters)
        mod.filter(nsApp.Filters); //use object syntax to register all Filter "name": class constructor as function 
    if (nsApp.Factories)
        angular.forEach(ngApp.Factories, function (value, name) { return mod.factory(name, value); });
    if (nsApp.Constants)
        angular.forEach(nsApp.Constants, function (value, name) { return mod.constant(name, value); });
    if (nsApp.Configs)
        angular.forEach(nsApp.Configs, function (fn, name) { return mod.config(fn); });
    return mod; //return angular module instance, you can chain .constant to setup globals, or .config to configure ng-route provider 
};
var ngApp;
(function (ngApp) {
    var Components;
    (function (Components) {
        var lookupAppCtrl = (function () {
            function lookupAppCtrl(store$) {
                var _this = this;
                this.store$ = store$;
                console.log("CTOR lookupAppCmp - CREATE NEW PRIVATE STORE");
                if (confirm("Vuoi fare DEBUG con RXJS-SPY?")) {
                    RxSpy.spy();
                    RxSpy.show();
                }
                //STORE
                this.store = store$.createStore$("LOOKUP REDUX", {
                    table: ngApp.Stores.Lookup.Table.reducer,
                    filter: ngApp.Stores.Lookup.Filter.reducer
                });
                //ACTIONS
                this.emit$ = {
                    ADD: function () {
                        var value = _this.value;
                        _this.value = "";
                        return ngApp.Stores.Lookup.Table.doAdd({ value: value, done: false });
                    },
                    DEL: ngApp.Stores.Lookup.Table.doDel,
                    UPD: function (id, done) { return ngApp.Stores.Lookup.Table.doUpd(id, { done: done }); },
                    ALL: function () { return ngApp.Stores.Lookup.Filter.doSetFilter("ALL"); },
                    DONE: function () { return ngApp.Stores.Lookup.Filter.doSetFilter("DONE"); },
                    DATA: function () { return ngApp.Stores.Lookup.Filter.doSetFilter("DATA"); },
                };
            }
            lookupAppCtrl.prototype.$onDestroy = function () {
                console.log("DESTROY todosAppCmp - DISPOSE STORE AND UNSUB");
                this.store.dispose();
            };
            lookupAppCtrl.prototype.$onInit = function () {
                console.log("ONINIT todosAppCmp - NOW CAN READ:", this.currRoute, " FROM $resolve");
                //BIND ACTIONS
                this.emit$ = Redux.bindActionCreators(this.emit$, this.store.store.dispatch);
                //SELECTORS
                this.state$ = this.store.createSelector$(function (s) { return s; }).tag("spy_state$");
                this.filter$ = this.store.createSelector$(function (state) { return state.filter.current; }).tag("spy_filter$");
                this.list$ = this.store.createSelector$(ngApp.Stores.Lookup.getAllData).tag("list$all")
                    .combineLatest(this.filter$, function (list, curr) { return list.filter(function (item) {
                    return curr === "ALL" ? true :
                        curr === "DONE" ? item.done :
                            curr === "DATA" ? !item.done : false;
                }); }).tag("list$filtered");
                //RUN INSIDE CONSOLE TO START DEBUG RXJS
                RxSpy.log("list$filtered");
                RxSpy.log("list$all");
            };
            lookupAppCtrl.$inject = ["store$"];
            return lookupAppCtrl;
        }());
        Components.lookupAppCmp = {
            controller: lookupAppCtrl,
            bindings: {
                currRoute: "<"
            },
            template: "\n        <div>\n            <h1>LOOKUP {{($ctrl.filter$ | async:this )}} TABLE</h1>\n            Filter:\n            <button ng-click=\"$ctrl.emit$.ALL()\">ALL</button>\n            <button ng-click=\"$ctrl.emit$.DONE()\">DONE</button>\n            <button ng-click=\"$ctrl.emit$.DATA()\">DATA</button>\n            <hr>\n            <form ng-submit=\"$ctrl.emit$.ADD()\">\n                <label>Digita value:</label>\n                <input ng-model=\"$ctrl.value\">\n                <small>e premi INVIO</small>\n            </form>\n            <ul ng-repeat=\"item in ($ctrl.list$ | async:this) track by item.id\">\n                <li ng-style=\"{'text-decoration': item.done?'line-through':'none'}\"\n                    ng-click=\"$ctrl.emit$.UPD(item.id, !item.done)\">\n                    <button ng-click=\"$ctrl.emit$.DEL(item.id)\">X</button>\n                    <code>@{{item.id}}</code> - {{item.value}}\n                </li>\n            </ul>\n            <hr>\n            <pre>{{ $ctrl.state$ | async:this | json }}</pre>\n            <hr>\n            <code>currRoute={{ $ctrl.currRoute }}</code>\n        </div>"
        };
    })(Components = ngApp.Components || (ngApp.Components = {}));
})(ngApp || (ngApp = {}));
var ngApp;
(function (ngApp) {
    var Components;
    (function (Components) {
        var rxCounterCtrl = (function () {
            function rxCounterCtrl() {
                // CONSTRUCTOR CREATE emit$ MAP TO EASLY BIND ACTIONS TO TEMPLATE
                console.log("CTOR rxCounterCtrl - Create emit$ ActionCreatorMap");
                this.emit$ = {
                    INCR: ngApp.Stores.Count.actINCR,
                    DECR: ngApp.Stores.Count.actDECR,
                    STOP: ngApp.Stores.Count.actSTOP,
                    START: ngApp.Stores.Count.actSTART,
                };
            }
            rxCounterCtrl.prototype.$onInit = function () {
                console.log("INIT rxCounterCtrl - bindActionCreator + createSelector$", this.rootStore$);
                // ONINIT - YOU CAN ACCESS rootStore$ PASSED BY $resolve @Input store
                // AND createSelector$ TO SUBCRBIBE WITH | async:this IN TEMPLATE
                this.counter$ = this.rootStore$.createSelector$(function (state) { return state.count.counter; });
                // AND bindActionCreators TO store.dispatch IN emit$ TO EASY CALL IN TEMPLATE
                this.emit$ = Redux.bindActionCreators(this.emit$, this.rootStore$.store.dispatch);
                console.log("EMIT$=", this.emit$);
            };
            rxCounterCtrl.prototype.$onDestroy = function () {
                console.log("DESTROY rxCounterCtrl - CLEAR emit$ TO AVOID GC PROBLEM");
                this.emit$ = {};
            };
            return rxCounterCtrl;
        }());
        Components.rxCounter = {
            controller: rxCounterCtrl,
            bindings: {
                rootStore$: "<store" //NOME ATTR ESTERNO store, NOME PROP INTERNA rootStore$ 
            },
            template: "\n        <div ng-init=\"d=2\">\n            <button ng-click=\"$ctrl.emit$.INCR()\">INCR</button>\n            <button ng-click=\"$ctrl.emit$.DECR()\">DECR</button>\n            <button ng-click=\"$ctrl.emit$.STOP()\">STOP</button>\n            <button ng-click=\"$ctrl.emit$.START(d)\">START</button>\n            <input type=\"number\" ng-model=\"d\">\n            <code> $ctrl.counter$ | async:this = </code>\n            <h3>{{ $ctrl.counter$ | async:this }}</h3>\n        </div>"
        };
    })(Components = ngApp.Components || (ngApp.Components = {}));
})(ngApp || (ngApp = {}));
var ngApp;
(function (ngApp) {
    var Components;
    (function (Components) {
        var rxPingCtrl = (function () {
            function rxPingCtrl(store$) {
                this.store$ = store$;
                console.log("CTOR rxPingCtrl - SUBSCRIBE TO DATA");
                this.isPinging$ = store$.rootStore$().createSelector$(function (state) { return state.ping.isPinging; });
            }
            rxPingCtrl.prototype.ping = function () {
                this.store$.rootStore$().dispatchAction(ngApp.Stores.Ping.actPING());
            };
            rxPingCtrl.prototype.$onDestroy = function () {
                console.log("DESTROY rxPingCmp - AUTO unsubscribe");
            };
            rxPingCtrl.$inject = ["store$"];
            return rxPingCtrl;
        }());
        Components.rxPingCmp = {
            controller: rxPingCtrl,
            template: "\n        <div>\n            <button ng-click=\"$ctrl.ping()\">Start rxPING</button>\n            <code>isPinging|async:this=</code>\n            <h3> {{($ctrl.isPinging$|async:this) }} <small>inside rx-ping-cmp!</small></h3>\n        </div>"
        };
    })(Components = ngApp.Components || (ngApp.Components = {}));
})(ngApp || (ngApp = {}));
var ngApp;
(function (ngApp) {
    var Components;
    (function (Components) {
        var SimpleCtrl = (function () {
            function SimpleCtrl(dbg) {
                this.dbg = dbg;
                // CONSTRUCTOR DATA NOT READY!!!
                this.dbg.warn("CTOR data=", this.data);
            }
            SimpleCtrl.prototype.$onInit = function () {
                // ONINIT EVENT HANDLER -> DATA OK
                this.dbg.info("$onInit data=", this.data);
            };
            SimpleCtrl.prototype.$onDestroy = function () {
                // REMEMBER TO DISPOSE EVENT HANDLER REGISTERED!!
                this.data = null; //IGNORE NO MORE EFFECT OUTSIDE
                console.log("$onDestrory data=", this.data);
            };
            SimpleCtrl.prototype.log = function (s) {
                var _this = this;
                this.dbg.warn("THIS scope=", s);
                setTimeout(function () {
                    console.log("DATA BEFORE=", _this.data);
                    _this.data = "call $applyAsync";
                    s.$applyAsync(); //SE USO $digest non propaga modifica al padre!
                }, 1000);
            };
            Object.defineProperty(SimpleCtrl.prototype, "isObject", {
                get: function () {
                    return typeof this.data === 'object';
                },
                enumerable: true,
                configurable: true
            });
            SimpleCtrl.$inject = ["debugSvc"];
            return SimpleCtrl;
        }());
        Components.ngSimpleCmp = {
            bindings: {
                data: '<'
            },
            controller: SimpleCtrl,
            template: "You pass me: <input type=\"text\" ng-model=\"$ctrl.data\">\n                    <button ng-click=\"$ctrl.log(this)\">LOG</button>\n                    <code ng-if=\"$ctrl.isObject\">|async={{$ctrl.data|async}}\n                    <small>senza :this sfrutta <b>$rootScope</b>.$applyAsync()</small></code>"
        };
    })(Components = ngApp.Components || (ngApp.Components = {}));
})(ngApp || (ngApp = {}));
var ngApp;
(function (ngApp) {
    var Components;
    (function (Components) {
        var todosAppCtrl = (function () {
            function todosAppCtrl(store$) {
                var _this = this;
                this.store$ = store$;
                console.log("CTOR todosAppCmp - CREATE NEW PRIVATE STORE");
                //STORE
                this.store = store$.createStore$("TODO REDUX", {
                    todos: ngApp.Stores.Todos.List.reducer,
                    filter: ngApp.Stores.Todos.Filter.reducer
                });
                //ACTIONS
                this.emit$ = {
                    ADD: function () {
                        var text = _this.input;
                        _this.input = "";
                        return ngApp.Stores.Todos.List.actTodoAdd(text);
                    },
                    DEL: ngApp.Stores.Todos.List.actTodoDel,
                    CHK: ngApp.Stores.Todos.List.actTodoToggle,
                    ALL: function () { return ngApp.Stores.Todos.Filter.actFilterSet("ALL"); },
                    DONE: function () { return ngApp.Stores.Todos.Filter.actFilterSet("DONE"); },
                    TODO: function () { return ngApp.Stores.Todos.Filter.actFilterSet("TODO"); },
                };
            }
            todosAppCtrl.prototype.$onDestroy = function () {
                console.log("DESTROY todosAppCmp - DISPOSE STORE AND UNSUB");
                this.store.dispose();
            };
            todosAppCtrl.prototype.$onInit = function () {
                console.log("ONINIT todosAppCmp - NOW CAN READ:", this.input, " FROM $resolve");
                //BIND ACTIONS
                this.emit$ = Redux.bindActionCreators(this.emit$, this.store.store.dispatch);
                //SELECTORS
                this.state$ = this.store.createSelector$(function (s) { return s; });
                this.filter$ = this.store.createSelector$(function (state) { return state.filter.current; });
                this.list$ = this.store.createSelector$(function (state) { return state.todos.list; })
                    .combineLatest(this.filter$, function (list, curr) { return list.filter(function (item) {
                    return curr === "ALL" ? true :
                        curr === "DONE" ? item.done :
                            curr === "TODO" ? !item.done : false;
                }); });
            };
            todosAppCtrl.prototype.show = function () {
                alert(this.input);
                this.input = "";
            };
            todosAppCtrl.$inject = ["store$"];
            return todosAppCtrl;
        }());
        Components.todosAppCmp = {
            controller: todosAppCtrl,
            bindings: {
                input: "<"
            },
            template: "\n        <div>\n            <h1>{{($ctrl.filter$ | async:this )}} LIST</h1>\n            Filtre per:\n            <button ng-click=\"$ctrl.emit$.ALL()\">ALL</button>\n            <button ng-click=\"$ctrl.emit$.DONE()\">DONE</button>\n            <button ng-click=\"$ctrl.emit$.TODO()\">TODO</button>\n            <hr>\n            <form ng-submit=\"$ctrl.emit$.ADD()\">\n                <label>Digita todo:</label>\n                <input ng-model=\"$ctrl.input\">\n                <small>e premi INVIO</small>\n            </form>\n            <ul ng-repeat=\"item in ($ctrl.list$ | async:this) track by item.id\">\n                <li ng-style=\"{'text-decoration': item.done?'line-through':'none'}\"\n                    ng-click=\"$ctrl.emit$.CHK(item.id)\">\n                    <button ng-click=\"$ctrl.emit$.DEL(item.id)\">X</button>\n                    <code>@{{item.id}}</code> - {{item.text}}\n                </li>\n            </ul>\n            <hr>\n            <pre>{{ $ctrl.state$ | async:this | json }}</pre>\n        </div>"
        };
    })(Components = ngApp.Components || (ngApp.Components = {}));
})(ngApp || (ngApp = {}));
var ngApp;
(function (ngApp) {
    var Configs;
    (function (Configs) {
        // DEFINE CLIENT-SIDE ROUTING
        routeCfg.$inject = ["$routeProvider", "$locationProvider"];
        function routeCfg($routeProvider, $locationProvider) {
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
                .when("/count", {
                template: "<rx-counter store='$resolve.root$'></rx-counter>",
                resolve: {
                    root$: function (store$) {
                        return store$.rootStore$(); //GET OR INIT rootStore$ AND PASS IT TO COMPONENT AS @Input store
                    }
                }
            })
                .when("/todos/:id", {
                template: "<todos-app-cmp input='$resolve.data'></todos-app-cmp>",
                resolve: {
                    data: ["$route", "debugSvc", function ($route, dbg) {
                            //read params from route to pass into $resolve using explicit DI tokens
                            dbg.info("INSIDE RESOLVE", $route, dbg);
                            return $route.current.params.id; //READ CURRENT PARAMS FROM URL/$route
                        }]
                }
            })
                .when("/lookup/:id", {
                template: "<lookup-app-cmp curr-route='$resolve.data'></lookup-app-cmp>",
                resolve: {
                    data: _resolveCurrentRoute
                }
            })
                .otherwise({ name: "default" });
            $locationProvider.hashPrefix(""); //usa vecchia convenzione #/<path>
        }
        Configs.routeCfg = routeCfg;
        _resolveCurrentRoute.$inject = ["$route", "debugSvc"];
        function _resolveCurrentRoute($route, dbg) {
            //read params from route to pass into $resolve using fn.$inject for DI
            dbg.info("FUNCITON USED IN RESOLVE WITH EXPLICIT $inject", $route, dbg);
            console.log("$route.current", $route.current);
            return JSON.stringify($route.current); //READ CURRENT PARAMS FROM URL/$route
        }
    })(Configs = ngApp.Configs || (ngApp.Configs = {}));
})(ngApp || (ngApp = {}));
var ngApp;
(function (ngApp) {
    var Configs;
    (function (Configs) {
        // DEFINE CLIENT-SIDE ROUTING
        storeCfg.$inject = ["store$Provider"];
        function storeCfg(store$) {
            store$.setDefaultStoreOptions({ devtools: { name: "PIPPO" } });
            store$.setRootStore$({
                ping: ngApp.Stores.Ping.reducer,
                fact: ngApp.Stores.Fact.reducer,
                count: ngApp.Stores.Count.reducer,
            }, [
                ngApp.Stores.Ping.epicPong,
                "epicFactFetch",
                ngApp.Stores.Count.epicStartStop,
                ngApp.Stores.Count.epicDelta
            ]);
        }
        Configs.storeCfg = storeCfg;
    })(Configs = ngApp.Configs || (ngApp.Configs = {}));
})(ngApp || (ngApp = {}));
var ngApp;
(function (ngApp) {
    var Controllers;
    (function (Controllers) {
        var AsyncCtrl = (function () {
            function AsyncCtrl($http, Session) {
                this.$http = $http;
                this.Session = Session;
                this.obs = Rx.Observable.timer(0, 1000).take(10);
            }
            AsyncCtrl.prototype.pro = function () {
                this.obs = Promise.resolve(Math.random());
            };
            AsyncCtrl.prototype.http = function () {
                this.obs = this.$http.get(this.Session.baseAPI + "/random")
                    .then(function (res) { return parseFloat(res.data); });
            };
            AsyncCtrl.prototype.sub = function (n, scope) {
                var _this = this;
                console.log("MANUAL SUBSCRIBE DON'T UPDATE UI", scope);
                Rx.Observable.create(function (o) {
                    var i = 0;
                    n = parseInt(String(n)) || 5;
                    console.log("STARTING...", n);
                    var t = setInterval(function () { return ++i < n ? (Math.random() < 0.1 ? o.error({ shit: i }) : o.next(i)) : o.complete(); }, 1000);
                    return function () { return console.info("CLEAR", t, clearInterval(t)); }; //unsubscribe
                })
                    .subscribe(function (v) {
                    _this.val = v;
                    console.log(v);
                    //console.warn("MUST CALL", scope.$applyAsync(), "TO UPDATE UI");
                }, console.error, function () { return console.warn("COMPLETE", _this.val); });
            };
            AsyncCtrl.$inject = ["$http", "Session"];
            return AsyncCtrl;
        }());
        Controllers.AsyncCtrl = AsyncCtrl;
    })(Controllers = ngApp.Controllers || (ngApp.Controllers = {}));
})(ngApp || (ngApp = {}));
var ngApp;
(function (ngApp) {
    var Controllers;
    (function (Controllers) {
        var PingFactCtrl = (function () {
            function PingFactCtrl(store$, $rootScope) {
                var _this = this;
                // CONSTRUCTOR SUBSCRIBE TO DATA
                this.root$ = store$.rootStore$();
                this.store = store$.rootStore$().store; //this.root$.store;
                this.unsub = this.store.subscribe(function () {
                    _this.isPinging = _this.store.getState().ping.isPinging;
                    console.warn("PASSO NEL store.subscribe LOG DI TUTTO", JSON.stringify(_this.store.getState()));
                    //$rootScope.$applyAsync(); //SE NON CHIAMO A MANO $rootScope.$applyAsync() angular non si aggiorna!
                    //OPPURE DEVO INCLUDERE IL MIDDLEWARE "$digestMiddleware" QUANDO CREO LO STORE, MA NON FUNZIONA BENE 
                    //CON DEVTOOLS NON VIENE INVOCA, OPPURE SOLUZIONE ELEGANTISSIMA USO | async NEL BINDING SUL TEMPLATE
                    //VEDI COME HO FATTO SUL fact$|async:this E NEL COMPONENT A PARTE rxPingCmp -> isPinging$|async:this
                });
                this.fact$ = store$.createSelector$(this.store, function (state) { return state.fact.text; });
                this.redIfErr$ = store$.createSelector$(this.store, function (store) { return store.fact.id > 0 ? 'black' : 'red'; });
            }
            PingFactCtrl.prototype.ping = function () {
                this.store.dispatch(ngApp.Stores.Ping.actPING());
            };
            PingFactCtrl.prototype.fact = function () {
                this.store.dispatch(ngApp.Stores.Fact.actFactRequest(new Date()));
            };
            PingFactCtrl.prototype.$onDestroy = function () {
                this.unsub();
            };
            PingFactCtrl.$inject = ["store$", "$rootScope"];
            return PingFactCtrl;
        }());
        Controllers.PingFactCtrl = PingFactCtrl;
    })(Controllers = ngApp.Controllers || (ngApp.Controllers = {}));
})(ngApp || (ngApp = {}));
var ngApp;
(function (ngApp) {
    var Controllers;
    (function (Controllers) {
        var ProvaCtrl = (function () {
            function ProvaCtrl(Session, dbg) {
                this.dbg = dbg;
                this.title = Session.baseAPI;
                this.dbg.info("Prova CTOR", this);
            }
            ProvaCtrl.prototype.log = function (val) {
                var _this = this;
                console.log(val);
                setTimeout(function () {
                    _this.title = "call $digest";
                    val.$digest(); //qui posso usare $digest e propaga modfica al figlio
                    //, ma meglio $applyAsync() così funziona sempre!!!
                }, 1000);
            };
            ProvaCtrl.prototype.show = function () {
                this.dbg.warn("Prova THIS", this);
                alert(this.title);
            };
            ProvaCtrl.$inject = ["Session", "debugSvc"];
            return ProvaCtrl;
        }());
        Controllers.ProvaCtrl = ProvaCtrl;
    })(Controllers = ngApp.Controllers || (ngApp.Controllers = {}));
})(ngApp || (ngApp = {}));
var ngLoading;
(function (ngLoading) {
    $spinner.$inject = ["$rootScope"];
    function $spinner($rootScope) {
        return {
            show: function (backdrop) { return $rootScope.$emit("ngLoading.show", backdrop); },
            hide: function (force) { return $rootScope.$emit("ngLoading.hide", force); } //to hide spinner emit "ngLoading.hide" on $rootscope that is handled by ng-spinner directive
        };
    }
    ngLoading.$spinner = $spinner;
    var _counter = 0;
    ngSpinner.$inject = ["$log"];
    function ngSpinner($log) {
        return {
            restrict: "E",
            template: "<div id='ngLoading-backdrop' style='position: fixed; z-index: 999999998; top: 0; right: 0; bottom: 0; left: 0; background-color: white; opacity: 0.3; display:none;'></div>" +
                "<div id='ngLoading-spinner' style='position: absolute; z-index: 999999999; top:50%; left:50%; width:100px; height:50px; margin-left:-50px; margin-top:-25px; border: 1px solid; background-color: white; opacity: 1.0; display:none;' ><img src='data:image/gif;base64,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' /></div>",
            controller: ["$scope", "$element", "$attrs", function ($scope, $element, $attrs) {
                    var $off = [];
                    //handle event "ngLoading.show" increment _counter and showing loading spinner if >0
                    $off.push($scope.$root.$on("ngLoading.show", function (evt, backdrop) {
                        ++_counter;
                        if (_counter >= 1) {
                            console.log("Show spinner...", _counter);
                            if (backdrop)
                                $element.children("#ngLoading-backdrop").show();
                            $element.children("#ngLoading-spinner").show();
                            $element.fadeIn(0.25);
                        }
                    }));
                    //handle event "ngLoading.hide" decrement _counter and hiding loading spinner when =0
                    $off.push($scope.$root.$on("ngLoading.hide", function (evt, force) {
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
                    $scope.$on("$destroy", function () {
                        console.log("$destory spinner - cleanup event handlers");
                        $off.map(function (off) { return off(); });
                    });
                }]
        };
    }
    ngLoading.ngSpinner = ngSpinner;
    LoggingRoute.$inject = ["$rootScope", "$spinner", "$log"];
    function LoggingRoute($rootScope, $spinner, $log) {
        console.log("Handling $route change: dispose logic on closing + loading spinner + warning on error");
        $rootScope.$on("$routeChangeStart", function (evt, next, curr) {
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
        $rootScope.$on("$routeChangeSuccess", function (evt) {
            $spinner.hide();
        });
        $rootScope.$on("$routeChangeError", function (evt, err) {
            $log.error("ERROR ROUTE", err);
            $spinner.hide(true);
        });
    }
    ngLoading.LoggingRoute = LoggingRoute;
    LoggingRequest.$inject = ["$q", "$spinner", "$log"];
    function LoggingRequest($q, $spinner, $log) {
        console.log("Logging $http request: loading spinner + warning on error");
        return {
            request: function (config) {
                if (config.url.indexOf("/api/") == 0) {
                    console.log("Request --> ", config);
                    //$log.debug("Request: ", config.method, config.url, " --> ", config.data, config.params);
                    $spinner.show();
                }
                return config || $q.when(config);
            },
            requestError: function (rejection) {
                console.error("ERROR REQUEST", rejection);
                //$log.error("ERROR REQUEST", rejection);
                $spinner.hide(true);
                return $q.reject(rejection);
            },
            response: function (response) {
                if (response.config && response.config.url.indexOf("/api/") == 0) {
                    console.log("Response: <-- ", response);
                    //$log.debug("Response: ", response.config.method, response.config.url, " <-- ", response.status, response.data);
                    $spinner.hide();
                }
                return response || $q.when(response);
            },
            responseError: function (rejection) {
                console.error("ERROR RESPONSE", rejection);
                //$log.error("ERROR RESPONSE", rejection);
                $spinner.hide(true);
                return $q.reject(rejection);
            }
        };
    }
    ngLoading.LoggingRequest = LoggingRequest;
})(ngLoading || (ngLoading = {}));
angular.module("ngLoading", []).factory("$spinner", ngLoading.$spinner).directive("ngSpinner", ngLoading.ngSpinner);
// <reference path="../../typings/signalr/signalr.d.ts" />
var ngSignalR;
(function (ngSignalR) {
    ;
    var signalRProvider = (function () {
        function signalRProvider() {
            this._proxies = {};
            this._config = { logging: false, autoReconnectTimeout: 5000 };
            this.$get.$inject = ["$rootScope", "$q", "$log"];
        }
        //Configuration function
        signalRProvider.prototype.setDefaultStartOptions = function (startOptions) {
            this._config = angular.extend(this._config, startOptions);
        };
        //Provider factory function     
        signalRProvider.prototype.$get = function ($rootScope, $q, $log) {
            var _this = this;
            //internal helper to get Proxy singletons based on hubName
            var _getProxy = function (hubName, startOptions) {
                if (!hubName) {
                    $log.error("ERROR @_getProxy - Must specify hubName!");
                    return {};
                }
                var hn = hubName.toLowerCase(); //normalize to hubname always lowercase for key in _proxies map!
                if (!_this._proxies[hn]) {
                    $log.debug("SignalR create new Proxy for: '" + hubName + "' and Start connection:", startOptions);
                    _this._proxies[hn] = new _SignalRHubProxy($rootScope, $q, $log, hubName, angular.extend({}, _this._config, startOptions));
                }
                else {
                    $log.debug("SignalR use existing Proxy for: '" + hubName + "' - connection state:", _this._proxies[hn].state());
                }
                return _this._proxies[hn];
            };
            //Service istance returned --> $signalR : ISignalRService
            return {
                getHubProxy: function (hubName, startOptions) {
                    //get current proxy (if exist) orelse create a new HubProxy and immediatly start connection
                    return _getProxy(hubName, startOptions);
                },
                registerEntrypoint: function (hubName, clientMethod, handler, $scopeToUpdate) {
                    //register an entrypoint handler for the clientmethod (if proxy doesn't exist immediatly create it and start connection), return a function to cleanup bound (signalr.off)
                    return _getProxy(hubName).registerEntrypoint(clientMethod, handler, $scopeToUpdate || $rootScope);
                },
                registerEvent: function (hubName, clientMethod, eventNamePattern) {
                    //register an EventEmitter bound to clientmethod (if proxy doesn't exist immediatly create it and start connection), return a function to cleanup bound (signalr.off)
                    return _getProxy(hubName).registerEventEmitter(clientMethod, eventNamePattern);
                },
                $onEvent: function (eventName, handler) {
                    //simple helper method to register and handler for $rootScope ngEvent, return the $off deregister function to cleanup event handler later
                    $log.debug("SignalR helper to register $root event: '" + eventName + "' with handler:", handler);
                    return $rootScope.$on(eventName, function (e, d) { return handler(d, e); });
                }
            };
        };
        return signalRProvider;
    }());
    ngSignalR.signalRProvider = signalRProvider;
    var _SignalRHubProxy = (function () {
        function _SignalRHubProxy($rootScope, $q, $log, hubName, startOptions) {
            var _this = this;
            this.$rootScope = $rootScope;
            this.$q = $q;
            this.$log = $log;
            this.connection = $.hubConnection(startOptions && startOptions.url, startOptions);
            this.$$proxy = this.connection.createHubProxy(hubName);
            this.$$proxy.on('.', function () { });
            this.connection.disconnected(function () {
                _this.$log.warn(_this.hubName() + " SignalR disconnected, retry StartConnection in 5 sec...");
                setTimeout(function () { return _this.startConnection(startOptions); }, (startOptions && startOptions.autoReconnectTimeout) || 5000);
            });
            this.connection.error(function (err) { return _this.$log.error(_this.hubName() + " ERROR SIGNALR: ", err); });
            this._invokeQueue = [];
            this.startConnection();
        }
        _SignalRHubProxy.prototype.ready = function () {
            return this._lazyStart.promise;
        };
        _SignalRHubProxy.prototype.hubName = function () {
            return this.$$proxy.hubName;
        };
        _SignalRHubProxy.prototype.state = function () {
            return this.$$proxy.connection.state;
        };
        _SignalRHubProxy.prototype.startConnection = function (startOptions) {
            var _this = this;
            this.$log.log(this.hubName() + " SignalR Proxy starting connection...");
            this._lazyStart = this.$q.defer();
            this.connection.start(startOptions || {}).then(function (ok) { return _this.$log.debug(_this.hubName() + " SignalR Proxy started", ok); }, //this._lazyStart.resolve(this);
            function (ko) { return _this.$log.error(_this.hubName() + " ERROR @startConnection - ", ko); }) //this._lazyStart.reject(ko);
                .done(function () {
                _this.$log.debug(_this.hubName() + " SignalR Proxy ready!");
                _this._lazyStart.resolve(_this);
                _this._invokePending();
            });
        };
        _SignalRHubProxy.prototype.registerEventEmitter = function (clientMethod, eventNamePattern) {
            var _this = this;
            if (!eventNamePattern)
                eventNamePattern = this.hubName() + "@" + clientMethod;
            this.$log.debug(this.hubName() + " SignalR register EventEmitter to map '" + clientMethod + "' to $root event: " + eventNamePattern);
            return this.registerEntrypoint(clientMethod, function (payload) {
                var evt = eventNamePattern.replace(/:[^\/\\\s:]+/gi, //extract :xxx from eventNamePattern
                function (key) { return _this.$rootScope.$eval("p." + key.substr(1), { p: payload || {} }); }); //and replace with payload.xxx value
                _this.$log.debug(_this.hubName() + " SignalR emit event: '" + evt + "' with payload:", payload);
                _this.$rootScope.$emit(evt, payload); //and then emit ngEvent on rootscope passing payload - at the end return off function to deregister eventEmiter 
            });
        };
        _SignalRHubProxy.prototype.registerEntrypoint = function (clientMethod, handler, $scopeToUpdate) {
            var _this = this;
            if (!clientMethod || !handler) {
                this.$log.error("ERROR @registerEntryPoint - Must specify valid clientMethod and handler!");
                return function () { };
            }
            if (!$scopeToUpdate)
                $scopeToUpdate = this.$rootScope;
            this.$log.debug(this.hubName() + " SignalR register Entrypoint for '" + clientMethod + "' with handler:", handler);
            var on = function () {
                var payload = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    payload[_i] = arguments[_i];
                }
                return $scopeToUpdate.$evalAsync(function () { return handler(payload); });
            }; //calling handler with $scope.$evalAync for NOT having problem with $digest already running see: http://stackoverflow.com/questions/12729122/prevent-error-digest-already-in-progress-when-calling-scope-apply
            this.$$proxy.on(clientMethod, on);
            var off = function () {
                _this.$log.debug(_this.hubName() + " SignalR cleanup handler for: " + clientMethod);
                _this.$$proxy.off(clientMethod, on);
            };
            return off;
        };
        _SignalRHubProxy.prototype.invoke = function (serverMethod) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            this.$log.debug(this.hubName(), " SignalR queue invoke to: '" + serverMethod + "' with args:", args);
            args.unshift(serverMethod); //put serverMethod as first args for later call invoke.apply (see _InvokePending() last line)
            this._invokeQueue.push(args); //push in invocation list, to safe handly request while connection not ready
            if (this.state() === 1 /* connected */) {
                this._invokePending(); //immediatly invoke if connection is ready
            }
        };
        _SignalRHubProxy.prototype._invokePending = function () {
            if (!this._invokeQueue)
                return; //process all invoke queue (if any)
            var args; //this will containt serverMethod as first argument (see invoke() first line)
            while (args = this._invokeQueue.shift()) {
                this.$log.debug(this.hubName(), " SignalR dequeue and Call serverMethod: ", args);
                this.$$proxy.invoke.apply(this.$$proxy, args); //the trick is that args first argument is serverMethod name!
            }
        };
        return _SignalRHubProxy;
    }());
})(ngSignalR || (ngSignalR = {}));
angular.module("ngSignalR", []).provider("$signalR", ngSignalR.signalRProvider);
var ngStore;
(function (ngStore) {
    function _createSelector$(store, extractFrom) {
        return Rx.Observable.create(function (o) {
            console.log("_createSelector$ <", extractFrom.name || extractFrom.toString(), "> - Start subsribe to Store...");
            var _old = undefined;
            var _emit = function () {
                try {
                    var state = store.getState();
                    console.log("_createSelector$ <", extractFrom.name || extractFrom.toString(), "> - Current state:", state);
                    var value = extractFrom(state);
                    console.log("-> OLD", JSON.stringify(_old), "VALUE", JSON.stringify(value), " -> ", value !== _old);
                    if (value !== _old) {
                        _old = value;
                        console.log("_createSelector$ <", extractFrom.name || extractFrom.toString(), "> - NEXT value:", value);
                        o.next(value);
                    }
                }
                catch (e) {
                    console.log("_createSelector$ <", extractFrom.name || extractFrom.toString(), "> - ERROR error:", e);
                    o.error(e);
                }
            };
            var unsub = store.subscribe(_emit);
            _emit(); //immediatly emit first value (current State)
            return function () {
                console.log("_createSelecto$ <", extractFrom.name || extractFrom.toString(), "> - CLEANUP unsub to Store!");
                if (unsub)
                    unsub();
                _old = undefined;
                _emit = undefined;
            };
        });
    }
    $digestMiddleware.$inject = ["$rootScope"]; //Angular Factory "$digestMiddleware"
    function $digestMiddleware($rootScope) {
        // DOCS: https://github.com/angular-redux/ng-redux/blob/master/src/components/digestMiddleware.js
        // ADD MIDDLEWARE "$digestMiddleware" COME ULTIMO -> CHIAMA $rootScope.$evalAsync
        // DOCS: https://github.com/angular-redux/ng-redux/blob/master/src/components/ngRedux.js#L74-L75
        return function (store) { return function (next) { return function (action) {
            var res = next(action);
            $rootScope.$evalAsync(); //res);
            console.warn("$DIGEST action:", JSON.stringify(action));
            return res;
        }; }; };
    }
    ngStore.$digestMiddleware = $digestMiddleware;
    //Provider "store$" implementation get$ -> store$Service = new _Store$ instance
    var store$Provider = (function () {
        function store$Provider() {
            this._stores = {};
            this._config = { devtools: false };
            this._rootRE = undefined;
            this.$get.$inject = ["$injector"];
        }
        //Configuration function
        store$Provider.prototype.setDefaultStoreOptions = function (storeOptions) {
            this._config = angular.extend(this._config, storeOptions);
        };
        store$Provider.prototype.setRootStore$ = function (reducer, epics, middlewares) {
            this._rootRE = { reducer: reducer, epics: epics || [], middlewares: middlewares || [] };
        };
        //Provider factory function     
        store$Provider.prototype.$get = function ($injector) {
            var _this = this;
            //Internal helper to get normalized "STORE_NAME" based on storeName | storeOptions.devtools.name | window.document.title | ""
            var _getName = function (storeName, storeOptions) {
                if (!storeName) {
                    storeName = (storeOptions && storeOptions.devtools && storeOptions.devtools.name) || window.document.title || "";
                }
                if (storeOptions && storeOptions.devtools)
                    storeOptions.devtools.name = storeName; //align devtools.name to storeName
                return storeName.toUpperCase().replace(/\s/ig, "_"); //normalized key "STORE_NAME" uppercase and replace spaces with _ 
            };
            //Internal helper to create new "STORE_NAME" with passed reducers/epics orelse get existing one
            var _newStore = function (name, reducers, epics, middlewares, opts) {
                if (!_this._stores[name]) {
                    console.log("Create new Store '" + name + "' with params:", reducers, epics, middlewares, opts);
                    _this._stores[name] = new _Store($injector, name, reducers, epics, middlewares, opts
                    /* CLOSURE onDispose TO REMOVE istance from _stores */ , function () { return delete _this._stores[name]; });
                }
                else {
                    console.log("Return existing Store '" + name + "' instance:", _this._stores[name]);
                }
                return _this._stores[name];
            };
            //Service istance returned --> $ngStore : store$Service
            return {
                createStore$: function (storeName, reducers, epics, middlewares, storeOptions) {
                    //create new Store (with passed params: reducers/epics) orelse get existing one! 
                    var opts = angular.extend({}, _this._config, storeOptions);
                    var name = _getName(storeName, opts);
                    return _newStore(name, reducers, epics || [], middlewares || [], opts);
                },
                getStore$: function (storeName) {
                    //get current Store (if exist) orelse throw exception!
                    var name = _getName(storeName);
                    var exist = _this._stores[name];
                    if (!exist)
                        throw new Error(name + " STORE NOT EXIST!");
                    return exist;
                },
                getStore: function (storeName) {
                    //get current Store (if exist) orelse throw exception!
                    var name = _getName(storeName);
                    var exist = _this._stores[name];
                    if (!exist)
                        throw new Error(name + " STORE NOT EXIST!");
                    return exist.store;
                },
                rootStore$: function () {
                    //get/create rootStore$ ROOTNAME="" with params (reducer/epics) specified in setRootStore$
                    if (!_this._rootRE)
                        throw new Error("MUST SPECIFY ROOT REDUCER/EPICS with setRootStore$");
                    return _newStore("" /*ROOTNAME*/, _this._rootRE.reducer, _this._rootRE.epics, _this._rootRE.middlewares, _this._config);
                },
                createSelector$: _createSelector$
            };
        };
        return store$Provider;
    }());
    ngStore.store$Provider = store$Provider;
    //private class that is the real store$Service implementation
    var _Store = (function () {
        function _Store($injector, name, reducers, epics, middlewares, options, _onDisposeRemoveMeFromParenst_stores) {
            this.$injector = $injector;
            this.name = name;
            this._onDisposeRemoveMeFromParenst_stores = _onDisposeRemoveMeFromParenst_stores;
            // INITIALIZE MIDDLEWARE
            this._Middlewares = [];
            if (middlewares && middlewares.length) {
                this._Middlewares = middlewares.map(function (mid) { return typeof mid === "string" //RESOLVE Factories WITH $injector
                    ? $injector.get(mid)
                    : mid; });
            }
            if (epics && epics.length) {
                this._Epics = epics.map(function (epic) { return typeof epic === "string" //RESOLVE Factories WITH $injector
                    ? $injector.get(epic)
                    : epic; });
                this._epicMiddleware = ReduxObservable.createEpicMiddleware(ReduxObservable.combineEpics.apply(ReduxObservable, this._Epics));
                this._Middlewares.unshift(this._epicMiddleware); //ADD EPIC MIDDLEWARE AS FIRST 1st
            }
            this._rootReducer = typeof reducers === "object"
                ? Redux.combineReducers(reducers)
                : reducers;
            if (options.devtools) {
                //DEVTOOLS REMOTE(https://github.com/zalmoxisus/remote-redux-devtools) OR CHROME (https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd) OR NOTHING
                this._composeEnhancers =
                    (window.RRDT && RRDT.composeWithDevTools && RRDT.composeWithDevTools(angular.extend({ realtime: true, hostname: "localhost", port: 8000 }, options.devtools))) || (window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
                        && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__(options.devtools)) || Redux.compose;
                if (this._Middlewares && this._Middlewares.length) {
                    this.store = Redux.createStore(this._rootReducer, this._composeEnhancers(Redux.applyMiddleware.apply(Redux, this._Middlewares)));
                }
                else {
                    this.store = Redux.createStore(this._rootReducer, this._composeEnhancers());
                }
            }
            else if (this._Middlewares && this._Middlewares.length) {
                this.store = Redux.createStore(this._rootReducer, Redux.applyMiddleware.apply(Redux, this._Middlewares));
            }
            else {
                this.store = Redux.createStore(this._rootReducer);
            }
        }
        _Store.prototype.createSelector$ = function (selector) {
            return _createSelector$(this.store, selector);
        };
        _Store.prototype.dispatchAction = function (action) {
            this.store.dispatch(action);
        };
        _Store.prototype.dispose = function (_DISPOSE_ACTION_TYPE_) {
            if (_DISPOSE_ACTION_TYPE_ === void 0) { _DISPOSE_ACTION_TYPE_ = "@@redux-observable/EPIC_END" /* _DISPOSE_ */; }
            //TRY TO FREE ALL REFERENCE TO HELP GC CLEANUP DOCS: https://redux-observable.js.org/docs/recipes/HotModuleReplacement.html
            console.log("Try cleanup Store: '", this.name, "' dispatching:", _DISPOSE_ACTION_TYPE_);
            var _DISPOSE_ = undefined;
            if (this._epicMiddleware) {
                this._epicMiddleware.replaceEpic(function (a$) { return Rx.Observable.empty(); });
                this._epicMiddleware = _DISPOSE_;
            }
            if (this.store) {
                this.store.dispatch({ type: _DISPOSE_ACTION_TYPE_ });
                this.store.replaceReducer(function (s, a) { return _DISPOSE_; });
                this.store.dispatch({ type: _DISPOSE_ACTION_TYPE_ });
            }
            this.$injector = _DISPOSE_;
            this._Middlewares && this._Middlewares.splice(0);
            this._Middlewares = _DISPOSE_;
            this._Epics && this._Epics.splice(0);
            this._Epics = _DISPOSE_;
            this._composeEnhancers = _DISPOSE_;
            this._rootReducer = _DISPOSE_;
            this.store = _DISPOSE_;
            if (typeof this._onDisposeRemoveMeFromParenst_stores === "function")
                this._onDisposeRemoveMeFromParenst_stores();
            this._onDisposeRemoveMeFromParenst_stores = _DISPOSE_;
            console.log("DISPOSED _Store:", this.name);
        };
        return _Store;
    }());
    //asyncPipe equivalent to NG2/4+ use with binding = "obs$ | async:this" to auto-unsubscribe!
    //DOCS: https://github.com/cvuorinen/angular1-async-filter
    function asyncPipe($rootScope) {
        var _vals = {};
        var _subs = {};
        function _isObservableLike(o) {
            return o && o.subscribe; //SIMPLE TYPEGUAD FOR ObservableLike
        }
        function _isPromiseLike(o) {
            return o && o.then; //SIMPLE TYPEGUARD FOR PromiseLike
        }
        function async(input, scope) {
            // Make sure we have an Observable or a Promise
            if (!input || !(_isObservableLike(input) || _isPromiseLike(input))) {
                return input;
            }
            var inputId = objectId(input);
            if (!(inputId in _subs)) {
                var subscriptionStrategy = (_isObservableLike(input) && input.subscribe.bind(input))
                    || (_isPromiseLike(input) && input.then.bind(input))
                    || (input.success && input.success.bind(input)); // To make it work with HttpPromise
                _subs[inputId] = subscriptionStrategy(function (value) {
                    _vals[inputId] = value;
                    if (scope && scope.$applyAsync) {
                        scope.$applyAsync(); // Automatic safe apply, if scope provided
                    }
                    else
                        $rootScope.$applyAsync(); //safly run $digest in Angular BUT WITHOUT PASSIN :this=scope CAN'T REGISTER CLEARUP-UNSUBSCRIBE!!!
                });
                if (scope && scope.$on) {
                    // Clean up subscription and its last value when the scope is destroyed.
                    scope.$on("$destroy", function () {
                        var sub = _subs[inputId];
                        if (sub) {
                            console.log("UNSUBSCRIBE | async @", inputId, sub);
                            sub.unsubscribe && sub.unsubscribe();
                            sub.dispose && sub.dispose();
                        }
                        delete _subs[inputId];
                        delete _vals[inputId];
                    });
                }
            }
            return _vals[inputId];
        }
        ;
        // Need a way to tell the input objects apart from each other (so we only subscribe to them once)
        var nextObjectID = 0;
        function objectId(obj) {
            if (!obj.hasOwnProperty('__asyncFilterObjectID__')) {
                obj.__asyncFilterObjectID__ = ++nextObjectID;
            }
            return obj.__asyncFilterObjectID__;
        }
        // So that Angular does not cache the return value
        async.$stateful = true;
        async.$inject = ["$rootScope"];
        return async;
    }
    ngStore.asyncPipe = asyncPipe;
    ;
})(ngStore || (ngStore = {}));
angular.module("ngStore", [])
    .factory("$digestMiddleware", ngStore.$digestMiddleware)
    .provider("store$", ngStore.store$Provider)
    .filter("async", ngStore.asyncPipe)
    .run(["store$", function (store$) {
        console.log("RUN INSIDE ngStore - Now store$ is fully configured!", store$);
    }]);
var ngApp;
(function (ngApp) {
    var Services;
    (function (Services) {
        var debugSvc = (function () {
            function debugSvc($http, Session) {
                this.$http = $http;
                this.Session = Session;
            }
            debugSvc.prototype.isDebug = function () {
                return ngDebug(); //READ GLOBAL VAR IN WINDOW.diDebug INITIALIZED IN diapp.cshtml
            };
            debugSvc.prototype.setDebug = function (val) {
                ngDebug(val);
            };
            debugSvc.prototype.info = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                if (ngDebug())
                    console.info.apply(console, ["@" + arguments && arguments.callee && arguments.callee.caller && arguments.callee.caller.toString(), "\n->"].concat(args));
            };
            debugSvc.prototype.warn = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                console.warn.apply(console, ["@" + arguments && arguments.callee && arguments.callee.caller && arguments.callee.caller.toString(), "\n->"].concat(args));
            };
            debugSvc.prototype.error = function () {
                var _this = this;
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                console.error.apply(console, ["@" + arguments && arguments.callee && arguments.callee.caller && arguments.callee.caller.toString(), "\n->"].concat(args));
                try {
                    var errinfo = {
                        error: JSON.stringify(args),
                        fn: "@" + arguments && arguments.callee && arguments.callee.caller && arguments.callee.caller.toString()
                    };
                    setTimeout(function () { return _this.$http.post(_this.Session.baseAPI + "LogClientError", errinfo).then(angular.noop, angular.noop); }, 100);
                }
                catch (ex) {
                    console.log("PROBLEM SENDING ERROR TO SERVER:", ex);
                }
            };
            debugSvc.$inject = ["$http", "Session"];
            return debugSvc;
        }());
        Services.debugSvc = debugSvc;
    })(Services = ngApp.Services || (ngApp.Services = {}));
})(ngApp || (ngApp = {}));
var ngApp;
(function (ngApp) {
    var Stores;
    (function (Stores) {
        var Count;
        (function (Count) {
            var initialState = { counter: 0 };
            // REDUCERS
            Count.reducer = function (state, action) {
                if (state === void 0) { state = initialState; }
                switch (action.type) {
                    case "INCR" /* INCR */:
                        return { counter: state.counter + 1 };
                    case "DECR" /* DECR */:
                        return { counter: state.counter - 1 };
                    default:
                        return state;
                }
            };
            // ACTION CREATORS
            Count.actINCR = function () { return ({ type: "INCR" /* INCR */ }); };
            Count.actDECR = function () { return ({ type: "DECR" /* DECR */ }); };
            Count.actSTOP = function () { return ({ type: "STOP" /* STOP */ }); };
            Count.actSTART = function (delta) { return ({ type: "START" /* START */,
                delta: parseInt(String(delta), 10) || +1 }); };
            Count.actDELTA = function (delta) { return ({ type: "DELTA" /* DELTA */, delta: delta }); };
            // EPICS
            Count.epicStartStop = function (action$) {
                return action$.ofType("START" /* START */)
                    .switchMap(function (act) {
                    return Rx.Observable.timer(0, 500)
                        .do(function (_) { return console.log(">>> EPIC EMIT DELTA", act.delta); })
                        .mapTo(Count.actDELTA(act.delta))
                        .takeUntil(action$.ofType("STOP" /* STOP */));
                });
            };
            Count.epicDelta = function (action$) {
                return action$.ofType("DELTA" /* DELTA */)
                    .mergeMap(function (act) {
                    var arr = new Array(Math.abs(act.delta))
                        .fill(act.delta > 0 ? Count.actINCR() : Count.actDECR());
                    return Rx.Observable.from(arr);
                });
            };
        })(Count = Stores.Count || (Stores.Count = {}));
    })(Stores = ngApp.Stores || (ngApp.Stores = {}));
})(ngApp || (ngApp = {}));
var ngApp;
(function (ngApp) {
    var Stores;
    (function (Stores) {
        var Fact;
        (function (Fact) {
            var initialState = {
                id: 0,
                text: ""
            };
            // REDUCERS
            Fact.reducer = function (state, action) {
                if (state === void 0) { state = initialState; }
                switch (action.type) {
                    case "FACT_SUCCESS" /* FACT_SUCCESS */:
                        return __assign({}, state, { 
                            // `id` is the number.year
                            id: action.payload.number + action.payload.year / 10000, text: action.payload.text });
                    case "FACT_FAILURE" /* FACT_FAILURE */:
                        return __assign({}, state, { id: -1, text: "ERROR: " + JSON.stringify(action.error) });
                    default:
                        return state;
                }
            };
            // ACTION CREATORS
            Fact.actFactRequest = function (day) { return ({ type: "FACT_REQUEST" /* FACT_REQUEST */, day: day }); };
            Fact.actFactSuccess = function (payload) { return ({ type: "FACT_SUCCESS" /* FACT_SUCCESS */, payload: payload }); };
            Fact.actFactFailure = function (error) { return ({ type: "FACT_FAILURE" /* FACT_FAILURE */, error: error }); };
        })(Fact = Stores.Fact || (Stores.Fact = {}));
    })(Stores = ngApp.Stores || (ngApp.Stores = {}));
})(ngApp || (ngApp = {}));
// EPICS
(function (ngApp) {
    var Factories;
    (function (Factories) {
        epicFactFetch.$inject = ["$http"];
        function epicFactFetch($http) {
            console.log("$HTTP", $http);
            return function (action$) {
                return action$.ofType("FACT_REQUEST" /* FACT_REQUEST */)
                    .mergeMap(function (action) {
                    var d = typeof action.day === "string" ? new Date(action.day) : action.day;
                    console.log(d.getDate(), d.getMonth(), "CALL -> http://numbersapi.com/" + d.getMonth() + "/" + d.getDate() + "/date?json=true");
                    return Rx.Observable.fromPromise($http.get("http://numbersapi.com/" + d.getMonth() + "/" + d.getDate() + "/date?json=true")
                        .then(function (res) { return res.data; })
                        .then(function (d) { if (d.year >= 1900)
                        return d; console.error(d); throw "I WAS NOT BORN IN " + d.year; })).do(function () { return console.log(">>> EPIC EMIT FACT_SUCCESS!"); })
                        .map(function (payload) { return ngApp.Stores.Fact.actFactSuccess(payload); })
                        .catch(function (err) { return Rx.Observable.of(ngApp.Stores.Fact.actFactFailure(err)); });
                });
            };
        }
        Factories.epicFactFetch = epicFactFetch;
    })(Factories = ngApp.Factories || (ngApp.Factories = {}));
})(ngApp || (ngApp = {}));
var ngApp;
(function (ngApp) {
    var Stores;
    (function (Stores) {
        var Ping;
        (function (Ping) {
            var initialState = { isPinging: false };
            // REDUCERS
            Ping.reducer = function (state, action) {
                if (state === void 0) { state = initialState; }
                switch (action.type) {
                    case "PING" /* PING */:
                        return { isPinging: true };
                    case "PONG" /* PONG */:
                        return { isPinging: false };
                    default:
                        return state;
                }
            };
            // ACTION CREATORS
            Ping.actPING = function () { return ({ type: "PING" /* PING */ }); };
            Ping.actPONG = function () { return ({ type: "PONG" /* PONG */ }); };
            // EPICS
            Ping.epicPong = function (action$) {
                return action$.ofType("PING" /* PING */)
                    .delay(1000) // Asynchronously wait 1000ms then continue
                    .do(function () { return console.log(">>> EPIC EMIT PONG!"); })
                    .mapTo(Ping.actPONG());
            };
        })(Ping = Stores.Ping || (Stores.Ping = {}));
    })(Stores = ngApp.Stores || (ngApp.Stores = {}));
})(ngApp || (ngApp = {}));
var ngApp;
(function (ngApp) {
    var Stores;
    (function (Stores) {
        var Lookup;
        (function (Lookup) {
            var Filter;
            (function (Filter) {
                var initialState = {
                    current: "ALL",
                };
                // REDUCERS
                Filter.reducer = function (state, action) {
                    if (state === void 0) { state = initialState; }
                    switch (action.type) {
                        case "[Lookup/Filter] SET" /* SET */:
                            return __assign({}, state, { current: action.filter });
                        default:
                            return state;
                    }
                };
                // ACTION CREATORS
                Filter.doSetFilter = function (filter) { return ({ type: "[Lookup/Filter] SET" /* SET */, filter: filter }); };
            })(Filter = Lookup.Filter || (Lookup.Filter = {}));
        })(Lookup = Stores.Lookup || (Stores.Lookup = {}));
    })(Stores = ngApp.Stores || (ngApp.Stores = {}));
})(ngApp || (ngApp = {}));
var ngApp;
(function (ngApp) {
    var Stores;
    (function (Stores) {
        var Lookup;
        (function (Lookup) {
            // SELECTORS
            Lookup.getAllData = function (state) { return Lookup.Table.getAll(state.table); };
        })(Lookup = Stores.Lookup || (Stores.Lookup = {}));
    })(Stores = ngApp.Stores || (ngApp.Stores = {}));
})(ngApp || (ngApp = {}));
var ngApp;
(function (ngApp) {
    var Stores;
    (function (Stores) {
        var Lookup;
        (function (Lookup) {
            var Table;
            (function (Table) {
                var allIds;
                (function (allIds) {
                    var initialState = [];
                    // REDUCERS
                    allIds.reducer = function (state, action) {
                        if (state === void 0) { state = initialState; }
                        switch (action.type) {
                            case "[Lookup/Table] ADD" /* ADD */:
                                return state.concat([action.id]);
                            case "[Lookup/Table] DEL" /* DEL */:
                                return state.filter(function (id) { return id !== action.id; });
                            default:
                                return state;
                        }
                    };
                })(allIds = Table.allIds || (Table.allIds = {}));
            })(Table = Lookup.Table || (Lookup.Table = {}));
        })(Lookup = Stores.Lookup || (Stores.Lookup = {}));
    })(Stores = ngApp.Stores || (ngApp.Stores = {}));
})(ngApp || (ngApp = {}));
var ngApp;
(function (ngApp) {
    var Stores;
    (function (Stores) {
        var Lookup;
        (function (Lookup) {
            var Table;
            (function (Table) {
                var byId;
                (function (byId) {
                    var initialState = {};
                    // REDUCERS
                    byId.reducer = function (state, action) {
                        if (state === void 0) { state = initialState; }
                        switch (action.type) {
                            case "[Lookup/Table] ADD" /* ADD */:
                            case "[Lookup/Table] UPD" /* UPD */:
                                return __assign({}, state, (_a = {}, _a[action.id] = Table.Data.reducer(state[action.id], action), _a));
                            case "[Lookup/Table] DEL" /* DEL */:
                                var newstate = __assign({}, state);
                                delete newstate[action.id];
                                return newstate;
                            default:
                                return state;
                        }
                        var _a;
                    };
                })(byId = Table.byId || (Table.byId = {}));
            })(Table = Lookup.Table || (Lookup.Table = {}));
        })(Lookup = Stores.Lookup || (Stores.Lookup = {}));
    })(Stores = ngApp.Stores || (ngApp.Stores = {}));
})(ngApp || (ngApp = {}));
var ngApp;
(function (ngApp) {
    var Stores;
    (function (Stores) {
        var Lookup;
        (function (Lookup) {
            var Table;
            (function (Table) {
                var Data;
                (function (Data) {
                    var initialState = {};
                    // REDUCERS
                    Data.reducer = function (state, action) {
                        if (state === void 0) { state = initialState; }
                        switch (action.type) {
                            case "[Lookup/Table] ADD" /* ADD */:
                                return __assign({ id: action.id }, action.payload);
                            case "[Lookup/Table] UPD" /* UPD */:
                                return __assign({}, state, action.payload);
                            default:
                                return state;
                        }
                    };
                })(Data = Table.Data || (Table.Data = {}));
            })(Table = Lookup.Table || (Lookup.Table = {}));
        })(Lookup = Stores.Lookup || (Stores.Lookup = {}));
    })(Stores = ngApp.Stores || (ngApp.Stores = {}));
})(ngApp || (ngApp = {}));
var ngApp;
(function (ngApp) {
    var Stores;
    (function (Stores) {
        var Lookup;
        (function (Lookup) {
            var Table;
            (function (Table) {
                // REDUCERS
                Table.reducer = Redux.combineReducers({
                    byId: Table.byId.reducer,
                    allIds: Table.allIds.reducer
                });
                // SELECTORS
                Table.getAll = function (state) {
                    return state.allIds.map(function (id) { return state.byId[id]; });
                };
                // ACTION CREATORS
                Table.doAdd = function (payload) {
                    return ({ type: "[Lookup/Table] ADD" /* ADD */, payload: payload, id: new Date().valueOf() });
                };
                Table.doDel = function (id) {
                    return ({ type: "[Lookup/Table] DEL" /* DEL */, id: id });
                };
                Table.doUpd = function (id, payload) {
                    return ({ type: "[Lookup/Table] UPD" /* UPD */, id: id, payload: payload });
                };
            })(Table = Lookup.Table || (Lookup.Table = {}));
        })(Lookup = Stores.Lookup || (Stores.Lookup = {}));
    })(Stores = ngApp.Stores || (ngApp.Stores = {}));
})(ngApp || (ngApp = {}));
var ngApp;
(function (ngApp) {
    var Stores;
    (function (Stores) {
        var Todos;
        (function (Todos) {
            var Filter;
            (function (Filter) {
                var initialState = {
                    current: "ALL",
                };
                // REDUCERS
                Filter.reducer = function (state, action) {
                    if (state === void 0) { state = initialState; }
                    switch (action.type) {
                        case "[Lookup/Filter] SET" /* SET_FILTER */:
                            return __assign({}, state, { current: action.filter });
                        default:
                            return state;
                    }
                };
                // ACTION CREATORS
                Filter.actFilterSet = function (filter) { return ({ type: "[Lookup/Filter] SET" /* SET_FILTER */, filter: filter }); };
            })(Filter = Todos.Filter || (Todos.Filter = {}));
        })(Todos = Stores.Todos || (Stores.Todos = {}));
    })(Stores = ngApp.Stores || (ngApp.Stores = {}));
})(ngApp || (ngApp = {}));
var ngApp;
(function (ngApp) {
    var Stores;
    (function (Stores) {
        var Todos;
        (function (Todos) {
            var List;
            (function (List) {
                var initialState = {
                    list: [],
                };
                // REDUCERS
                List.reducer = function (state, action) {
                    if (state === void 0) { state = initialState; }
                    switch (action.type) {
                        case "TODO_ADD" /* TODO_ADD */:
                            return __assign({}, state, { list: state.list.concat([{
                                        done: false,
                                        text: action.text,
                                        id: action.id,
                                    }]) });
                        case "TODO_DEL" /* TODO_DEL */:
                            return __assign({}, state, { list: state.list.filter(function (item) { return item.id !== action.id; }) });
                        case "TODO_CHK" /* TODO_CHK */:
                            return __assign({}, state, { list: state.list.map(function (item) { return item.id === action.id ? __assign({}, item, { done: !item.done }) : item; }) });
                        default:
                            return state;
                    }
                };
                // ACTION CREATORS
                List.actTodoAdd = function (text) { return ({ type: "TODO_ADD" /* TODO_ADD */, text: text, id: new Date().valueOf() }); };
                List.actTodoDel = function (id) { return ({ type: "TODO_DEL" /* TODO_DEL */, id: id }); };
                List.actTodoToggle = function (id) { return ({ type: "TODO_CHK" /* TODO_CHK */, id: id }); };
            })(List = Todos.List || (Todos.List = {}));
        })(Todos = Stores.Todos || (Stores.Todos = {}));
    })(Stores = ngApp.Stores || (ngApp.Stores = {}));
})(ngApp || (ngApp = {}));
//# sourceMappingURL=bundle_rxapp.js.map