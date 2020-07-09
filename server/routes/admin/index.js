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
};
