const express = require("express");
const router = express.Router();
const data = require("../data");
const productsData = data.products;

//to get all products to display on root route
router.get("/", async (req, res) => {
  try {
    let productList = await productsData.getAllProducts();
    return res.json(productList);
  } catch (e) {
    return res.sendStatus(400);
  }
});

// product search through search term
router.get("/:search", async (req, res) => {
  const searchTerm = req.params.search;
  if (!searchTerm || searchTerm.trim().length === 0) {
    console.log(" No search Term Provided (route/products)");
    throw "Need to provide a search term";
  }
  try {
    const productList = await productsData.searchProduct(searchTerm);
    console.log(productList);
    return res.status(200).json({ product: productList });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: error });
  }
});

//to get product by Id provided
router.get("/product/:id", async (req, res) => {
  try {
    let product = await productsData.getProductById(req.params.id);
    return res.json({ product: product });
  } catch (e) {
    return res.status(404).json({ error: "product not found" });
  }
});

//to add product to DB Only for admin use
router.post("/products", async (req, res) => {
  const productInfo = req.body;
  console.log(req.body);
  if (!productInfo) {
    res
      .status(400)
      .json({ error: "You must provide data to create a Product" });
    return;
  }

  if (!productInfo.title) {
    res.status(400).json({ error: "You must provide a title" });
    return;
  }

  try {
    const {
      title,
      description,
      productImage,
      noOfLikes,
      comments,
      likedBy,
      createdBy,
      createdAt,
    } = productInfo;
    const newProduct = await productsData.addProducts(
      title,
      description,
      productImage,
      noOfLikes,
      comments,
      likedBy,
      createdBy,
      createdAt
    );
    res.json(newProduct);
    return res.sendStatus(200);
  } catch (e) {
    console.log(e);
    return res.status(500).json({ error: "Product was not added" });
  }
});

module.exports = router;
