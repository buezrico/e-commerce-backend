const { Product } = require("../models/product");
const express = require("express");
const { Category } = require("../models/category");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer");

const FILE_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype];
    let uploadError = new Error("invalid image type");
    if (isValid) {
      uploadError = null;
    }
    cb(uploadError, "public/uploads");
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname.split(" ").join("-");
    const extension = FILE_TYPE_MAP[file.mimetype];
    cb(null, `${fileName}-${Date.now()}.${extension}`);
  },
});

const uploadOptions = multer({ storage: storage });

router.get(`/`, async (req, res) => {
  let filter = {};
  if (req.query.categories) {
    filter = { category: req.query.categories.split(",") };
  }
  const productList = await Product.find(filter).populate("category");

  if (!productList) {
    res.status(500).json({ success: false });
  }
  res.send(productList);
});

router.get("/:id", async (req, res) => {
  const product = await Product.findById(req.params.id).populate("category");

  if (!product) return res.status(404).send("No product found");

  res.send(product);
});

router.post(`/`, uploadOptions.single("image"), async (req, res) => {
  const category = await Category.findById(req.body.category);
  if (!category) return res.status(400).send("Invalid Category");

  const file = req.file;
  if (!file) return res.status(404).send("NO image in the request");

  const fileName = req.file.filename;
  const basePath = `${req.protocol}://${req.get("host")}/public/upload/`;

  let product = new Product({
    name: req.body.name,
    image: `${basePath}${fileName}`,
    countInStock: req.body.countInStock,
    description: req.body.description,
    richDescription: req.body.richDescription,
    brand: req.body.brand,
    price: req.body.price,
    category: req.body.category,
    rating: req.body.rating,
    numReviews: req.body.numReviews,
    isFeatured: req.body.isFeatured,
  });

  product = await product.save();

  if (!product) {
    return res.status(400).send("Product not saved");
  }

  res.send(product);
});

router.put("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).send("Invalid Product ID");
  }
  const category = await Category.findById(req.body.category);
  if (!category) return res.status(400).send("Invalid Category");

  const product = await Product.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      image: req.body.image,
      countInStock: req.body.countInStock,
      description: req.body.description,
      richDescription: req.body.richDescription,
      brand: req.body.brand,
      price: req.body.price,
      category: req.body.category,
      rating: req.body.rating,
      numReviews: req.body.numReviews,
      isFeatured: req.body.isFeatured,
    },
    { new: true }
  );

  if (!product) {
    return res.status(400).send("Update failed");
  }

  res.send(product);
});

router.delete("/:id", (req, res) => {
  const product = Product.findByIdAndRemove(req.params.id)
    .then((product) => {
      if (product) {
        return res
          .status(200)
          .json({ success: true, message: "product deleted successfully" });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "product not found" });
      }
    })
    .catch((err) => {
      return res.status(500).json({ success: false, error: err });
    });
});

router.get(`/get/count`, async (req, res) => {
  const productCount = await Product.countDocuments();

  if (!productCount) {
    return res.status(500).json({ success: false, message: "Error" });
  }

  res.send({
    productCount: productCount,
  });
});

router.get("/get/featured/:count", async (req, res) => {
  const count = req.params.count ? req.params.count : 0;
  const products = await Product.find({ isFeatured: true }).limit(+count);

  if (!products)
    return res.status(400).json({ success: false, message: "Error" });

  res.send(products);
});

router.put(
  "/gallery-images/:id",
  uploadOptions.array("images"),
  async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).send("Invalid Product ID");
    }
    const files = req.files;
    let imagesPaths = [];
    const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;

    if (files) {
      files.map((file) => {
        imagesPaths.push(`${basePath}${file.filename}`);
      });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        images: imagesPaths,
      },
      { new: true }
    );

    if (!product) {
      return res.status(400).send("Update failed");
    }

    res.send(product);
  }
);
module.exports = router;
