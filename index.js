import fs from 'fs';
import swaggerParser from 'swagger-parser';
import mockParser from 'swagger-mock-parser';

if (!global._babelPolyfill) {
    require('babel-polyfill');
}
let dirFileCache = [];

export default function(swaggerFile, mockFile, cb) {
    if (!swaggerFile) {
        throw new Error('missing swagger file path');
    }
    if (!mockFile) {
        throw new Error('missing target mock file generator directory');
    }
    let parser = new mockParser({ useExample: true });
    let parserPromise = new Promise((resolve) => {
        swaggerParser.dereference(swaggerFile, (err, swagger) => {
            if (err) throw err;
            resolve(swagger);
        });
    });
    fs.readdir(mockFile, (err, files) => {
        if (err) {
            return runParser();
        }
        if (files.length) {
            files.forEach((file, index) => {
                if (file.indexOf('.json') > 0) { dirFileCache.push(file); }
                if (index === files.length - 1) {
                    runParser();
                }
            });
        } else {
            runParser();
        }
    })

    function runParser() {
        parserPromise.then((api) => {
            let paths = api.paths;
            try {
                mockAllFile(paths).then((res) => {
                    if (cb) cb();
                }, (error) => {
                    console.log(error);
                });
            } catch (e) {
                console.log(e);
            }
        });
    }

    function mockAllFile(paths) {
        let promises = [];
        for (let path in paths) {
            if (paths.hasOwnProperty(path)) {
                for (let action in paths[path]) {
                    if (paths[path].hasOwnProperty(action)) {
                        if (paths[path][action].responses) {
                            for (let resCode in paths[path][action].responses) {
                                if (paths[path][action].responses.hasOwnProperty(resCode)) {
                                    if (paths[path][action].responses[resCode].schema) {
                                        // if example is defined and not empty,on override just skip it
                                        if (paths[path][action].responses[resCode].schema.example && paths[path][action].responses[resCode].schema.example !== '') {
                                            continue;
                                        } else {
                                            paths[path][action].responses[resCode].schema.example = parser.parse(paths[path][action].responses[resCode].schema)
                                        }
                                        var exampleObj = Object.assign(paths[path][action].responses[resCode].schema.example, { status: 0 })
                                        var example = JSON.stringify(exampleObj, null, 4);
                                        var pathApi = `{"cases": [${example}]}`;
                                    }
                                }
                            }
                        }

                    }
                }
            }
            if (path !== "/") {
                let filePath = path.split('/').join('-').substring(1);
                // if filename end of '/'
                // dont convert it to '-'
                if (filePath.slice(-1) === '-') { filePath.replace(/.$/, '/'); }
                if (!dirFileCache.includes(filePath + '.json')) {
                    // incremental updating mock file
                    filePath = `${mockFile}${filePath}.json`;
                    promises.push(fs.writeFileSync(filePath, pathApi, 'utf-8', (err) => {
                        if (err) throw err;
                    }));
                }
            }
        };
        return Promise.all(promises);
    }
}