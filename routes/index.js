const fs = require('fs');

module.exports = app => {
    // console.log(fs.readdirSync(__dirname).sort());
    fs.readdirSync(__dirname).sort().forEach(file =>{
        if (file == "index.js") return;
        const name = file.split('.')[0];
        const routes = require('./' + name);
        Object.keys(routes).forEach(el => {
            app.use(el, routes[el]);
        });
    });
};