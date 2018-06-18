import config from '../config';

export default function initMixin(Sue) {
    Sue.options = {
        filters: {},
        components: {},
    };

    // add filter
    Sue.filter = function (name, fn) {
        Sue.options.filters[name] = fn;

        return Sue;
    };

    // build component
    Sue.extend = function (extendOptions) {
        extendOptions = extendOptions || {};
        let Super = this;
        let Sub = createClass();
        Sub.prototype = Object.create(Super.prototype);
        Sub.prototype.constructor = Sub;

        Sub.options = {extendOptions};
        config._assetTypes.forEach((type) => {
            Sub.options[type] = Super.options[type];
        });

        return Sub;
    };

    // register component
    Sue.component = function (name, definition) {
        Sue.options.components[name] = definition;
        return definition;
    }
}


function createClass () {
    return new Function(
        'return function (options) {this._init(options)}'
    )()
}