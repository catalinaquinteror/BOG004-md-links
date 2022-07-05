// return promesas
const { argv } = require("process");
const { pathExist, searchMd, totales, validateLinks } = require("./index.js");

const mdLinks = (path, options = { validate: false }) => {
  return new Promise((resolve, reject) => {
    if (pathExist(path)) {
      if (options.validate) {
        totales(searchMd(path)).then((response) => {
          validateLinks(response).then((res) => resolve(res));
        });
      } else {
        totales(searchMd(path)).then((response) => {
          resolve(response);
        });
      }
    } else {
      reject("No existe");
    }
  });
};

module.exports = { mdLinks };

// mdLinks(argv[2], {validate: false}).then(response=>{
//     console.log('funciona por favor: ', response)
//     return response
// })
