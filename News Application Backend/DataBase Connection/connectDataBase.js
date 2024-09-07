const mongoose = require('mongoose');

let connectDataBase = (url) => {
    mongoose.connect(url)
}

module.exports = connectDataBase