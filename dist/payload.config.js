"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var bundler_webpack_1 = require("@payloadcms/bundler-webpack");
var db_mongodb_1 = require("@payloadcms/db-mongodb");
var richtext_slate_1 = require("@payloadcms/richtext-slate");
var dotenv_1 = __importDefault(require("dotenv"));
var path_1 = __importDefault(require("path"));
var config_1 = require("payload/config");
var Media_1 = require("./collections/Media");
var Orders_1 = require("./collections/Orders");
var ProductFile_1 = require("./collections/ProductFile");
var Products_1 = require("./collections/Products/Products");
var Users_1 = require("./collections/Users");
dotenv_1.default.config({
    path: path_1.default.resolve(__dirname, "../.env"),
});
var mockProductHooksPath = path_1.default.resolve(__dirname, "collections/Products/mocks/beforeCreateProduct.js");
var fullProductHooksPath = path_1.default.resolve(__dirname, "collections/Products/hooks/beforeCreateProduct");
exports.default = (0, config_1.buildConfig)({
    serverURL: process.env.NEXT_PUBLIC_SERVER_URL,
    collections: [Users_1.Users, Products_1.Products, Media_1.Media, ProductFile_1.ProductFiles, Orders_1.Orders],
    routes: {
        admin: "/sell",
    },
    admin: {
        user: "users",
        bundler: (0, bundler_webpack_1.webpackBundler)(),
        webpack: function (config) {
            var _a;
            var _b;
            // excluding server code
            return __assign(__assign({}, config), { resolve: __assign(__assign({}, config.resolve), { alias: __assign(__assign({}, (_b = config.resolve) === null || _b === void 0 ? void 0 : _b.alias), (_a = {}, _a[fullProductHooksPath] = mockProductHooksPath, _a)) }) });
        },
        meta: {
            titleSuffix: "- DigitalHippo",
            favicon: "/favicon.ico",
            ogImage: "/thumbnail.jpg",
        },
    },
    rateLimit: {
        max: 2000,
    },
    editor: (0, richtext_slate_1.slateEditor)({}),
    db: (0, db_mongodb_1.mongooseAdapter)({
        url: process.env.MONGODB_URL,
    }),
    typescript: {
        outputFile: path_1.default.resolve(__dirname, "payload-types.ts"),
        declare: false,
    },
});
