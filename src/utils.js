const jsonRegex = /\[(.|\n)*\]$/;

const getParsedJsonFromOutput = function(stdout) {
  const jsonString = (stdout).match(jsonRegex)[0];

  try {
    return JSON.parse(jsonString);
  } catch (e) {
    return null;
  }
};

module.exports = getParsedJsonFromOutput;
