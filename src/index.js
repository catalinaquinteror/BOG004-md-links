const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const process = require("process");
const { argv } = require("process");
const fetch = require("node-fetch");

/**
 * Validation if path exist
 * @param {*} originalPath
 * @returns if path exist return 'true' and if not return 'false'
 */

const pathExist = (originalPath) => {
  const ifExist = fs.existsSync(originalPath);
  // console.log(chalk.magenta(`pathExists(${originalPath}) ${ifExist}`));
  return ifExist;
};

/**
 * Is a relative or an absolute path? A TypeError is thrown if this parameter is not a string.
 * @param {string} originalPath
 * @returns if is absolute, return false; if is relative, return true
 */

const realtivePath = (originalPath) => {
  let pathAbsolute = originalPath;
  const absolute = path.isAbsolute(originalPath);
  if (absolute === false) {
    pathAbsolute = path.resolve(originalPath); // Si no es absoluta, usa el método resolve para convertirlo
  }

  return pathAbsolute;
};

/**
 * Valdiate if is a directory and md file, and open the file
 * @param {*} originalPath
 * @returns
 */

//funcion recursiva
const searchMd = (originalPath) => {
  let arrayAbsolutePathMd = [];
  const userPath = realtivePath(originalPath);
  // console.log((chalk.magenta('This is a directory', (chalk.blueBright(userPath)))));
  if (fs.statSync(userPath).isFile() && path.extname(userPath) === ".md") {
    // es archivo y extensión md
    arrayAbsolutePathMd.push(userPath);
    // console.log((chalk.yellowBright('Is a file')), userPath)
  } else if (
    fs.statSync(userPath).isFile() &&
    path.extname(userPath) !== ".md"
  ) {
    // es archivo y no es una extensión md
    // console.log((chalk.yellowBright('Is another file')))
  } else {
    const openDirectory = fs.readdirSync(userPath);
    openDirectory.forEach((element) => {
      let newPath = path.join(userPath, element);
      // console.log('ids', searchMd(newPath))
      if (fs.statSync(newPath).isDirectory()) {
        arrayAbsolutePathMd = arrayAbsolutePathMd.concat(searchMd(newPath));
      } else {
        if (path.extname(newPath) === ".md") {
          arrayAbsolutePathMd.push(newPath);
        }
      }
    });
  }
  // console.log((chalk.yellowBright('Its an array')), arrayAbsolutePathMd)
  return arrayAbsolutePathMd;
};
searchMd(argv[2]);

// Read the files function
const reasultMdFunction = searchMd(argv[2]);
// console.log('array', reasultMdFunction)
const readFiles = (userPath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(userPath, "utf8", (err, data) => {
      if (err) {
        console.error("error", err);
        reject();
      }
      // console.log('contenido', data);
      resolve(data);
    });
  });
};

// Get the links .md function

const getLinksMd = (fileMd) => {
  return new Promise((resolve, reject) => {
    const regexp = /(?<!!)\[(.*?)\]\((.*?)\)/g;
    let sameLinks = [];
    let totalLinks = [];
    readFiles(fileMd)
    .then((response) => {
      sameLinks = response.match(regexp);
      // console.log('es', sameLinks)
      if (sameLinks !== null) {
        sameLinks.forEach((link) => {
          // console.log('link', link)
          totalLinks.push({
            href: link
              .match(/(?<!!)\((.*?)\)/g)
              .toString()
              .replace(/\(|\)/g, ""),
            text: link
              .match(/(?<!!)\[(.*?)\]/g)
              .toString()
              .replace(/\[|\]/g, ""),
            file: fileMd,
          });
        });
      }
      resolve(totalLinks);
    })
    .catch((err) => {
      console.log('aqui', err)
      reject()
    }
      )
  });
};

// Total links on a function

const totales = (arrMds) => {
  let arrTotalObjects = [];
  let promesas;
  arrMds.forEach((fileMd) => {
    promesas = getLinksMd(fileMd).then((response) => {
      // console.log('ver', response)
      return response;
    });
    arrTotalObjects.push(promesas.then((res) => res));
  });

  return Promise.all(arrTotalObjects).then((res) => {
    // console.log('res: ', res.flat())
    return res.flat();
  });
};

// Validate the links function using fetch

const validateLinks = (response) => {
  //console.log('aaah', response)
  const result = response.map((objeto) => {
    return fetch(objeto.href)
    .then((res) => {
      // console.log('result', res)
      objeto.status = res.status;
      objeto.statusTxt = res.statusText;
      // console.log('obj', objeto)
      return objeto;
    })
    .catch((err)=>{
      return
    })
  });
  return Promise.all(result);
};

totales(reasultMdFunction).then((response) => {
  // console.log('total', response)
  validateLinks(response)
  // .then((res) => console.log("validación"));
});

// Stats function
const statsLinks = (arrLinks) => {
  //console.log('here', arrLinks)
  return {
    Total: arrLinks.length,
    Unique: new Set(arrLinks.map((element) => element.href)).size,
  };
};

// Broken function
const brokenLinks = (arrLinks) => {
  const broken = arrLinks.filter((elem) => elem.statusTxt !== "OK").length;
  return {
    Total: arrLinks.length,
    Unique: new Set(arrLinks.map((element) => element.href)).size,
    Broken: broken,
  };
};

module.exports = {
  pathExist,
  realtivePath,
  searchMd,
  readFiles,
  getLinksMd,
  totales,
  validateLinks,
  statsLinks,
  brokenLinks,
};