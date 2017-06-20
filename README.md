## Badges
[![version](https://img.shields.io/npm/v/swagger-mock-file-generator-by-cases.svg)](https://www.npmjs.com/package/swagger-mock-file-generator-by-cases)
[![NPM downloads](https://img.shields.io/npm/dm/swagger-mock-file-generator-by-cases.svg)](https://npmjs.com/package/swagger-mock-file-generator-by-cases) [![Build Status](https://api.travis-ci.org/MechanicianW/swagger-mock-file-generator-by-cases.svg)](https://travis-ci.org/MechanicianW/swagger-mock-file-generator-by-cases)

## Install

```jacascript
npm i swagger-mock-file-generator-by-cases -s
```

## API

```jacascript
require('swagger-mock-file-generator-by-cases')(<swaggerFile>, <mockFilePath>[, callback])
```

## Output

The mock file name is converted api path through the '/' symbol.

If api path is 'api/v1/accompany/list', mock file name will be 'api-v1-accompany-list.json'.

Data in cases array will give priority to use example in difinitions, you can customize more data in json file.

```javascript
{
    "cases": [
        {
            "data": {},
            "message": "success",
            "status": 0
        }
    ]
}
```
Notice: mockFilePath must be an **absolute path string**(eg './mock/').

This generator is based on [swagger-mock-file-generator](https://github.com/whq731/swagger-mock-file-generator/),thanks for supporting!
