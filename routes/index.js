const fs = require('fs');

module.exports = app => {
    // console.log(fs.readdirSync(__dirname).sort());
    fs.readdirSync(__dirname).sort().forEach(file => {
        console.log(`Connect route file ${file}`);
        if (file == "index.js") return;
        const name = file.split('.')[0];
        const routes = require('./' + name);
        Object.keys(routes).forEach(el => {
            console.log(`Connect route ${el} -> ${file}`);
            app.use(el, routes[el]);
        });
    });
};