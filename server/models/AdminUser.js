const mongoose = require("mongoose");

const scheam = new mongoose.Schema({
  username: { type: String },
  password: {
    type: String,
    select: false,
    set(val) {
      //指数越大越好，但是耗时越多，一般10-12
      return require("bcryptjs").hashSync(val, 10);
    },
  },
});

module.exports = mongoose.model("AdminUser", scheam);
