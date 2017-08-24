module ngStore {
    export const enum ACTION_TYPE { //AZIONE USATA PER FARE DISPOSE / CLEANUP STESSO DI REDUX-OBSERVABLE
        //DOCS: https://github.com/redux-observable/redux-observable/blob/master/src/EPIC_END.js
        _DISPOSE_ = "@@redux-observable/EPIC_END" 
    }

    export interface StoreOptions<S,A> {
        devtools: false | DevToolsOptions<S,A>
    }
    
    export interface DevToolsOptions<S,A> { 
        //DOCS: https://github.com/zalmoxisus/redux-devtools-extension/blob/master/docs/API/Arguments.md
        name: string;
        actionCreators?: object;
        latency?: number;
        maxAge?: number;
        serialize?: boolean | object;
        actionSanitizer?: (action: A)=>A;
        stateSanitizer?: (state: S)=>S;
        actionsBlacklist?: string | string[];
        actionsWhitelist?: string | string[];
        predicate?: (state:S, action:A)=>boolean;
        shouldRecordChanges?: boolean;
        pauseActionType?: string;
        autoPause?: boolean;
        shouldStartLocked?: boolean;
        shouldHotReload?: boolean;
        shouldCatchErrors?: boolean;
        features?: {[key: string]: boolean};
    }

    export interface Store$<S,A> {
        store: Redux.Store<S>;
        createSelector$<T>(selector: Selector<S,T>): Rx.Observable<T>;
        dispatchAction<A extends Redux.Action>(act: A):void;
        dispose(): void;
    }

    export type Selector<S,T> = (state: S)=>T

    export interface store$Service {
        createStore$<S=any,A extends Redux.Action=any>(storeName: string, reducers: Redux.Reducer<S> | Redux.ReducersMapObject, epics?: (string | ReduxObservable.Epic<A,S>)[], storeOptions?: StoreOptions<S,A>): Store$<S,A>
        getStore$<S=any,A extends Redux.Action=any>(storeName: string): Store$<S,A>;
        getStore<S=any>(storeName: string): Redux.Store<S>;
        createSelector$<S,T>(store: Redux.Store<S>, selector: Selector<S,T>): Rx.Observable<T>
        rootStore$<S=any,A extends Redux.Action=any>(): Store$<S,A>;
    }

    

    function _createSelector$<S,T>(store: Redux.Store<S>, extractFrom: (state:S)=>T ): Rx.Observable<T> 
    { //HELPER PER TRASFORAMRE selector IN OBSERVABLE DA USARE CON | async:this
        return Rx.Observable.create((o:Rx.Observer<T>)=>{
            console.log("_createSelector$ <", extractFrom.name || extractFrom.toString(), "> - Start subsribe to Store...");
            let _old:T|undefined = undefined;
            let _emit = ()=>{
                try {
                    let state = store.getState();
                    console.log("_createSelector$ <", extractFrom.name || extractFrom.toString(), "> - Current state:", state);
                    let value = extractFrom(state);
                    console.log("-> OLD", JSON.stringify(_old), "VALUE", JSON.stringify(value), " -> ", value!==_old);
                    if (value!==_old) {
                        _old = value;
                        console.log("_createSelector$ <", extractFrom.name || extractFrom.toString(), "> - NEXT value:", value);
                        o.next(value);
                    }
                } catch (e) {
                    console.log("_createSelector$ <", extractFrom.name || extractFrom.toString(), "> - ERROR error:", e);
                    o.error(e);
                }
            }
            let unsub: Redux.Unsubscribe = store.subscribe(_emit);
            _emit(); //immediatly emit first value (current State)
            return ()=>{ // obs.unsubscribe
                console.log("_createSelecto$ <", extractFrom.name || extractFrom.toString(), "> - CLEANUP unsub to Store!");
                if (unsub) unsub();
                _old = undefined;
                _emit = undefined as any;
            }
        });
    }

    $digestMiddleware.$inject = ["$rootScope"]; //Angular Factory "$digestMiddleware"
    export function $digestMiddleware($rootScope: angular.IRootScopeService): Redux.Middleware 
    { // PER FAR SCATENAR CICLO $digest SU angular OGNI VOLTA CHE AVVIENE CAMBIO DI STATO IN Redux
      // DOCS: https://github.com/angular-redux/ng-redux/blob/master/src/components/digestMiddleware.js
      // ADD MIDDLEWARE "$digestMiddleware" COME ULTIMO -> CHIAMA $rootScope.$evalAsync
      // DOCS: https://github.com/angular-redux/ng-redux/blob/master/src/components/ngRedux.js#L74-L75
        return store => next => action => { 
            const res = next(action);
            $rootScope.$evalAsync();//res);
            console.warn("$DIGEST action:", JSON.stringify(action));
            return res;
        };
    }


    //Provider "store$" implementation get$ -> store$Service = new _Store$ instance
    export class store$Provider {
        private _stores: { [name: string]: Store$<any, any> };
        private _config: StoreOptions<any,any>;
        private _rootRE: undefined | { reducer: Redux.Reducer<any> | Redux.ReducersMapObject,
                                        epics: (string | ReduxObservable.Epic<any,any>)[],
                                        middlewares: (string | Redux.Middleware)[] }
        constructor() {
            this._stores = {};
            this._config = { devtools: false }
            this._rootRE = undefined;
            this.$get.$inject = ["$injector"];
        }

        //Configuration function
        public setDefaultStoreOptions<S=any,A extends Redux.Action=any>(storeOptions: StoreOptions<S,A>) {            
            this._config = angular.extend(this._config, storeOptions);
        }

        public setRootStore$<S=any,A extends Redux.Action=any>( reducer: Redux.Reducer<S> | Redux.ReducersMapObject, epics?: (string | ReduxObservable.Epic<A,S>)[], middlewares?: (string | Redux.Middleware)[] ) {
            this._rootRE = { reducer, epics: epics || [], middlewares: middlewares || [] };
        }

        

        //Provider factory function     
        public $get($injector: ng.auto.IInjectorService): store$Service {
            //Internal helper to get normalized "STORE_NAME" based on storeName | storeOptions.devtools.name | window.document.title | ""
            const _getName = (storeName?: string, storeOptions?: StoreOptions<any,any>): string => {
                if (!storeName) { storeName = (storeOptions && storeOptions.devtools && storeOptions.devtools.name) || window.document.title || "" }
                if (storeOptions && storeOptions.devtools) storeOptions.devtools.name = storeName; //align devtools.name to storeName
                return storeName.toUpperCase().replace(/\s/ig,"_"); //normalized key "STORE_NAME" uppercase and replace spaces with _ 
            }
            //Internal helper to create new "STORE_NAME" with passed reducers/epics orelse get existing one
            const _newStore = <S=any,A extends Redux.Action=any>(name: string, reducers: Redux.Reducer<S> | Redux.ReducersMapObject, epics: (string | ReduxObservable.Epic<A,S>)[], middlewares: (string | Redux.Middleware)[], opts: StoreOptions<S,A>): Store$<S,A> => {
                if (!this._stores[name]) { //IF NOT EXIST CREATE NEW STORE WITH PARAMS
                    console.log("Create new Store '" + name + "' with params:", reducers, epics, middlewares, opts);
                    this._stores[name] = new _Store($injector, name, reducers, epics, middlewares, opts
                    /* CLOSURE onDispose TO REMOVE istance from _stores */, ()=>delete this._stores[name]);
                } else { //ELSE RETURN EXISTING STORE CREATED BEFORE
                    console.log("Return existing Store '" + name + "' instance:", this._stores[name]);
                }
                return this._stores[name];
            }
            //Service istance returned --> $ngStore : store$Service
            return { 
                createStore$: <S=any,A extends Redux.Action=any>(storeName: string, reducers: Redux.Reducer<S> | Redux.ReducersMapObject, epics?: (string | ReduxObservable.Epic<A,S>)[], middlewares?: (string | Redux.Middleware)[], storeOptions?: StoreOptions<S,A>): Store$<S,A> => {
                    //create new Store (with passed params: reducers/epics) orelse get existing one! 
                    const opts = angular.extend({}, this._config, storeOptions)
                    const name = _getName(storeName, opts)
                    return _newStore(name, reducers, epics || [], middlewares || [], opts);
                },
                getStore$: <S=any,A extends Redux.Action=any>(storeName: string): Store$<S,A> => {
                    //get current Store (if exist) orelse throw exception!
                    const name = _getName(storeName);
                    const exist = this._stores[name];
                    if (!exist) throw new Error(name + " STORE NOT EXIST!");
                    return exist as Store$<S,A>;
                },
                getStore: <S=any>(storeName: string): Redux.Store<S> => {
                    //get current Store (if exist) orelse throw exception!
                    const name = _getName(storeName);
                    const exist = this._stores[name];
                    if (!exist) throw new Error(name + " STORE NOT EXIST!");
                    return (exist as Store$<S,any>).store;
                },
                rootStore$: <S=any,A extends Redux.Action=any>(): Store$<S,A> => {
                    //get/create rootStore$ ROOTNAME="" with params (reducer/epics) specified in setRootStore$
                    if (!this._rootRE) throw new Error("MUST SPECIFY ROOT REDUCER/EPICS with setRootStore$");
                    return _newStore("" /*ROOTNAME*/, this._rootRE.reducer, this._rootRE.epics, this._rootRE.middlewares, this._config);
                },
                createSelector$: _createSelector$
            } as store$Service;
        }
    }

    //private class that is the real store$Service implementation
    class _Store<S=any,A extends Redux.Action=any> implements Store$<S,A> {
        public store: Redux.Store<S>;
        constructor(private $injector: ng.auto.IInjectorService, 
                    public name: string, 
                    reducers: Redux.Reducer<S> | Redux.ReducersMapObject, 
                    epics: (string | ReduxObservable.Epic<A,S>)[], 
                    middlewares: (string | Redux.Middleware)[],
                    options: StoreOptions<S,A>,
                    private _onDisposeRemoveMeFromParenst_stores:()=>void
                ) 
        {
            // INITIALIZE MIDDLEWARE
            this._Middlewares = [];
            if (middlewares && middlewares.length) { //DOCS: https://github.com/angular-redux/ng-redux/blob/master/src/components/ngRedux.js#L44-L48
                this._Middlewares = middlewares.map(mid => typeof mid === "string" //RESOLVE Factories WITH $injector
                                                    ? $injector.get(mid) as Redux.Middleware 
                                                    : mid );
            }
            
            if (epics && epics.length) { //DOCS: https://redux-observable.js.org/docs/basics/SettingUpTheMiddleware.html
                this._Epics = epics.map(epic => typeof epic === "string" //RESOLVE Factories WITH $injector
                ? $injector.get(epic) as ReduxObservable.Epic<A,S> 
                : epic );
                this._epicMiddleware = ReduxObservable.createEpicMiddleware( 
                    ReduxObservable.combineEpics<A,S>(...this._Epics) );
                this._Middlewares.unshift(this._epicMiddleware) //ADD EPIC MIDDLEWARE AS FIRST 1st
            }

            this._rootReducer = typeof reducers === "object" 
                                    ? Redux.combineReducers<S>(reducers)
                                    : reducers;
            
            if (options.devtools) {
                //DEVTOOLS REMOTE(https://github.com/zalmoxisus/remote-redux-devtools) OR CHROME (https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd) OR NOTHING
                this._composeEnhancers =
                    ( (window as any).RRDT && RRDT.composeWithDevTools && RRDT.composeWithDevTools( 
                        angular.extend({ realtime: true, hostname: "localhost", port: 8000 }, options.devtools) )
                    ) || ( (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ 
                        && (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__(options.devtools)
                    ) || Redux.compose;
                if (this._Middlewares && this._Middlewares.length) {
                    this.store = Redux.createStore( this._rootReducer , 
                        this._composeEnhancers( Redux.applyMiddleware( ...this._Middlewares ) ));
                } else {
                    this.store = Redux.createStore( this._rootReducer , (this._composeEnhancers() as Redux.GenericStoreEnhancer))
                }
            } else if (this._Middlewares && this._Middlewares.length) {
                this.store = Redux.createStore( this._rootReducer, Redux.applyMiddleware( ...this._Middlewares ) );
            } else {
                this.store = Redux.createStore( this._rootReducer );
            }
        }

        public createSelector$<T>(selector: (state:S)=>T): Rx.Observable<T> {
            return _createSelector$(this.store, selector);
        }

        public dispatchAction<A extends Redux.Action>( action: A ): void {
            this.store.dispatch( action );
        }
        
        public dispose(_DISPOSE_ACTION_TYPE_: string = ACTION_TYPE._DISPOSE_): void {
            //TRY TO FREE ALL REFERENCE TO HELP GC CLEANUP DOCS: https://redux-observable.js.org/docs/recipes/HotModuleReplacement.html
            console.log("Try cleanup Store: '", this.name, "' dispatching:", _DISPOSE_ACTION_TYPE_);
            const _DISPOSE_ : any = undefined;
            if (this._epicMiddleware) { //INTERNALLY DISPACTH EPIC_END = _DISPOSE_ACTION_TYPE_
                this._epicMiddleware.replaceEpic( a$=>Rx.Observable.empty() );
                this._epicMiddleware = _DISPOSE_;
            }
            if (this.store) { //MANUALLY DISPATCH _DISPOSE_ACTION_TYPE_ TO ALLOW reducers CLEANUP
                this.store.dispatch({ type: _DISPOSE_ACTION_TYPE_ });
                this.store.replaceReducer( (s,a)=>_DISPOSE_ );
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
        }
        
        private _Middlewares: Redux.Middleware[];
        private _Epics: ReduxObservable.Epic<A,S>[];
        private _epicMiddleware: ReduxObservable.EpicMiddleware<A,S>;
        private _rootReducer: Redux.Reducer<S>;
        private _composeEnhancers: Function;
    }



    //asyncPipe equivalent to NG2/4+ use with binding = "obs$ | async:this" to auto-unsubscribe!
    //DOCS: https://github.com/cvuorinen/angular1-async-filter
    export function asyncPipe($rootScope: ng.IRootScopeService): ng.Injectable<Function> {
        //CACHE SUBSCRIPTIONS / VALUES TO RETURN SAME IF EXIST!
        type sub = { dispose?: ()=>void, unsubscribe?: ()=>void }
        const _vals: { [objID:number]: any } = {};
        const _subs: { [objID:number]: sub } = {};
        function _isObservableLike<T>(o: Rx.Observable<T>|any): o is Rx.Observable<T> {
            return o && o.subscribe; //SIMPLE TYPEGUAD FOR ObservableLike
        }
        function _isPromiseLike<T>(o: ng.IPromise<T>|any): o is ng.IPromise<T> {
            return o && o.then; //SIMPLE TYPEGUARD FOR PromiseLike
        }
        function async<T=any>(input: Rx.Observable<T>|ng.IPromise<T>|any, scope?: ng.IScope) {
            // Make sure we have an Observable or a Promise
            if (!input || !(_isObservableLike(input) || _isPromiseLike(input))) {
                return input;
            }

            const inputId = objectId(input);
            if (!(inputId in _subs)) {
                const subscriptionStrategy: ( cb:(v:T)=>void ) => sub = 
                (_isObservableLike(input) && input.subscribe.bind(input))
                ||( _isPromiseLike(input) && input.then.bind(input) )
                ||((input as any).success && (input as any).success.bind(input)); // To make it work with HttpPromise

                _subs[inputId] = subscriptionStrategy(value => {
                _vals[inputId] = value;
                    if (scope && scope.$applyAsync) {
                        scope.$applyAsync(); // Automatic safe apply, if scope provided
                    } else $rootScope.$applyAsync(); //safly run $digest in Angular BUT WITHOUT PASSIN :this=scope CAN'T REGISTER CLEARUP-UNSUBSCRIBE!!!
                });

                if (scope && scope.$on) {
                    // Clean up subscription and its last value when the scope is destroyed.
                    scope.$on("$destroy", () => {
                        const sub = _subs[inputId];
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
        };

        // Need a way to tell the input objects apart from each other (so we only subscribe to them once)
        let nextObjectID = 0;
        function objectId(obj: any): number {
            if (!obj.hasOwnProperty('__asyncFilterObjectID__')) {
                obj.__asyncFilterObjectID__ = ++nextObjectID;
            }
            return obj.__asyncFilterObjectID__;
        }

        // So that Angular does not cache the return value
        (async as any).$stateful = true;
        async.$inject = ["$rootScope"];

        return async;
    };

}

angular.module("ngStore", [])
.factory("$digestMiddleware", ngStore.$digestMiddleware)
.provider("store$", ngStore.store$Provider)
.filter("async", ngStore.asyncPipe)
.run(["store$", function(store$: ngStore.store$Service){ 
    console.log("RUN INSIDE ngStore - Now store$ is fully configured!", store$); 
}]);
