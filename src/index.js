import {initState} from "./initState";
import compile, {compileTemplate} from "./compile";
import Watcher from './watcher';
import initMixin from './mixin/initMixin';
import eventMixin from './mixin/eventMixin'

function Sue (options) {

    this._init(options);
    this._compile();
}
initMixin(Sue);
Sue.prototype._init = function(options) {
    this._descriptors = [];
    this._dirs = [];
    this.$children = [];
    eventMixin(this);
    initState(this, options);
}
Sue.prototype._compile = function() {
    compile(this);
}
Sue.prototype._compileTemplate = function(el) {
    compileTemplate(this, el);
}
Sue.prototype.$watch = function(key, cb, options) {
    const watcher = new Watcher(this, key, cb, options);
}


export default Sue;
