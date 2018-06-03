import {initState} from "./initState";
import compile from "./compile";
import Watcher from './watcher'

function Sue (options) {
    this._descriptors = [];
    this._dirs = [];
    this._init(options);
    this._compile();
}
Sue.prototype._init = function(options) {

    initState(this, options);
}
Sue.prototype._compile = function() {
    compile(this);
}
Sue.prototype.$watch = function(key, cb, options) {
    const watcher = new Watcher(this, key, cb, options);
}


export default Sue;
