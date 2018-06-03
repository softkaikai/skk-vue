export default {
    dirBind: function (el, value) {
        this.updateAttr = 'innerHTML';
        this.el.removeAttribute(this.dir);
        this.dirUpdate(el, this.vm[value]);
    },
    dirUpdate: function (el, value) {
        el[this.updateAttr] = value.toString();
    }
}