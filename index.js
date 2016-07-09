
module.exports = function joiErrorsForForms(options) {
  var convert = !options ? useJoiMsg : (typeof options === 'string' ? useFixedMsg : useRegex);

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
    return options.replace('%s', detail.context.key);
  }

  function useRegex(detail) {
    var detailMessage = detail.message;

    for (var i = 0, leni = options.length; i < leni; i++) {
      var test = options[i];
      var regex = test.regex;

      if (typeof regex === 'string'
          ? detailMessage.indexOf(regex) !== -1
          : detailMessage.search(regex) !== -1) {
        return test.message.replace('%s', detail.context.key);
      }
    }

    return detailMessage;
  }
};
