namespace ngApp.Components {
    class todosAppCtrl {
        static $inject = ["store$"]; 
        constructor(private store$: ngStore.store$Service) {
            console.log("CTOR todosAppCmp - CREATE NEW PRIVATE STORE")
            //STORE
            this.store = store$.createStore$<Stores.Todos.State>("TODO REDUX", {
                todos: Stores.Todos.List.reducer,
                filter: Stores.Todos.Filter.reducer
            })
            //ACTIONS
            this.emit$ = {
                ADD: ()=>{ const text=this.input; this.input=""; 
                            return Stores.Todos.List.actTodoAdd(text) },
                DEL: Stores.Todos.List.actTodoDel,
                CHK: Stores.Todos.List.actTodoToggle,
                ALL: ()=> Stores.Todos.Filter.actFilterSet("ALL"),
                DONE: ()=> Stores.Todos.Filter.actFilterSet("DONE"),
                TODO: ()=> Stores.Todos.Filter.actFilterSet("TODO"),
            }
        }
        $onDestroy(){
            console.log("DESTROY todosAppCmp - DISPOSE STORE AND UNSUB");
            this.store.dispose();
        }
        $onInit(){
            console.log("ONINIT todosAppCmp - NOW CAN READ:", this.input, " FROM $resolve");
            //BIND ACTIONS
            this.emit$ = Redux.bindActionCreators(this.emit$, this.store.store.dispatch);
            //SELECTORS
            this.state$ = this.store.createSelector$(s=>s);
            this.filter$ = this.store.createSelector$(state => state.filter.current );
            this.list$ = this.store.createSelector$(state => state.todos.list )
                            .combineLatest( this.filter$ , 
                                (list, curr) => list.filter(item => 
                                                curr==="ALL" ? true :
                                                curr==="DONE" ? item.done : 
                                                curr==="TODO" ? !item.done : false
                            )   );
        
        }
        
        public input: string;
        public store: ngStore.Store$<Stores.Todos.State,Stores.Todos.Actions>;
        public state$: Rx.Observable<any>;
        public list$: Rx.Observable<Stores.Todos.List.ITodo[]>;
        public filter$: Rx.Observable<Stores.Todos.Filter.IFilter>;
        public emit$: Redux.ActionCreatorsMapObject;
        
        public show() {
            alert(this.input);
            this.input = "";
        }
    }
    
    export var todosAppCmp: angular.IComponentOptions = {
        controller: todosAppCtrl,
        bindings: {
            input: "<"
        },
        template: `
        <div>
            <h1>{{($ctrl.filter$ | async:this )}} LIST</h1>
            Filtre per:
            <button ng-click="$ctrl.emit$.ALL()">ALL</button>
            <button ng-click="$ctrl.emit$.DONE()">DONE</button>
            <button ng-click="$ctrl.emit$.TODO()">TODO</button>
            <hr>
            <form ng-submit="$ctrl.emit$.ADD()">
                <label>Digita todo:</label>
                <input ng-model="$ctrl.input">
                <small>e premi INVIO</small>
            </form>
            <ul ng-repeat="item in ($ctrl.list$ | async:this) track by item.id">
                <li ng-style="{'text-decoration': item.done?'line-through':'none'}"
                    ng-click="$ctrl.emit$.CHK(item.id)">
                    <button ng-click="$ctrl.emit$.DEL(item.id)">X</button>
                    <code>@{{item.id}}</code> - {{item.text}}
                </li>
            </ul>
            <hr>
            <pre>{{ $ctrl.state$ | async:this | json }}</pre>
        </div>`
    }
}