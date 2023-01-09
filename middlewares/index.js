const fs = require('fs');

module.exports = app => {
    // console.log(fs.readdirSync(__dirname).sort());
    fs.readdirSync(__dirname).sort().forEach(function(file) {
        if (file == "index.js") return;
        var name = file.split('.')[0];
        require('./' + name)(app);
    });
};

// module.exports();