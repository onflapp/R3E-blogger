var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var HTLRendererFactory = (function (_super) {
    __extends(HTLRendererFactory, _super);
    function HTLRendererFactory() {
        var _this = _super.call(this) || this;
        _this.HTL = null;
        if (window && window['Compiler'])
            _this.HTL = window['Compiler'];
        else
            _this.HTL = require('htl-compiler');
        return _this;
    }
    HTLRendererFactory.prototype.compileTemplate = function (template) {
        var HTLCompiler = this.HTL;
        return {
            callback: function (map, cb) {
                var com = new HTLCompiler(template, map);
                com.compile().then(function (txt) {
                    cb(txt);
                }).catch(function (ex) {
                    cb(null, ex);
                });
            }
        };
    };
    return HTLRendererFactory;
}(TemplateRendererFactory));
