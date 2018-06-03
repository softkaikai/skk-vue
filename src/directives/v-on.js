export default {
    dirBind: function (el, value) {
        this.el.removeAttribute(this.dir);
        this.el.addEventListener(this.dirParam, (e) => {
            this.vm[this.dirValue](e);
        })
    },
    dirUpdate: function (el, value) {

    }
}