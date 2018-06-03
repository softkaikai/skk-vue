export default {
    dirBind: function (el, value) {
        this.updateAttr = this.dirParam;
        this.el.removeAttribute(this.dir);
        this.el.setAttribute(this.dirParam, this.vm[this.dirValue]);
        this.dirUpdate(el, this.vm[this.dirValue]);
    },
    dirUpdate: function (el, value) {
        this.el.setAttribute(this.updateAttr, value.toString());
    }
}