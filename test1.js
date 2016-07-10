
var forForms = require('./index');
var testFails = false;

function compare(obj1, obj2, testName) {
  var isOk = JSON.stringify(obj1) === JSON.stringify(obj2);
  console.log(testName + (isOk ? ' OK' : ' ERROR'));

  testFails = testFails || !isOk;
  return isOk;
}

var joiErrs = {
  isJoi: true,
  name: 'ValidationError',
  // an array of errors
  details: [
    { // string with a description of the error.
      message: '"name" with value "j" fails to match the required pattern: /^[\\sa-zA-Z0-9]{5,30}$/',
      // dotted path to the key where the error happened.
      path: 'name',
      // type of the error.
      type: 'string.regex.base',
      // object providing context of the error.
      context:
      { name: undefined,
        pattern: /^[\sa-zA-Z0-9]{5,30}$/,
        value: 'j',
        key: 'name' }
    },
    { message: '"password" length must be at least 2 characters long',
      path: 'password',
      type: 'string.min',
      context:
      { limit: 2,
        value: 'z',
        encoding: undefined,
        key: 'password' } },
    { message: '"Confirm password" length must be at least 2 characters long',
      path: 'confirmPassword',
      type: 'string.min',
      context:
      { limit: 2,
        value: 'z',
        encoding: undefined,
        key: 'Confirm password' } }
  ],
  _object:
  { name: 'j',
    email: 'z@z.com',
    password: 'z',
    confirmPassword: 'z' },
  // function that returns a string with an annotated version of the object
  // pointing at the places where errors occured.
  annotate: [Function]
};

// test 1

var form1 = {
  name: '"name" with value "j" fails to match the required pattern: /^[\\sa-zA-Z0-9]{5,30}$/',
  password: '"password" length must be at least 2 characters long',
  confirmPassword: '"Confirm password" length must be at least 2 characters long'
};
var form1Err = forForms()(joiErrs);
compare(form1Err, form1, 'no conversion');

// test 2

var form2 = {
  name: '"name" is badly formed.',
  password: '"password" is badly formed.',
  confirmPassword: '"Confirm password" is badly formed.'
};
var form2Err = forForms('"${key}" is badly formed.')(joiErrs);
compare(form2Err, form2, 'fixed message');

// test 3

var form3 = {
  name: '"name" must consist of letters, digits or spaces.',
  password: '"password" length must be at least 2 characters long',
  confirmPassword: '"Confirm password" length must be at least 2 characters long'
};
var form3Err = forForms([
  { regex: 'fails to match the required pattern: /^[\\sa-zA-Z0-9]',
    message: '"${key}" must consist of letters, digits or spaces.'
  }
])(joiErrs);
compare(form3Err, form3, 'string search');

// test 4

var form4 = {
  name: '"name" is badly formed.',
  password: '"password" must be 2 or more chars.',
  confirmPassword: '"Confirm password" must be 2 or more chars.'
};
var form4Err = forForms([
  { regex: 'length must be at least 2 characters long',
    message: '"${key}" must be 2 or more chars.'
  },
  { regex: /required pattern/,
    message: '"${key}" is badly formed.'
  }
])(joiErrs);
compare(form4Err, form4, 'regex search');

// test 5

var form5 = {
  name: '"name" must consist of letters, digits or spaces.',
  password: '"password" must be 2 or more chars.',
  confirmPassword: '"Confirm password" must be 2 or more chars.'
};
var form5Err = forForms({
  'string.min': function(c) {
    return i18n('"${key}" must be ${limit} or more chars.');
  },
  'string.regex.base': function(c) {
    switch (c.pattern.toString()) {
      case /^[\sa-zA-Z0-9]{5,30}$/.toString():
        return i18n('"${key}" must consist of letters, digits or spaces.');
    }
  }
})(joiErrs);
compare(form5Err, form5, 'type search');

// check results

if (testFails) {
  throw Error('Test failed.')
}

// helpers

function i18n(str) { return str; }

