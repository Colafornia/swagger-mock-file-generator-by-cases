'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (swaggerFile, mockFile, cb) {
    if (!swaggerFile) {
        throw new Error('missing swagger file path');
    }
    var parser = new _swaggerMockParser2.default({ useExample: true });
    var parserPromise = new Promise(function (resolve) {
        _swaggerParser2.default.dereference(swaggerFile, function (err, swagger) {
            if (err) throw err;
            resolve(swagger);
        });
    });
    parserPromise.then(function (api) {
        var paths = api.paths;
        try {
            mockAllFile(paths).then(function (res) {
                console.log('success'.green);
                if (cb) cb();
            }, function (error) {
                console.log(error);
            });
        } catch (e) {
            console.log(e);
        }
    });

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
                                        // if example is defined and not empty,on override just skip it
                                        if (paths[path][action].responses[resCode].schema.example && paths[path][action].responses[resCode].schema.example !== '') {
                                            continue;
                                        } else {
                                            paths[path][action].responses[resCode].schema.example = parser.parse(paths[path][action].responses[resCode].schema);
                                        }
                                        var exampleObj = Object.assign(paths[path][action].responses[resCode].schema.example, { status: 0 });
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
                // if (filePath.slice(-1) === '-') filePath.slice(0, -1);
                filePath = './mock/' + filePath + '.json';
                promises.push(_fs2.default.writeFileSync(filePath, pathApi, 'utf-8', function (err) {
                    if (err) throw err;
                }));
            }
        };
        return Promise.all(promises);
    }
};

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _swaggerParser = require('swagger-parser');

var _swaggerParser2 = _interopRequireDefault(_swaggerParser);

var _swaggerMockParser = require('swagger-mock-parser');

var _swaggerMockParser2 = _interopRequireDefault(_swaggerMockParser);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

if (!global._babelPolyfill) {
    require('babel-polyfill');
}
