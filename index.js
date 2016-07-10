
// Helpers

// stackoverflow.com/questions/767486/how-do-you-check-if-a-variable-is-an-array-in-javascript
var isArray = Array.isArray ? Array.isArray
  : function(array) { return array.constructor === Array; };

// stackoverflow.com/questions/646628/how-to-check-if-a-string-startswith-another-string
var startsWith = function(str, pattern) {
  return str.indexOf(pattern) === 0;
};

// stackoverflow.com/questions/1144783/replacing-all-occurrences-of-a-string-in-javascript
function replaceAll(str, find, replace) {
  return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}

function escapeRegExp(str) {
  return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

// Package

module.exports = function joiErrorsForForms(options) {
  var convert = useJoiMsg;
  if (typeof options === 'string') { convert = useFixedMsg; }
  if (typeof options === 'object') {
    convert = isArray(options) ? useRegex : useType;
  }

  return function joiErrorsForFormsInner(joiErrs) {
    if (!joiErrs || !joiErrs.details) {
      return null;
    }

    var newErrs = {};
    for (var i = 0, leni = joiErrs.details.length; i < leni; i++) {
      var detail = joiErrs.details[i];
      newErrs[detail.path] = convert(detail);
    }

    return newErrs;
  };

  function useJoiMsg(detail) {
    return detail.message;
  }

  function useFixedMsg(detail) {
    return substituteContext(detail.context, options);
  }

  function useRegex(detail) {
    var detailMessage = detail.message;

    for (var i = 0, leni = options.length; i < leni; i++) {
      var option = options[i];
      var regex = option.regex;

      if (typeof regex === 'string'
          ? detailMessage.indexOf(regex) !== -1
          : detailMessage.search(regex) !== -1) {
        //return option.message.replace('%s', detail.context.key);
        return substituteContext(detail.context, option.message);
      }
    }

    return detailMessage;
  }

  function useType(detail) {
    var context = detail.context;
    var message = options[detail.type](context) || detail.message;
    return substituteContext(context, message);
  }

  function substituteContext(context, message) {
    for (var prop in context) {
      if (context.hasOwnProperty(prop)) {
        message = replaceAll(message, '${' + prop + '}', '' + context[prop]);
      }
    }

    return message;
  }
};
