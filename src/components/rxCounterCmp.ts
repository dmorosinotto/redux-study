namespace ngApp.Components {
    class rxCounterCtrl {
        public rootStore$: ngStore.Store$<Stores.State, Stores.Actions>;
        public counter$: Rx.Observable<number>;
        public emit$: Redux.ActionCreatorsMapObject;
        
        constructor() {
            // CONSTRUCTOR CREATE emit$ MAP TO EASLY BIND ACTIONS TO TEMPLATE
            console.log("CTOR rxCounterCtrl - Create emit$ ActionCreatorMap");
            this.emit$ = {
                INCR: Stores.Count.actINCR,
                DECR: Stores.Count.actDECR,
                STOP: Stores.Count.actSTOP,
                START: Stores.Count.actSTART,
            }
        }
        $onInit(){
            console.log("INIT rxCounterCtrl - bindActionCreator + createSelector$", this.rootStore$);
            // ONINIT - YOU CAN ACCESS rootStore$ PASSED BY $resolve @Input store
            // AND createSelector$ TO SUBCRBIBE WITH | async:this IN TEMPLATE
            this.counter$ = this.rootStore$.createSelector$(state => state.count.counter);
            // AND bindActionCreators TO store.dispatch IN emit$ TO EASY CALL IN TEMPLATE
            this.emit$ = Redux.bindActionCreators(this.emit$, this.rootStore$.store.dispatch);
            console.log("EMIT$=",this.emit$);
        }

        $onDestroy(){
            console.log("DESTROY rxCounterCtrl - CLEAR emit$ TO AVOID GC PROBLEM");
            this.emit$ = {};
        }
    }
    
    export var rxCounter: angular.IComponentOptions = {
        controller: rxCounterCtrl,
        bindings: {
            rootStore$: "<store"//NOME ATTR ESTERNO store, NOME PROP INTERNA rootStore$ 
        },
        template: `
        <div ng-init="d=2">
            <button ng-click="$ctrl.emit$.INCR()">INCR</button>
            <button ng-click="$ctrl.emit$.DECR()">DECR</button>
            <button ng-click="$ctrl.emit$.STOP()">STOP</button>
            <button ng-click="$ctrl.emit$.START(d)">START</button>
            <input type="number" ng-model="d">
            <code> $ctrl.counter$ | async:this = </code>
            <h3>{{ $ctrl.counter$ | async:this }}</h3>
        </div>`
    }
}