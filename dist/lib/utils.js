"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatPrice = void 0;
exports.cn = cn;
var clsx_1 = require("clsx");
var tailwind_merge_1 = require("tailwind-merge");
function cn() {
    var inputs = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        inputs[_i] = arguments[_i];
    }
    return (0, tailwind_merge_1.twMerge)((0, clsx_1.clsx)(inputs));
}
var formatPrice = function (price, options) {
    if (options === void 0) { options = {}; }
    var _a = options.currency, currency = _a === void 0 ? "USD" : _a, _b = options.notation, notation = _b === void 0 ? "compact" : _b;
    var numericPrice = typeof price === "string" ? parseFloat(price) : price;
    return new Intl.NumberFormat("en-us", {
        style: "currency",
        currency: currency,
        notation: notation,
        maximumFractionDigits: 2,
    }).format(numericPrice);
};
exports.formatPrice = formatPrice;
