const mongoCollections = require("../config/mongoCollections");
const products = mongoCollections.products;
const { ObjectId } = require("mongodb");
const errorHandler = require("../Error/DatabaseErrorHandling");
const { checkStringObjectId } = require("../Error/DatabaseErrorHandling");

//functions in this file

//getAllProducts() // tested //Error Handling
//getProductById(id) // tested // Error Handling
//addProduct() // tested // Error Handling
//addCommentsToProduct() // tested //Error Handling
//getProductComments() // tested //Error Handling
//addLike() //tested //Error Handling
//updateStockOfProduct() // tested //Error Handling
//deleteProduct() // tested //Error Handling
//searchProduct() // tested //Error Handling
//filterProducts() // tested //Error Handling
//sortProducts() // partially tested //Error Handling // didnt test with different page no

let exportedMethods = {
  async getAllProducts() {
    const productCollection = await products();

    const productList = await productCollection.find({}).toArray();

    if (productList.length == 0) throw "No Book in system!";

    const result = [];

    for (let product of productList) {
      let {
        _id,
        title,
        description,
        productImage,
        noOfLikes,
        createdAt,
        stock,
        facet,
        price,
      } = product;
      _id = _id.toString();
      result.push({
        _id,
        title,
        description,
        productImage,
        noOfLikes,
        createdAt,
        stock,
        facet,
        price,
      });
    }
    return result;
  },

  async getProductById(id) {
    errorHandler.checkStringObjectId(id, "Product ID");
    const productCollection = await products();
    const product = await productCollection.findOne({ _id: ObjectId(id) });
    if (!product) throw "product not found";
    product._id = product._id.toString();
    return product;
  },

  async addProduct(
    title,
    description,
    productImage,
    createdBy,
    stock,
    facet,
    price
  ) {
    errorHandler.checkString(title, "title");
    errorHandler.checkString(description, "Description");
    errorHandler.checkString(productImage, "Product Image"); //have to check other test cases
    errorHandler.checkString(createdBy, "Created By");
    errorHandler.checkInt(stock, "Stock");
    errorHandler.checkFacet(facet);
    errorHandler.checkFloat(price, "price");

    const productType = require("./index").productType;
    const productCollection = await products();
    let newProduct = {
      title: title,
      description: description,
      productImage: productImage,
      noOfLikes: 0,
      comments: [],
      likedBy: [],
      createdBy: createdBy,
      createdAt: new Date(),
      stock: stock,
      facet: facet,
      price: price,
    };

    const insertedInfo = await productCollection.insertOne(newProduct);
    if (insertedInfo.insertedCount === 0) throw "Insert failed!";

    if (await productType.doesProductTypeExist(facet[0]["value"])) {
      const removedProp = facet.shift();
      for (attribute of facet) {
        const newProp = {
          name: attribute.property,
          type: typeof attribute.value,
          values: [attribute.value],
        };

        if (
          await productType.doesPropertyOfProductTypeExist(
            removedProp["value"],
            newProp
          )
        ) {
          await productType.updateCountOfAPropertyforGivenType(
            removedProp["value"],
            newProp,
            true,
            stock
          );
          await productType.updateValuesOFAPropertyWithGivenType(
            removedProp["value"],
            newProp
          );
          continue;
        } else {
          await productType.updatePropertiesOfProduct(
            removedProp["value"],
            newProp,
            stock
          );
        }
      }
      await productType.updateCountOfProducts(
        removedProp["value"],
        true,
        stock
      );
    } else {
      let removedProp = facet.shift();
      await productType.addNewProductType(removedProp["value"], facet, stock);
    }

    return insertedInfo.insertedId.toString();
  },

  async addCommentsToProduct(productID, commentID) {
    errorHandler.checkStringObjectId(productID, "Product ID");
    errorHandler.checkStringObjectId(commentID, "Comment ID");

    const productCollection = await products();
    const updatedInfo = await productCollection.updateOne(
      {
        _id: ObjectId(productID),
      },
      {
        $push: {
          comments: ObjectId(commentID),
        },
      }
    );

    if (updatedInfo.updatedCount === 0) throw "Update failed!";
  },

  async getProductComments(productID) {
    errorHandler.checkStringObjectId(productID, "Product ID");
    const commentsData = require("./index").comments;
    const product = await this.getProductById(productID);
    const comments = [];
    for (comment of product.comments) {
      comments.push(await commentsData.getComment(comment.toString()));
    }
    return comments;
  },

  async addLike(productID, userID) {
    errorHandler.checkStringObjectId(productID, "Product ID");
    errorHandler.checkStringObjectId(userID, "User ID");
    const productsCollection = await products();
    const updatedInfo = await productsCollection.updateOne(
      {
        _id: ObjectId(productID),
      },
      {
        $inc: {
          noOfLikes: 1,
        },

        $push: {
          likedBy: ObjectId(userID),
        },
      }
    );

    if (updatedInfo.updatedCount === 0) throw "Update failed to add like";

    const users = require("./index").users;

    await users.userLikesAProduct(userID, productID);
  },
  async addDisLike(productID, userID) {
    errorHandler.checkStringObjectId(productID, "Product ID");
    errorHandler.checkStringObjectId(userID, "User ID");
    const productsCollection = await products();
    const updatedInfo = await productsCollection.updateOne(
      {
        _id: ObjectId(productID),
      },
      {
        $inc: {
          noOfLikes: -1,
        },

        $pull: {
          likedBy: ObjectId(userID),
        },
      }
    );

    if (updatedInfo.updatedCount === 0) throw "Update failed to add dis like";

    const users = require("./index").users;

    await users.userDisLikesAProduct(userID, productID);
  },

  async updateStockOfProduct(productID) {
    errorHandler.checkStringObjectId(productID, "Product ID");
    const productType = require("./index").productType;

    const productsCollection = await products();

    const product = await this.getProductById(productID);

    if (product.stock == 1) {
      this.deleteProduct(product);
    } else {
      const updatedInfo = await productsCollection.updateOne(
        {
          _id: ObjectId(productID),
        },
        {
          $inc: {
            stock: -1,
          },
        }
      );

      if (updatedInfo.updatedCount === 0) throw " failed to update stock";

      await productType.updateCountOfProducts(
        product.facet[0]["value"],
        false,
        1
      );

      const removedProp = product.facet.shift();

      for (attribute of product.facet) {
        const newProp = {
          name: attribute.property,
          type: typeof attribute.value,
        };

        await productType.updateCountOfAPropertyforGivenType(
          removedProp["value"],
          newProp,
          false,
          1
        );
      }
    }
  },

  // must specify the exact scock of the product.
  async deleteProduct(productID, stock = 1) {
    errorHandler.checkStringObjectId(productID, "Product ID");
    errorHandler.checkInt(stock, "stock");
    const productType = require("./index").productType;

    const productsCollection = await products();
    const product = await this.getProductById(productID);

    const deletedInfo = await productsCollection.deleteOne({
      _id: ObjectId(product._id),
    });
    if (deletedInfo.deletedCount === 0) throw "failed to delete a product";

    await productType.updateCountOfProducts(
      product.facet[0]["value"],
      false,
      stock
    );

    const removedProp = product.facet.shift();

    for (attribute of product.facet) {
      const newProp = {
        name: attribute.property,
        type: typeof attribute.value,
      };

      await productType.updateCountOfAPropertyforGivenType(
        removedProp["value"],
        newProp,
        false,
        stock
      );
    }
    await productType.deleteProductPropertiesWithCountZero(
      removedProp["value"]
    );
    await productType.deleteProductTypeWithCountZero();
  },

  async searchProduct(searchTerm) {
    errorHandler.checkString(searchTerm, "Search Term");
    const productsCollection = await products();

    // ref:https://docs.mongodb.com/manual/text-search/
    await productsCollection.createIndex({
      title: "text",
      description: "text",
    });

    const productsList = await productsCollection
      .find({
        $text: {
          $search: searchTerm,
        },
      })
      .toArray();

    // if (productsList.length == 0)
    //   throw "Could not find products with the given search term";
    return productsList;
  },

  async filterProducts(properties) {
    errorHandler.checkFilterProperties(properties);
    const productsCollection = await products();

    const properiesList = [];

    for (p in properties) {
      if (typeof properties[p] === "number") {
        properiesList.push({
          facet: { $elemMatch: { property: p, value: { $lt: properties[p] } } },
        });
        continue;
      }
      properiesList.push({
        facet: { $elemMatch: { property: p, value: properties[p] } },
      });
    }

    const productsList = productsCollection
      .find({
        $and: properiesList,
      })
      .toArray();

    if (productsList.length == 0)
      throw "could not able to find products with such properties.";

    return productsList;
  },

  async sortProducts(sortby, pageNo) {
    errorHandler.checkInt(pageNo, "Page No");
    errorHandler.checkString(sortby, "Sort Option");
    const productsCollection = await products();

    let productsList = 0;

    if (sortby === "time") {
      productsList = await productsCollection
        .find({})
        .sort({ _id: 1 })
        .skip(pageNo * 20)
        .limit(20)
        .toArray();
    } else if (sortby === "likes") {
      productsList = await productsCollection
        .find({})
        .sort({ noOfLikes: -1 }) // -1 for descending order
        .skip(pageNo * 20)
        .limit(20)
        .toArray();
    } else if (sortby === "stock") {
      productsList = await productsCollection
        .find({})
        .sort({ stock: -1 }) // -1 for descending order
        .skip(pageNo * 20)
        .limit(20)
        .toArray();
    } else if (sortby === "alphabetical") {
      productsList = await productsCollection
        .find({})
        .sort({ title: 1 })
        .skip(pageNo * 20)
        .limit(20)
        .toArray();
    } else {
      throw "Invalid sortBy";
    }

    if (productsList.length == 0) throw "No Book in system!";

    const result = [];

    for (let product of productsList) {
      let {
        _id,
        title,
        description,
        productImage,
        noOfLikes,
        createdAt,
        stock,
        facet,
      } = product;
      _id = _id.toString();
      result.push({
        _id,
        title,
        description,
        productImage,
        noOfLikes,
        createdAt,
        stock,
        facet,
      });
    }
    return result;
  },
};

module.exports = exportedMethods;
