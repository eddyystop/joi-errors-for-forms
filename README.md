## joi-errors-for-forms

In order to keep a consistent validation API in your app,
convert the error objects returned by [Joi](https://github.com/hapijs/joi) to either

- the `{ name1: text, name2: text }` schema commonly used with form UIs, or
- the Mongoose schema
`{ name1: { message: ..., name: 'ValidatorError', path: path, type: detail.type} }`.

The Joi error messages may also be replaced either for clarity or internationalization.

The package has no dependencies.

[![Build Status](https://travis-ci.org/eddyystop/joi-errors-for-forms.svg?branch=master)](https://travis-ci.org/eddyystop/joi-errors-for-forms)

## Code Examples

(1) Convert the Joi error messages to the form UI schema, retaining the original message text.

```javascript
const Joi = require("joi");
const name = Joi.string().trim().max(1).regex(/^[\sa-zA-Z0-9]{5,30}$/).required();
const password = Joi.string().trim().min(2).max(30).required();
const schema = Joi.object().keys({
  name,
  password,
  confirmPassword: password.label('Confirm password'),
});

const joiToForms = require("joi-errors-to-forms").forms;
const convertToForms = joiToForms();

Joi.validate(values, schema, options, (joiErr, convertedValues) => {
  console.log(convertToForms(joiErr)); // <-- package related
  // { name: '"name" with value "j" fails to match the required pattern: /^[\\sa-zA-Z0-9]{5,30}$/',
  //   password: '"password" length must be at least 2 characters long',
  //   confirmPassword: '"Confirm password" length must be at least 2 characters long'
  // }
});
```


(2) Replace Joi error messages to the form UI schema, using Joi error types. (Recommended.)

```javascript
const joiToForms = require("joi-errors-to-forms").forms;
const convertToForms = joiToForms({
  'string.min': function() {
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
  console.log(convertToForms(joiErr));
  // { name: '"name" must consist of letters, digits or spaces.',
  //   password: '"password" must be 2 or more chars.',
  //   confirmPassword: '"Confirm password" must be 2 or more chars.'
  // }
});

function i18n(str) { return str; } // internationalization

```

or to the Mongoose schema.

```javascript
const joiToMongoose = require("joi-errors-to-forms").mongoose;
const convertToMongoose = joiToMongoose({
  'string.min': function() {
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
  console.log(convertToMongoose(joiErr));
  // { name: 
  //     { message: '"name" must consist of letters, digits or spaces.',
  //       name: 'ValidatorError',
  //       path: 'name',
  //       type: 'string.regex.base' },
  //   password: 
  //     { message: '"password" must be 2 or more chars.',
  //       name: 'ValidatorError',
  //       path: 'password',
  //       type: 'string.min' },
  //   confirmPassword: 
  //     { message: '"Confirm password" must be 2 or more chars.',
  //       name: 'ValidatorError',
  //       path: 'confirmPassword',
  //       type: 'string.min' }
  // }
});

```

List of substitution tokens. Refer to Joi doc for more information.

- `${key}` prop name, or label if `.label('...')` was used.
- `${value}` prop value. Its rudimentally converted to a string.
- `${pattern}` regex value if `.regex(...)` was used. Its converted to a string.
- `${limit}` allowed length of string.
- `${encoding}` string encoding. Could be `undefined`. Its converted to a string.

Note that in the Mongoose schema, `type` retains the Joi value.
It is not converted to what Mongoose would return.


(3) Replace Joi error messages with a generic error message.

```javascript
const convertToForms = joiToForms('"${key}" is badly formed');

Joi.validate(values, schema, options, (joiErr, convertedValues) => {
  console.log(convertToForms(joiErr));
  // { name: '"name" is badly formed.',
  //   password: '"password" is badly formed.',
  //   confirmPassword: '"Confirm password" is badly formed.'
  // }
});

```


(4) Replace Joi error messages, using substrings in Joi messages.

```javascript
const convertToForms = joiToForms([
  { regex: 'at least 2 characters long',
    message: '"${key}" must be 2 or more chars.'
  },
  { regex: /required pattern/,
    message: '"${key}" is badly formed.'
  }
]);

Joi.validate(values, schema, options, (joiErr, convertedValues) => {
  console.log(convertToForms(joiErr));
  // { name: '"name" is badly formed.',
  //   password: '"password" must be 2 or more chars.',
  //   confirmPassword: '"Confirm password" must be 2 or more chars.'
  // }
});

```


(5) Convert the Joi error messages to the Mongoose schema, using Joi error types. (Recommended.)

```javascript
const joiToMongoose = joiErrorsToForms.mongoose;
function i18n(str) { return str; } // internationalization

const convertToMongoose = joiToMongoose({
  'string.min': function() {
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
  console.log(convertToMongoose(joiErr));
  // { name: 
  //     { message: '"name" must consist of letters, digits or spaces.',
  //       name: 'ValidatorError',
  //       path: 'name',
  //       type: 'string.regex.base' },
  //   password: 
  //     { message: '"password" must be 2 or more chars.',
  //       name: 'ValidatorError',
  //       path: 'password',
  //       type: 'string.min' },
  //   confirmPassword: 
  //     { message: '"Confirm password" must be 2 or more chars.',
  //       name: 'ValidatorError',
  //       path: 'confirmPassword',
  //       type: 'string.min' }
  // }
});

```


## Motivation

[Joi](https://github.com/hapijs/joi) is an enterprise strength schema validator and sanitizer.
The error object it returns, however, usually has to be reformatted for use with web/mobile forms.

This package converts Joi errors to the commonly used { name1: text, name2: text } format.

This package also allows you to replace selected Joi messages,
either to make them clearer or for internationalization.

## Installation

Install [Nodejs](https://nodejs.org/en/).

Run `npm install feathers-hooks-validate-joi --save` in your project folder.

You can then require the package.

```javascript
// ES5
var  joiErrorsToForms = require('joi-errors-to-forms');
var joiToForms = joiErrorsToForms.forms;
var joiToMongoose = joiErrorsToForms.mongoose;
// or ES6
import { forms as joiToForms, mongoose as joiToMongoose } from 'joi-errors-to-forms';
```

## API Reference

See Code Examples.

## Tests

`npm test` to run tests.

## Contributors

- [eddyystop](https://github.com/eddyystop)

## License

MIT. See LICENSE.