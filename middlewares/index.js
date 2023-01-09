const fs = require('fs');

module.exports = app => {
    // console.log(fs.readdirSync(__dirname).sort());
    fs.readdirSync(__dirname).sort().forEach(file => {
        console.log(`Connect middleware file ${file}...`);
        if (file == "index.js") return;
        const name = file.split('.')[0];
        require('./' + name)(app);
    });
};

// module.exports();