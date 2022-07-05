#!/usr/bin/env node

// CLI (Command Line Interface)
const { mdLinks } = require('./md-links.js')
const { statsLinks, brokenLinks } = require('./index.js')
const argv = process.argv;
//console.log('args', argv)

let options = {
    validate: false,
    stats: false,
}

if (!argv.includes('--stats') && !argv.includes('--validate')) {
    mdLinks(argv[2], options).then(response => {
        console.log('solo hay path: ', response)
    })
} else {
    mdLinks(argv[2], options = { validate: true }).then(response => {
        if (argv.includes('--stats') && !argv.includes('--validate')) {
            console.log('statsLinks: ', statsLinks(response))
        } else if (argv.includes('--validate') && argv.includes('--stats')) {
            console.log('brokenLinks: ', brokenLinks(response))
        } else {
            console.log('validate', response)
        }
    })
}