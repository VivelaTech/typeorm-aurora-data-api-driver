"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostgresQueryTransformer = exports.MysqlQueryTransformer = exports.pg = void 0;
var tslib_1 = require("tslib");
// @ts-ignore
var data_api_client_1 = require("./data-api-client");
var query_transformer_1 = require("./query-transformer");
Object.defineProperty(exports, "MysqlQueryTransformer", { enumerable: true, get: function () { return query_transformer_1.MysqlQueryTransformer; } });
Object.defineProperty(exports, "PostgresQueryTransformer", { enumerable: true, get: function () { return query_transformer_1.PostgresQueryTransformer; } });
var DataApiDriver = /** @class */ (function () {
    function DataApiDriver(region, secretArn, resourceArn, database, loggerFn, queryTransformer, serviceConfigOptions, formatOptions) {
        if (loggerFn === void 0) { loggerFn = function () { return undefined; }; }
        this.region = region;
        this.secretArn = secretArn;
        this.resourceArn = resourceArn;
        this.database = database;
        this.loggerFn = loggerFn;
        this.queryTransformer = queryTransformer;
        this.serviceConfigOptions = serviceConfigOptions;
        this.formatOptions = formatOptions;
        this.region = region;
        this.secretArn = secretArn;
        this.resourceArn = resourceArn;
        this.database = database;
        this.loggerFn = loggerFn;
        this.serviceConfigOptions = serviceConfigOptions || {};
        this.serviceConfigOptions.region = region;
        this.client = data_api_client_1.default({
            secretArn: secretArn,
            resourceArn: resourceArn,
            database: database,
            options: this.serviceConfigOptions,
            formatOptions: formatOptions,
        });
        this.queryTransformer = queryTransformer;
    }
    DataApiDriver.prototype.query = function (query, parameters) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var transformedQueryData, result;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        transformedQueryData = this.queryTransformer.transformQueryAndParameters(query, parameters);
                        this.loggerFn(transformedQueryData.queryString, transformedQueryData.parameters);
                        return [4 /*yield*/, this.client.query({
                                sql: transformedQueryData.queryString,
                                parameters: transformedQueryData.parameters,
                                transactionId: this.transactionId,
                            })
                            // TODO: Remove this hack when all Postgres calls in TypeORM use structured result
                        ];
                    case 1:
                        result = _a.sent();
                        // TODO: Remove this hack when all Postgres calls in TypeORM use structured result
                        if (result.records) {
                            result = result.records;
                            result.records = result;
                        }
                        return [2 /*return*/, result];
                }
            });
        });
    };
    DataApiDriver.prototype.preparePersistentValue = function (value, columnMetadata) {
        return this.queryTransformer.preparePersistentValue(value, columnMetadata);
    };
    DataApiDriver.prototype.prepareHydratedValue = function (value, columnMetadata) {
        return this.queryTransformer.prepareHydratedValue(value, columnMetadata);
    };
    DataApiDriver.prototype.startTransaction = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var transactionId;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.client.beginTransaction()];
                    case 1:
                        transactionId = (_a.sent()).transactionId;
                        this.transactionId = transactionId;
                        return [2 /*return*/];
                }
            });
        });
    };
    DataApiDriver.prototype.commitTransaction = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.client.commitTransaction({ transactionId: this.transactionId })];
                    case 1:
                        _a.sent();
                        this.transactionId = undefined;
                        return [2 /*return*/];
                }
            });
        });
    };
    DataApiDriver.prototype.rollbackTransaction = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.client.rollbackTransaction({ transactionId: this.transactionId })];
                    case 1:
                        _a.sent();
                        this.transactionId = undefined;
                        return [2 /*return*/];
                }
            });
        });
    };
    return DataApiDriver;
}());
var createMysqlDriver = function (region, secretArn, resourceArn, database, loggerFn, serviceConfigOptions, formatOptions) {
    if (loggerFn === void 0) { loggerFn = function () { return undefined; }; }
    return new DataApiDriver(region, secretArn, resourceArn, database, loggerFn, new query_transformer_1.MysqlQueryTransformer({ enableUuidHack: formatOptions === null || formatOptions === void 0 ? void 0 : formatOptions.enableUuidHack }), serviceConfigOptions, formatOptions);
};
exports.default = createMysqlDriver;
var createPostgresDriver = function (region, secretArn, resourceArn, database, loggerFn, serviceConfigOptions, formatOptions) {
    if (loggerFn === void 0) { loggerFn = function () { return undefined; }; }
    return new DataApiDriver(region, secretArn, resourceArn, database, loggerFn, new query_transformer_1.PostgresQueryTransformer({ enableUuidHack: formatOptions === null || formatOptions === void 0 ? void 0 : formatOptions.enableUuidHack }), serviceConfigOptions, formatOptions);
};
exports.pg = createPostgresDriver;
//# sourceMappingURL=typeorm-aurora-data-api-driver.js.map