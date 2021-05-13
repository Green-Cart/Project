const express = require("express");
const router = express.Router();
const data = require("../data");
const productsData = data.products;

const commentsData = data.comments;
const productType = data.productType;

const errorHandler = require("../Error/DatabaseErrorHandling");
const { get, route } = require("./users");

router.post("/product", async (req, res) => {
  const productInfo = req.body;

  productInfo["price"] = parseFloat(productInfo.price)
  productInfo["stock"] = parseInt(productInfo.stock)

  productInfo["facet"] = [
    { property: "product_type", value: "plant" },
    { property: "color", value: "green" },
  ]

  console.log(productInfo.productImage)

  console.log(productInfo);
  try {
    errorHandler.checkObject(productInfo, "Product form data");
    errorHandler.checkString(productInfo.title, "title");
    errorHandler.checkString(productInfo.description, "Description");
    errorHandler.checkString(productInfo.productImage, "Product Image"); //have to check other test cases
    errorHandler.checkString(productInfo.createdBy, "Created By");
    errorHandler.checkInt(productInfo.stock, "Stock");
    errorHandler.checkFacet(productInfo.facet);
    errorHandler.checkFloat(productInfo.price, "price");

    const { title, description, productImage, createdBy, stock, facet, price } =
      productInfo;

    const newProduct = await productsData.addProduct(
      title,
      description,
      productImage,
      createdBy,
      stock,
      facet,
      price
    );
    res.json(newProduct);
    res.status(200);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Product was not added" });
  }
});

router.delete("/product/:id", async (req, res) => {
  try {
    errorHandler.checkStringObjectId(req.params.id, "Product ID");
    const product = await productsData.getProductById(req.params.id);
    await productsData.deleteProduct(req.params.id, product.stock);
    res.json(product);
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.sendStatus(404);
  }
});


//to get all products to display on root route
router.get("/", async (req, res) => {
  try {
    let productList = await productsData.getAllProducts();
    if (productList.length > 0) {
      hasProduct = true;
    }

    return res.render("pages/home", {
      title: "All Product List",
      productList: productList,
      hasProduct: hasProduct,
    });
  } catch (e) {
    return res.sendStatus(400);
  }
});

// like
router.patch("/product/like/:id", async (req, res) => {
  try {
    errorHandler.checkStringObjectId(req.params.id, "Product ID");
    await productsData.addLike(req.params.id, "6096ea6fb548d9936bc7c9bd");
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.sendStatus(404);
  }
});

//to get product by Id provided
router.get("/products/product/:id", async (req, res) => {
  try {

    // if (req.session.user) {
    errorHandler.checkStringObjectId(req.params.id, "Product ID");
    let product = await productsData.getProductById(req.params.id);
    console.log(product);
    await usersData.userViewsAProduct(
      "609a2fca59ef0ecfeb7b57af",
      req.params.id
    );
    res.render("pages/singleProduct", {
      title: product.title,
      product: product,
    });

    // } else {
    //   res.sendStatus(404).json({ message: "User not Authenticated" });
    // }
  } catch (e) {
    return res.status(404).json({ error: "product not found" });
  }
});

//adding products into the database (admin access only)
router.post("/", async (req, res) => {
  const productInfo = req.body;
  console.log(req.body);
  if (!productInfo) {
    res
      .status(400)
      .json({ error: "You must provide data to create a Product" });
    return;
  }
});
router.patch("/product/like/:id", async (req, res) => {
  try {
    errorHandler.checkStringObjectId(req.params.id, "Product ID");
    await productsData.addLike(req.params.id, "6096ea6fb548d9936bc7c9bd");
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.sendStatus(404);
  }
});

router.patch("/product/comment/:id", async (req, res) => {
  
  try {
    errorHandler.checkStringObjectId(req.params.id, "Product ID");
    await commentsData.addComment(
      "6096ea6fb548d9936bc7c9bd",
      req.params.id,
      "This product is so good"
    );
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.sendStatus(404);
  }
});

router.patch("/product/addtocart/:id", async (req, res) => {
  
  try {
    errorHandler.checkStringObjectId(req.params.id, "Product ID");
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.sendStatus(404);
  }
});

router.get("/producttypes", async (req, res) => {
  try {
    const types = await productType.getProductTypes();
    const result = [];
    for (type of types) {
      result.push(type.type);
    }
    res.status(200);
    res.json(result);
  } catch (error) {
    console.log(error);
    res.sendStatus(404);
  }
});

router.get("/properties/:type", async (req, res) => {
  try {
    errorHandler.checkString(req.params.type);
    const types = await productType.getProductTypes();
    const result = [];
    for (type of types) {
      if (type.type == req.params.type) {
        for (prop of type.properties) {
          const { name, type, values } = prop;
          result.push({ name, type, values });
        }
        res.json(result);
        return;
      }
      result.push(type.type);
    }
    res.status(200);
    res.json(result);
  } catch (error) {
    console.log(error);
    res.sendStatus(404);
  }
});

router.post("/search", async (req, res) => {
  console.log("hello");
  const searchTerm = req.body.searchTerm;
  try {
    errorHandler.checkString(searchTerm);
    const productList = await productsData.searchProduct(searchTerm);

    if (productList.length > 0) {
      hasProduct = true;
    }
    return res.render("pages/home", {
      title: "All Product List",
      productList: productList,
      hasProduct: hasProduct,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: error });
  }
});

router.post("/filter", async (req, res) => {
  const filterProp = req.body;
  try {
    errorHandler.checkFilterProperties(filterProp);
    const productList = await productsData.filterProducts(filterProp);

    if (productList.length > 0) {
      hasProduct = true;
    }

    return res.render("pages/home", {
      title: "All Product List",
      productList: productList,
      hasProduct: hasProduct,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: error });
  }
});

module.exports = router;
