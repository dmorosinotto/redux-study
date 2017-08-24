// <reference path="../../typings/signalr/signalr.d.ts" />
module ngSignalR {
    export declare const enum ConnectionState {
        connecting = 0,
        connected = 1,
        reconnecting = 2,
        disconnected = 4
    };

    export interface ConnectionSettings extends SignalR.ConnectionOptions {
        //complete signalr.d.ts ConnectionSetting { transport?: any; callback?: any; waitForPageLoad?: boolean; jsonp?: boolean; }
        url?: string;
        logging?: boolean;
        useDefaultPath?: boolean;
        autoReconnectTimeout?: number;
    }

    export type CallbackToDeregister = () => void;    
    //export interface HubEventHandler<T> { (data: T, $scope?: ng.IScope, $event?: ng.IAngularEvent): void; }
    
    export interface IHubProxy {
        connection: SignalR.Hub.Connection;
        hubName(): string;
        state(): ConnectionState;        
        ready(): ng.IPromise<IHubServer>;
        startConnection(): void;        
        registerEventEmitter(clientMethod: string, eventPattern: string): CallbackToDeregister;
        registerEntrypoint<T>(clientMethod: string, handler: (data:T)=>void, $scopeToUpdate?: ng.IScope): CallbackToDeregister;
    }

    export interface IHubServer {
        invoke(serverMethod: string, ...args: any[]): void        
    }

    export interface IHubService {
        getHubProxy(hubName: string, startOptions?: ConnectionSettings): IHubProxy;
        $onEvent<T>(eventName: string, handler: (data: T, $event?: ng.IAngularEvent) => void): CallbackToDeregister;
        registerEvent(hubName: string, clientMethod: string, eventNamePattern: string): CallbackToDeregister;
        registerEntrypoint<T>(hubName: string, clientMethod: string, handler: ((data: T) => void), $scopeToUpdate?: ng.IScope): CallbackToDeregister;
    }

    export class signalRProvider {
        private _proxies: { [hubName: string]: _SignalRHubProxy };
        private _config: ConnectionSettings;
        constructor() {
            this._proxies = {};
            this._config = { logging: false, autoReconnectTimeout: 5000 }
            this.$get.$inject = ["$rootScope", "$q", "$log"];
        }

        //Configuration function
        public setDefaultStartOptions(startOptions: ConnectionSettings) {            
            this._config = angular.extend(this._config, startOptions);
        }
        
        //Provider factory function     
        public $get($rootScope: ng.IRootScopeService, $q: ng.IQService, $log: ng.ILogService): IHubService {
            //internal helper to get Proxy singletons based on hubName
            var _getProxy = (hubName: string, startOptions?: ConnectionSettings) => {
                if (!hubName) { $log.error("ERROR @_getProxy - Must specify hubName!"); return {} as any; }
                var hn = hubName.toLowerCase(); //normalize to hubname always lowercase for key in _proxies map!
                if (!this._proxies[hn]) {
                    $log.debug("SignalR create new Proxy for: '" + hubName + "' and Start connection:", startOptions);
                    this._proxies[hn] = new _SignalRHubProxy($rootScope, $q, $log, hubName, angular.extend({}, this._config, startOptions));
                } else {
                    $log.debug("SignalR use existing Proxy for: '" + hubName + "' - connection state:", this._proxies[hn].state());
                }
                return this._proxies[hn];
            }
            //Service istance returned --> $signalR : ISignalRService
            return { 
                getHubProxy(hubName: string, startOptions?: ConnectionSettings): IHubProxy {
                    //get current proxy (if exist) orelse create a new HubProxy and immediatly start connection
                    return _getProxy(hubName, startOptions);
                },
                registerEntrypoint<T>(hubName: string, clientMethod: string, handler: ((data: T) => void), $scopeToUpdate?: ng.IScope): CallbackToDeregister {
                    //register an entrypoint handler for the clientmethod (if proxy doesn't exist immediatly create it and start connection), return a function to cleanup bound (signalr.off)
                    return _getProxy(hubName).registerEntrypoint(clientMethod, handler, $scopeToUpdate || $rootScope);
                },
                registerEvent(hubName: string, clientMethod: string, eventNamePattern: string): CallbackToDeregister {
                    //register an EventEmitter bound to clientmethod (if proxy doesn't exist immediatly create it and start connection), return a function to cleanup bound (signalr.off)
                    return _getProxy(hubName).registerEventEmitter(clientMethod, eventNamePattern);
                },
                $onEvent<T>(eventName: string, handler: (data: T, $event?: ng.IAngularEvent) => void): CallbackToDeregister {
                    //simple helper method to register and handler for $rootScope ngEvent, return the $off deregister function to cleanup event handler later
                    $log.debug("SignalR helper to register $root event: '" + eventName + "' with handler:", handler);
                    return <CallbackToDeregister> $rootScope.$on(eventName, (e: ng.IAngularEvent, d: T) => handler(d, e));
                }
            }
        }
    }


    class _SignalRHubProxy implements IHubProxy {
        private $$proxy: SignalR.Hub.Proxy;        
        private _lazyStart: ng.IDeferred<IHubServer>;
        private _invokeQueue: any[][];
        
        public connection: SignalR.Hub.Connection; 
        constructor(private $rootScope: ng.IRootScopeService, private $q: ng.IQService, private $log: ng.ILogService, hubName: string, startOptions?: ConnectionSettings) {
            this.connection = $.hubConnection(startOptions && startOptions.url , startOptions);
            this.$$proxy = this.connection.createHubProxy(hubName);
            this.$$proxy.on('.', function () { /*REGISTER A FAKE METHOD TO SOLVE connectionData=[] PROBLEM IN START() - see @davidfowl shit http://stackoverflow.com/questions/16018321/signalr-empty-connection-data-on-my-second-hub */ });
            this.connection.disconnected(() => { //AUTOMATIC RECONNECT MECHANISM
                this.$log.warn(this.hubName() + " SignalR disconnected, retry StartConnection in 5 sec...");
                setTimeout(() => this.startConnection(startOptions), (startOptions && startOptions.autoReconnectTimeout) || 5000);                
            });
            this.connection.error((err) => this.$log.error(this.hubName() + " ERROR SIGNALR: ", err));
            this._invokeQueue = [];            
            this.startConnection();
        }

        public ready(): ng.IPromise<IHubServer> {
            return this._lazyStart.promise;            
        }

        public hubName(): string {
            return this.$$proxy.hubName;
        }

        public state(): ConnectionState {
            return <ConnectionState>this.$$proxy.connection.state;
        }

        public startConnection(startOptions?: ConnectionSettings): void {
            this.$log.log(this.hubName() + " SignalR Proxy starting connection...");
            this._lazyStart = this.$q.defer<IHubServer>();
            this.connection.start(startOptions || {}).then(
                (ok) => this.$log.debug(this.hubName() + " SignalR Proxy started", ok),    //this._lazyStart.resolve(this);
                (ko) => this.$log.error(this.hubName() + " ERROR @startConnection - ", ko)) //this._lazyStart.reject(ko);
                .done(() => {
                    this.$log.debug(this.hubName() + " SignalR Proxy ready!");
                    this._lazyStart.resolve(this);
                    this._invokePending();
                });
        }

        public registerEventEmitter(clientMethod: string, eventNamePattern?: string): CallbackToDeregister {            
            if (!eventNamePattern) eventNamePattern = this.hubName() + "@" + clientMethod;
            this.$log.debug(this.hubName() + " SignalR register EventEmitter to map '" + clientMethod + "' to $root event: " + eventNamePattern);
            return this.registerEntrypoint<any>(clientMethod, (payload: any) => {
                var evt = eventNamePattern !.replace(/:[^\/\\\s:]+/gi,                            //extract :xxx from eventNamePattern
                    (key) => this.$rootScope.$eval("p." + key.substr(1), { p: payload || {} })) //and replace with payload.xxx value
                this.$log.debug(this.hubName() + " SignalR emit event: '" + evt + "' with payload:", payload);
                this.$rootScope.$emit(evt, payload); //and then emit ngEvent on rootscope passing payload - at the end return off function to deregister eventEmiter 
            }); 
        }

        public registerEntrypoint<T>(clientMethod: string, handler: (data:T)=>void, $scopeToUpdate?: ng.IScope): CallbackToDeregister {
            if (!clientMethod || !handler) { this.$log.error("ERROR @registerEntryPoint - Must specify valid clientMethod and handler!"); return ()=>{};}
            if (!$scopeToUpdate) $scopeToUpdate = this.$rootScope;
            this.$log.debug(this.hubName() + " SignalR register Entrypoint for '" + clientMethod + "' with handler:", handler);
            var on = (...payload: any[]) => $scopeToUpdate !.$evalAsync(() => handler(payload as any as T)); //calling handler with $scope.$evalAync for NOT having problem with $digest already running see: http://stackoverflow.com/questions/12729122/prevent-error-digest-already-in-progress-when-calling-scope-apply
            this.$$proxy.on(clientMethod, on); 
            var off: CallbackToDeregister = () => {
                this.$log.debug(this.hubName() + " SignalR cleanup handler for: " + clientMethod);
                this.$$proxy.off(clientMethod, on);
            }
            return off;
        }

        public invoke(serverMethod: string, ...args: any[]): void {
            this.$log.debug(this.hubName(), " SignalR queue invoke to: '" + serverMethod + "' with args:", args);
            args.unshift(serverMethod); //put serverMethod as first args for later call invoke.apply (see _InvokePending() last line)
            this._invokeQueue.push(args); //push in invocation list, to safe handly request while connection not ready
            if (this.state() === ConnectionState.connected) {
                this._invokePending(); //immediatly invoke if connection is ready
            }
        }

        private _invokePending(): void {
            if (!this._invokeQueue) return; //process all invoke queue (if any)
            var args: any[]; //this will containt serverMethod as first argument (see invoke() first line)
            while (args = this._invokeQueue.shift()!) { //deque all request to call server and execute one by one
                this.$log.debug(this.hubName(), " SignalR dequeue and Call serverMethod: ", args);
                this.$$proxy.invoke.apply(this.$$proxy, args); //the trick is that args first argument is serverMethod name!
            }
        }
    }
}

angular.module("ngSignalR", []).provider("$signalR", ngSignalR.signalRProvider);
