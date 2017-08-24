namespace ngApp.Components {
    class SimpleCtrl {
        public data: any;

        static $inject = ["debugSvc"]; 
        constructor(public dbg: Services.debugSvc) {
            // CONSTRUCTOR DATA NOT READY!!!
            this.dbg.warn("CTOR data=", this.data);
        }

        public $onInit() {
            // ONINIT EVENT HANDLER -> DATA OK
            this.dbg.info("$onInit data=", this.data);
        }

        public $onDestroy() {
            // REMEMBER TO DISPOSE EVENT HANDLER REGISTERED!!
            this.data = null; //IGNORE NO MORE EFFECT OUTSIDE
            console.log("$onDestrory data=", this.data);
        }

        public log(s: angular.IScope) {
            this.dbg.warn("THIS scope=",s);
            setTimeout(()=>{
                console.log("DATA BEFORE=", this.data);
                this.data = "call $applyAsync";
                s.$applyAsync(); //SE USO $digest non propaga modifica al padre!
            },1000);
        }

        public get isObject(): boolean {
            return typeof this.data === 'object';
        }
    }
    
    export var ngSimpleCmp: angular.IComponentOptions = {
        bindings: {
            data: '<'
        },
        controller: SimpleCtrl,
        template: `You pass me: <input type="text" ng-model="$ctrl.data">
                    <button ng-click="$ctrl.log(this)">LOG</button>
                    <code ng-if="$ctrl.isObject">|async={{$ctrl.data|async}}
                    <small>senza :this sfrutta <b>$rootScope</b>.$applyAsync()</small></code>`
    }
}