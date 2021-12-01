<h1 align="center">Welcome to reg-file-parser 👋</h1>
<p>
  <img alt="Version" src="https://img.shields.io/badge/version-0.0.1-blue.svg?cacheSeconds=2592000" />
  <a href="https://github.com/saiwolf/reg-file-parser#readme" target="_blank">
    <img alt="Documentation" src="https://img.shields.io/badge/documentation-yes-brightgreen.svg" />
  </a>
  <a href="https://github.com/saiwolf/reg-file-parser/graphs/commit-activity" target="_blank">
    <img alt="Maintenance" src="https://img.shields.io/badge/Maintained%3F-yes-green.svg" />
  </a>
  <a href="https://github.com/saiwolf/reg-file-parser/blob/master/LICENSE" target="_blank">
    <img alt="License: MIT" src="https://img.shields.io/github/license/saiwolf/reg-file-parser" />
  </a>
</p>

# What is this?

> A library written in typescript that parses Windows Regisry export files (.reg). 

This project started life as a direct porting of [Henryk Filipowicz's Registry Export File Parser](https://www.codeproject.com/Tips/125573/Registry-Export-File-reg-Parser) which is written in C#; but it has evolved since; though the principals remain the same.

# Add to your project
## npm
```sh
npm install reg-file-parser
```
## yarn

```sh
yarn add reg-file-parser
```
# Quickstart
## Parse a registry file

```js
// CommonJS
const regParser = require('reg-file-parser');
const result = new regParser.RegFileObject('./relative/path/to/file.reg');
// do something with `result`
```

```js
// ESModule
import { RegFileObject} from 'reg-file-parser';

const result = new RegFileObject('./relative/path/to/file.reg');
// do something with `result`
```

> All interfaces are public. You can use them to type your code as needed.

# Docs
Docs are generated with [TypeDoc](https://typedoc.org/)

https://saiwolf.github.io/reg-file-parser/

# Author

👤 **Robert Cato <saiwolf@swmnu.net>**

* Website: https://keybase.io/saiwolf
* Github: [@saiwolf](https://github.com/saiwolf)

# 🤝 Contributing

Contributions, issues and feature requests are welcome!<br />Feel free to check [issues page](https://github.com/saiwolf/reg-file-parser/issues). You can also take a look at the [contributing guide](https://github.com/saiwolf/reg-file-parser/blob/master/CONTRIBUTING.md).

# Show your support

Give a ⭐️ if this project helped you!

# 📝 License

Copyright © 2021 [Robert Cato <saiwolf@swmnu.net>](https://github.com/saiwolf).<br />
This project is [MIT](https://github.com/saiwolf/reg-file-parser/blob/master/LICENSE) licensed.

***
_This README was generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_
