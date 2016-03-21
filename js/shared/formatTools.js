
define(function(){
  /**
  * A function to replicate the common string.format() methods in other languages.
  * Cribbed from:
  * http://stackoverflow.com/questions/610406/javascript-equivalent-to-printf-string-format
  * @param  {String} string The format string to use
  * @param  {Array} args   An array of the arguments to use for the format string
  * @return {String}        The format string, where format symbols have been replaced by args.
  */
  function strFormat(string, args){
      return string.replace(/{(\d+)}/g, function(match, number) {
          return typeof args[number] != 'undefined' ? args[number] : match;
      });
  }

  var formatToolsObj = {};
  formatToolsObj.stringFormat = strFormat;
  return formatToolsObj;
});
