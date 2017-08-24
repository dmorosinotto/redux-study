namespace ngApp.Components {
    class lookupAppCtrl {
        static $inject = ["store$"]; 
        constructor(private store$: ngStore.store$Service) {
            console.log("CTOR lookupAppCmp - CREATE NEW PRIVATE STORE")
            if (confirm("Vuoi fare DEBUG con RXJS-SPY?")) {
                RxSpy.spy(); 
                RxSpy.show();
                
            }
            //STORE
            this.store = store$.createStore$<Stores.Lookup.State>("LOOKUP REDUX", {
                table: Stores.Lookup.Table.reducer,
                filter: Stores.Lookup.Filter.reducer
            })
            //ACTIONS
            this.emit$ = {
                ADD: ()=>{ const value=this.value; this.value=""; 
                            return Stores.Lookup.Table.doAdd({value, done:false}) },
                DEL: Stores.Lookup.Table.doDel,
                UPD: (id:number, done: boolean) => Stores.Lookup.Table.doUpd(id,{done}),
                ALL: ()=> Stores.Lookup.Filter.doSetFilter("ALL"),
                DONE: ()=> Stores.Lookup.Filter.doSetFilter("DONE"),
                DATA: ()=> Stores.Lookup.Filter.doSetFilter("DATA"),
            }
        }
        $onDestroy(){
            console.log("DESTROY todosAppCmp - DISPOSE STORE AND UNSUB");
            this.store.dispose();
        }
        $onInit(){
            console.log("ONINIT todosAppCmp - NOW CAN READ:", this.currRoute, " FROM $resolve");
            //BIND ACTIONS
            this.emit$ = Redux.bindActionCreators(this.emit$, this.store.store.dispatch);
            //SELECTORS
            this.state$ = this.store.createSelector$(s=>s).tag("spy_state$");
            this.filter$ = this.store.createSelector$(state => state.filter.current ).tag("spy_filter$");
            this.list$ = this.store.createSelector$( Stores.Lookup.getAllData ).tag("list$all")
                            .combineLatest( this.filter$ , 
                                (list, curr) => list.filter(item => 
                                                curr==="ALL" ? true :
                                                curr==="DONE" ? item.done : 
                                                curr==="DATA" ? !item.done : false
                            )   ).tag("list$filtered");
        
            //RUN INSIDE CONSOLE TO START DEBUG RXJS
            RxSpy.log("list$filtered");
            RxSpy.log("list$all");
        }
        
        public currRoute: string; //angular.route.ICurrentRoute;
        public value: string;
        public store: ngStore.Store$<Stores.Lookup.State,Stores.Lookup.Actions>;
        public state$: Rx.Observable<any>;
        public list$: Rx.Observable<Stores.Lookup.Table.Data.State[]>;
        public filter$: Rx.Observable<Stores.Lookup.Filter.IFilter>;
        public emit$: Redux.ActionCreatorsMapObject;
    }
    
    export var lookupAppCmp: angular.IComponentOptions = {
        controller: lookupAppCtrl,
        bindings: {
            currRoute: "<"
        },
        template: `
        <div>
            <h1>LOOKUP {{($ctrl.filter$ | async:this )}} TABLE</h1>
            Filter:
            <button ng-click="$ctrl.emit$.ALL()">ALL</button>
            <button ng-click="$ctrl.emit$.DONE()">DONE</button>
            <button ng-click="$ctrl.emit$.DATA()">DATA</button>
            <hr>
            <form ng-submit="$ctrl.emit$.ADD()">
                <label>Digita value:</label>
                <input ng-model="$ctrl.value">
                <small>e premi INVIO</small>
            </form>
            <ul ng-repeat="item in ($ctrl.list$ | async:this) track by item.id">
                <li ng-style="{'text-decoration': item.done?'line-through':'none'}"
                    ng-click="$ctrl.emit$.UPD(item.id, !item.done)">
                    <button ng-click="$ctrl.emit$.DEL(item.id)">X</button>
                    <code>@{{item.id}}</code> - {{item.value}}
                </li>
            </ul>
            <hr>
            <pre>{{ $ctrl.state$ | async:this | json }}</pre>
            <hr>
            <code>currRoute={{ $ctrl.currRoute }}</code>
        </div>`
    }
}