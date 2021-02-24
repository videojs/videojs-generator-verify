const cjsFields = ['main', 'browser'];
const esFields = ['es2015', 'module'];
const allFields = ['bin'].concat(cjsFields).concat(esFields);

const getFieldFiles = function(pkg, fields) {
  // only store unique entires
  const files = new Set();

  fields.forEach(function(field) {
    if (Array.isArray(pkg[field])) {
      return pkg.field.forEach((file) => files.add(file));
    }

    if (typeof pkg[field] === 'object') {
      return Object.keys(pkg[field]).forEach((key) => files.add(pkg[field][key]));
    }

    if (typeof pkg[field] === 'string') {
      return files.add(pkg[field]);
    }
  });

  return files;
};

module.exports = {
  getFieldFiles,
  allFields,
  cjsFields,
  esFields
};
