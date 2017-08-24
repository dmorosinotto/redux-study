namespace ngApp.Components {
    class rxPingCtrl {
        static $inject = ["store$"]; 
        constructor(private store$: ngStore.store$Service) {
            console.log("CTOR rxPingCtrl - SUBSCRIBE TO DATA")
            this.isPinging$ = store$.rootStore$<Stores.State>().createSelector$(state => state.ping.isPinging)
        }
        public isPinging$: Rx.Observable<boolean>;

        public ping() {
            this.store$.rootStore$().dispatchAction( Stores.Ping.actPING() )
        }
        $onDestroy(){
            console.log("DESTROY rxPingCmp - AUTO unsubscribe");
        }
    }
    
    export var rxPingCmp: angular.IComponentOptions = {
        controller: rxPingCtrl,
        template: `
        <div>
            <button ng-click="$ctrl.ping()">Start rxPING</button>
            <code>isPinging|async:this=</code>
            <h3> {{($ctrl.isPinging$|async:this) }} <small>inside rx-ping-cmp!</small></h3>
        </div>`
    }
}