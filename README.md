## joi-errors-for-forms
In order to keep a consistent validation API in your app,
convert [Joi](https://github.com/hapijs/joi) errors to the { name1: text, name2: text }
format commonly used with forms.

[![Build Status](https://travis-ci.org/eddyystop/joi-errors-for-forms.svg?branch=master)](https://travis-ci.org/eddyystop/joi-errors-for-forms)

## Code Example

(1) Convert the Joi error messages, retaining the original message text.

```javascript
const Joi = require("joi");
const joiErrorToForms = require("joi-errors-to-forms");

const name = Joi.string().trim().max(1).regex(/^[\sa-zA-Z0-9]{5,30}$/).required();
const password = Joi.string().trim().min(2).max(30).required();
const schema = Joi.object().keys({
  name,
  password,
  confirmPassword: password.label('Confirm password'),
});
const convertErrs = joiErrorToForms();

Joi.validate(values, schema, options, (joiErr, convertedValues) => {
  var formErrs = convertErrs(joiErr);
  // { name: '"name" with value "j" fails to match the required pattern: /^[\\sa-zA-Z0-9]{5,30}$/',
  //   password: '"password" length must be at least 2 characters long',
  //   confirmPassword: '"Confirm password" length must be at least 2 characters long'
  // }
  ...
});

```


(2) Replace Joi error message text, using Joi error types. (Recommended.)

```javascript
function i18n(str) { return str; } // internationalization

const convertErrs = joiErrorToForms({
  'string.min': function(c) {
    return i18n('"${key}" must be ${limit} or more chars.');
  },
  'string.regex.base': function(c) {
    switch (c.pattern.toString()) {
      case /^[\sa-zA-Z0-9]{5,30}$/.toString():
        return i18n('"${key}" must consist of letters, digits or spaces.');
    }
  }
});

Joi.validate(values, schema, options, (joiErr, convertedValues) => {
  var formErrs = convertErrs(joiErr);
  // { name: '"name" must consist of letters, digits or spaces.',
  //   password: '"password" must be 2 or more chars.',
  //   confirmPassword: '"Confirm password" must be 2 or more chars.'
  // }
  ...
});

```

List of substitution tokens (partial):
- `${key}` prop name, or label if `.label('...')` was used.
- `${value}` prop value. Its rudimentally converted to a string.
- `${pattern}` regex value if `.regex(...)` was used. Its converted to a string.
- `${limit}` allowed length if string.
- `${encoding}` string encoding. Could be `undefined`. Its converted to a string.
Refer to Joi doc for more information.


(3) Replace Joi error message text, using one generic error message.

```javascript
const convertErrs = joiErrorToForms('"${key}" is badly formed');

Joi.validate(values, schema, options, (joiErr, convertedValues) => {
  var formErrs = convertErrs(joiErr);
  // { name: '"name" is badly formed.',
  //   password: '"password" is badly formed.',
  //   confirmPassword: '"Confirm password" is badly formed.'
  // }
  ...
});

```


(4) Replace Joi error message text, using string and regex searches to convert specific messages.

```javascript
const convertErrs = joiErrorToForms([
  { regex: 'length must be at least 2 characters long',
    message: '"${key}" must be 2 or more chars.'
  },
  { regex: /required pattern/,
    message: '"${key}" is badly formed.'
  }
]);

Joi.validate(values, schema, options, (joiErr, convertedValues) => {
  var formErrs = convertErrs(joiErr);
  // { name: '"name" is badly formed.',
  //   password: '"password" must be 2 or more chars.',
  //   confirmPassword: '"Confirm password" must be 2 or more chars.'
  // }
  ...
});

```

## Motivation

[Joi](https://github.com/hapijs/joi) is an enterprise strength schema validator and sanitizer
developed by Walmart.
Its error reporting however usually has to be reformatted for use with web/mobile forms.

This package converts Joi errors to the commonly used { name1: text, name2: text } format
used by web/mobile form UI packages.

It also allows you to replace selected messages based on string or regex comparisions.
After all `"name" with value "j" fails to match the required pattern: /^[\\sa-zA-Z0-9]{5,30}$/'`
is not terribly friendly.

## Installation

Install [Nodejs](https://nodejs.org/en/).

Run `npm install feathers-hooks-validate-joi --save` in your project folder.

You can then require the utilities.

```javascript
// ES5
var  joiErrorToForms = require('joi-errors-to-forms');
// or ES6
import joiErrorToForms from 'joi-errors-to-forms';
```

## API Reference

To do.

## Tests

`npm test` to run tests.

## Contributors

- [eddyystop](https://github.com/eddyystop)

## License

MIT. See LICENSE.