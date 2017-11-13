'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (swaggerFiles, mockFile, cb) {
    if (!swaggerFiles) {
        throw new Error('missing swagger files path');
    }
    if (!mockFile) {
        throw new Error('missing target mock file generator directory');
    }

    var files = [];
    if (Array.isArray(swaggerFiles)) {
        files = swaggerFiles;
    } else {
        files = [swaggerFiles];
    }

    function parserPromiseFunc(swaggerFile) {
        return new Promise(function (resolve) {
            _swaggerJsbladeSwaggerParser2.default.dereference(swaggerFile, function (err, swagger) {
                if (err) throw err;
                resolve(swagger);
            });
        });
    }

    _fs2.default.readdir(mockFile, function (err, files) {
        if (err) {
            return runParser();
        }
        if (files.length) {
            files.forEach(function (file, index) {
                if (file.indexOf('.json') > 0) {
                    dirFileCache.push(file);
                }
                if (index === files.length - 1) {
                    runParser();
                }
            });
        } else {
            runParser();
        }
    });

    function runParser() {
        if (files) {
            files.forEach(function (filePath, index) {
                parserPromiseFunc(filePath).then(function (api) {
                    var paths = api.paths;
                    try {
                        mockAllFile(paths).then(function (res) {
                            if (cb && index === files.length - 1) cb();
                        }, function (error) {
                            console.log(error);
                        });
                    } catch (e) {
                        console.log(e);
                    }
                });
            });
        }
    }

    function mockAllFile(paths) {
        var promises = [];
        for (var path in paths) {
            if (paths.hasOwnProperty(path)) {
                for (var action in paths[path]) {
                    if (paths[path].hasOwnProperty(action)) {
                        if (paths[path][action].responses) {
                            for (var resCode in paths[path][action].responses) {
                                if (paths[path][action].responses.hasOwnProperty(resCode)) {
                                    if (paths[path][action].responses[resCode].schema) {
                                        // use existing example or create new one with object key as its value
                                        var exampleObj = Object.assign(paths[path][action].responses[resCode].schema.example || new _swaggerMockParser2.default({ useExample: true, fixedArray: true, useObjectKey: true }).parse(paths[path][action].responses[resCode].schema), { status: 0 });
                                        var example = JSON.stringify(exampleObj, null, 4);
                                        var pathApi = '{"cases": [' + example + ']}';
                                    }
                                }
                            }
                        }
                    }
                }
            }
            if (path !== "/") {
                var filePath = path.split('/').join('-').substring(1);
                // if filename end of '/'
                // dont convert it to '-'
                if (filePath.slice(-1) === '-') {
                    filePath.replace(/.$/, '/');
                }
                if (!dirFileCache.includes(filePath + '.json')) {
                    // incremental updating mock file
                    filePath = '' + mockFile + filePath + '.json';
                    promises.push(_fs2.default.writeFileSync(filePath, pathApi, 'utf-8', function (err) {
                        if (err) throw err;
                    }));
                }
            }
        };
        return Promise.all(promises);
    }
};

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _swaggerJsbladeSwaggerParser = require('swagger-jsblade-swagger-parser');

var _swaggerJsbladeSwaggerParser2 = _interopRequireDefault(_swaggerJsbladeSwaggerParser);

var _swaggerMockParser = require('swagger-mock-parser');

var _swaggerMockParser2 = _interopRequireDefault(_swaggerMockParser);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

if (!global._babelPolyfill) {
    require('babel-polyfill');
}
var dirFileCache = [];

module.exports = exports['default'];
