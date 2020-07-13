const express = require("express");

const app = express();

app.use(require("cors")());
app.use(express.json());
app.use("/uploads", express.static(__dirname + "/uploads"));
app.set("secret", "moba");

require("./routes/admin/index")(app);
require("./plugins/db")(app);

app.listen(3000, () => {
  console.log("express服务器已启动");
});
