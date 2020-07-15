module.exports = (app) => {
  const express = require("express");
  const jwt = require("jsonwebtoken");
  const AdminUser = require("../../models/AdminUser");
  const assert = require("http-assert");

  const router = express.Router({
    mergeParams: true,
  });

  const authMiddelware = require("../../middleware/auth");
  const resourceMiddleware = require("../../middleware/resource");

  //创建资源
  router.post("/", async (req, res) => {
    const model = await req.Model.create(req.body);
    res.send(model);
  });

  //更新资源
  router.put("/:id", async (req, res) => {
    const model = await req.Model.findByIdAndUpdate(req.params.id, req.body);
    res.send(model);
  });

  //资源列表
  router.get("/", async (req, res) => {
    let queryOptions = {};
    if (req.Model.modelName == "Category") {
      queryOptions.populate = "parent";
    }
    const items = await req.Model.find().setOptions(queryOptions);
    res.send(items);
  });

  //删除资源
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
    authMiddelware(),
    resourceMiddleware(),
    router
  );

  const multer = require("multer");
  const upload = multer({ dest: __dirname + "/../../uploads" });
  app.post(
    "/admin/api/upload",
    authMiddelware(),
    upload.single("file"),
    async (req, res) => {
      const file = req.file;
      file.url = `http://localhost:3000/uploads/${file.filename}`;
      res.send(file);
    }
  );
  app.post("/admin/api/login", async (req, res) => {
    const { username, password } = req.body;
    const user = await AdminUser.findOne({
      username: username,
    }).select("+password"); //强制取出密码

    assert(user, 422, "用户不存在");

    const isValid = require("bcryptjs").compareSync(password, user.password);

    assert(isValid, 422, "密码错误");

    const token = jwt.sign({ id: user._id }, app.get("secret"));
    res.send(token);
  });

  app.use(async (err, req, res, next) => {
    res.status(err.statusCode || 500).send({
      message: err.message,
    });
  });
};
