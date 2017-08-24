// POLYFILL ANGULAR GLOBAL OBJECT TO ADD AN HELPER METHOD TO REGISTER A COMPLETE MODULE FROM A TYPESCRIPT NAMESPACE OBJECT
(angular as any).createModuleAndRegister = function createModuleAndRegister(nsApp: {
    Components?: { [comp: string]: angular.IComponentOptions };
    Directives?: any;
    Controllers?: any;
    Services?: any;
    Factories?: { [name: string]: angular.Injectable<Function> }
    Filters?: any;
    Configs?: { [name: string]: Function };
    Constants?: { [name: string]: any };
}, modName: string, modDeps: string[] = []) : angular.IModule {
    var mod = angular.module(modName, modDeps); //create new module instace with specific name and dependencies
    if (nsApp.Components) angular.forEach(nsApp.Components, (options, name) => mod.component(name, options));
    if (nsApp.Directives) mod.directive(nsApp.Directives); //use object syntax to register all Directive "name": function->DDO
    if (nsApp.Controllers) mod.controller(nsApp.Controllers); //use object syntax to register all Controller "name": class+$inject[] 
    if (nsApp.Services) mod.service(nsApp.Services); //use object syntax to register all Service "name": class (expose this.methods)
    if (nsApp.Filters) mod.filter(nsApp.Filters); //use object syntax to register all Filter "name": class constructor as function 
    if (nsApp.Factories) angular.forEach(ngApp.Factories, (value, name) => mod.factory(name, value));
    if (nsApp.Constants) angular.forEach(nsApp.Constants, (value, name) => mod.constant(name, value)); 
    if (nsApp.Configs) angular.forEach(nsApp.Configs, (fn, name) => mod.config(fn));
    return mod; //return angular module instance, you can chain .constant to setup globals, or .config to configure ng-route provider 
}