module.exports = (app) => {
  const express = require("express");
  const router = express.Router({
    mergeParams: true,
  });

  router.post("/", async (req, res) => {
    const model = await req.Model.create(req.body);
    res.send(model);
  });
  router.put("/:id", async (req, res) => {
    const model = await req.Model.findByIdAndUpdate(req.params.id, req.body);
    res.send(model);
  });
  router.get("/", async (req, res) => {
    let queryOptions = {};
    if (req.Model.modelName == "Category") {
      queryOptions.populate = "parent";
    }
    const items = await req.Model.find().setOptions(queryOptions);
    res.send(items);
  });
  router.delete("/:id", async (req, res) => {
    await req.Model.findByIdAndDelete(req.params.id, res.body);

    res.send({
      success: true,
    });
  });

  router.get("/:id", async (req, res) => {
    const model = await req.Model.findById(req.params.id);
    res.send(model);
  });

  app.use(
    "/admin/api/rest/:resource",
    async (req, res, next) => {
      const modelName = require("inflection").classify(req.params.resource);
      //const Model = require(`../../models/${modelName}`);
      //不能是const，若是const则后面访问不到，应当挂载到req上
      req.Model = require(`../../models/${modelName}`);
      next();
    },
    router
  );
  const multer = require("multer");
  const upload = multer({ dest: __dirname + "/../../uploads" });
  app.post("/admin/api/upload", upload.single("file"), async (req, res) => {
    const file = req.file;
    file.url = `http://localhost:3000/uploads/${file.filename}`;
    res.send(file);
  });
  app.post("/admin/api/login", async (req, res) => {
    const { username, password } = req.body;
    const AdminUser = require("../../models/AdminUser");
    const user = await AdminUser.findOne({
      username: username,
    }).select("+password"); //强制取出密码
    if (!user) {
      return res.status(422).send({
        message: "用户不存在",
      });
    } else {
      const isValid = require("bcryptjs").compareSync(password, user.password);
      if (!isValid) {
        return res.status(422).send({
          message: "密码错误",
        });
      }
    }
    const jwt = require("jsonwebtoken");
    const token = jwt.sign({ id: user._id }, app.get("secret"));
    res.send(token);
  });
};
