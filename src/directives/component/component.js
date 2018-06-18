import {parseDom, callHook} from '../../util/index'

export default {
    dirBind: function (el, value) {
        this.parentNode = el.parentNode;
        this.refStart = document.createComment('v-component-start');
        this.refEnd = document.createComment('v-component-end');
        this.parentNode.insertBefore(this.refEnd, el);
        this.parentNode.insertBefore(this.refStart, this.refEnd);
        this.parentNode.removeChild(el);

        this.Sub = Sue.options.components[this.tagName];
        this.opts = this.Sub.options.extendOptions;
        this.opts.parsedProps = parseProps(el);
        this.subIns = new this.Sub(this.opts);
        this.vm.$children.push(this.subIns);
        this.subIns.parentScope = this.vm;
        if (!this.opts.template) {
            throw new Error('Component must have template');
        }
        this.templateDom = parseDom(this.opts.template);
        if (this.templateDom.length > 1) {
            throw new Error('Component must have only one root element');
        }

        this.frag = this.compileTemplate(this.subIns, this.templateDom[0]);

        this.parentNode.insertBefore(this.frag, this.refEnd);

        // dom挂在完毕
        callHook(this.subIns, 'mounted');
    },
    dirUpdate: function (el, value) {
        this.el.setAttribute(this.updateAttr, value.toString());
    }
}

function parseProps (node) {
    const propObj = {};
    const matchVBind = /v-bind/;

    let attrs = Array.from(node.attributes) || [];

    attrs.forEach((attr) => {
        let dirParam = attr.name;
        let name = '';
        let dynamic = false;
        if (matchVBind.test(attr.name)) {
            dirParam = attr.name.split(':')[1];
            name = attr.name.split(':')[0];
            dynamic = true;
        }

        propObj[dirParam] = {
            dynamic,
            parentPath: attr.value,
            propName: dirParam
        }
    });

    return propObj;
}