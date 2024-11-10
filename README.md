# node-cgi

[![license][license-img]][github] [![github][github-img]][github] [![npm][npm-img]][npm]  

Node as CGI-module. Proof of concept, don't use in production.


## Getting started

Install `node-cgi` locally or globally with npm. To use it with an Apache httpd web server create a link to `bin/node-cgi` inside your `cgi-bin` directory and add the following lines to your httpd config or `.htaccess` file:
```
Action       'node-script'  '/cgi-bin/node-cgi'
AddHandler   'node-script'  '.nd'
```

assuming that `/cgi-bin/` is the path to your CGI directory. This will run all files `*.nd` through the Node.js CGI module.

An example file `hello.nd` could look like:
```js
<?js
    header('Content-Type', 'text/plain');
    write('Hello!');
?>
```

Another example file `hello.html.nd` is a HTML file and could look like:
```js
<?js
    header('test', true);
    const fac = n => n < 2 ? 1 : n * fac(n - 1);
?>

<!DOCTYPE html>
<html>
    <body>
        <h1>hello</h1>
        <h2><?js write(fac(5)) ?></h2>
        <h2><? write(fac(7)) ?></h2>
        <h2><?= fac(10) ?></h2>
    </body>
</html>
```

## Globals

The following globals are defined inside the context of a file:
```js
// environment object, access to the CGI variables
env: object

// set a HTTP header field, "Content-Type" is preset to "text/html"
header(key: String, value: String): undefined

// write s to the HTTP content
write(s: String): undefined

// requires a module, arg might be an module name, an absolute or relative path
require(arg: String): any

// self-reference to the global space
global: object
```

## Mappings

After the initial evaluation of the page content additional renderers are used based on the file extension: `*.pug.nd`, `*.md.nd`.

Inject your JavaScript code into files.
```js
<?js /* ... some JavaScript code here ... */ ?>

<?js
    /* ... multiline code is fine too ... */
?>

<?= i ?>        // same as <?js write(i); ?>
<?= 'hello' ?>  // same as <?js write('hello'); ?>
```


## License
The MIT License (MIT)

Copyright (c) 2024 Lars Jung (https://larsjung.de)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.


[github]: https://github.com/lrsjng/node-cgi
[npm]: https://www.npmjs.org/package/node-cgi

[license-img]: https://img.shields.io/badge/license-MIT-a0a060.svg?style=flat-square
[github-img]: https://img.shields.io/badge/github-lrsjng/node--cgi-a0a060.svg?style=flat-square
[npm-img]: https://img.shields.io/badge/npm-node--cgi-a0a060.svg?style=flat-square
