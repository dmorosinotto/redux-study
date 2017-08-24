var copyfiles = require("copyfiles");
copyfiles([
    //FILES LIST TO COPY
    "node_modules/angular/angular.min.js",
    "node_modules/angular-route/angular-route.min.js",
    "node_modules/angular1-async-filter/async-filter.js",
    "node_modules/rxjs/bundles/Rx.min.js",
    "node_modules/redux/dist/redux.min.js",
    "node_modules/redux-observable/dist/redux-observable.min.js",
    "node_modules/rxjs-spy/bundles/rxjs-spy.min.umd.js",
    
    //DESTINATION DIRECTORY
    "./dist"
] , true /* FLAT -f OPTIONS */, function(){console.log("LIB COPYED FROM node_modules TO ./dist")});