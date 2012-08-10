module.exports = function(source) {
  var toKB = function(bytes) {
    return (bytes / 1024).toFixed(2);
  };
  var bytes = Buffer.byteLength(source);
  var kb = toKB(bytes);
  return kb;
};
