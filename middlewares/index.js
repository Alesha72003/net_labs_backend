const fs = require('fs');

module.exports = app => {
    // console.log(fs.readdirSync(__dirname).sort());
    fs.readdirSync(__dirname).sort().forEach(file => {
        if (file == "index.js") return;
        console.log(`Connect middleware file ${file}...`);
        const name = file.split('.')[0];
        require('./' + name)(app);
    });
};

// module.exports();