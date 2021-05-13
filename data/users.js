/*
parameters:-
  "userId": "123-123-123",
  "firstName": "John",
  "lastName": "Doe",
  "dateOfBirth": "12/22/1990",
  "age": "30",
  "phoneNumber": "412-124-1253",
  "emailId": "johnDoE@gmail.com",
  "address":{
  "street":"abcde",
  "city": "NYC",
  "state": "NY",
  "code":"07307"
  }
  "profilePhoto": "/static/xyz.jpeg",
  "password": "Encrypted Password",
  "reviewsId": ["123-311-1233", "333-333-1111"]
*/
// Importing "users" collection from the database and destructuring theObjectId from mongodb

// functions in this file

//addUser() // tested
//getUser() // tested // Error Handling
//getAllUsers() // tested // Error Handling
//addCommentsToUser() //tested // Error Handling
//getUserComments() // tested // Error Handling
//userLikesAProduct() // tested // Error Handling
//getUserLikedProducts() //tested // Error Handling
//userPurchasesAProduct() // tested // Error Handling
//userViewsAProduct() //tested // Error Handling
//getUserViewedProdcuts() //tested // Error Handling
//getUserBoughtProducts()// tested // Error Handling

const mongoCollections = require("../config/mongoCollections");
const users = mongoCollections.users;
let { ObjectId } = require("mongodb");
const bcrypt = require("bcryptjs");
const saltNumber = 14;
const errorHandler = require("../Error/DatabaseErrorHandling");

module.exports = {
  // need to implement if email already exists in the database or not.

  async addUser(firstName, lastName, phoneNumber, emailId, password, address) {
    errorHandler.checkString(firstName, "First Name");
    errorHandler.checkString(lastName, "Last Name");
    errorHandler.checkEmail(emailId, "email ID");
    errorHandler.checkString(password, "Password");
    errorHandler.checkPhoneNumber(phoneNumber);
    errorHandler.checkPassword(password);
    errorHandler.checkAddress(address);

    const hasedPassword = await bcrypt.hash(password, saltNumber);

    let newUser = {
      firstName: firstName,
      lastName: lastName,
      password: hasedPassword,
      userCreatedAt: new Date(),
      mobile: phoneNumber,
      emailId: emailId.toLowerCase(),
      address: address,
      viewHistory: [],
      LikeHistory: [],
      comments: [],
      purchaseHistory: [],
    };
    const addUser = await users();
    const insertedUser = await addUser.insertOne(newUser);
    if (insertedUser.insertedCount === 0) throw "Could not add User.";
    const newUserId = await insertedUser.insertedId.toString();
    const addedUser = await this.getUser(newUserId);
    return addedUser;
  },

  async getUser(userId) {
    errorHandler.checkStringObjectId(userId, "User ID");
    const parsedId = ObjectId(userId);
    const usersCollection = await users();
    const user = await usersCollection.findOne({ _id: parsedId });
    if (user === null) throw "No user found";
    user["_id"] = user["_id"].toString();
    return user;
  },

  async getAllUsers() {
    const usersCollection = await users();
    const allUsers = await usersCollection.find({}).toArray();
    if (allUsers.length === 0 || allUsers.length === undefined) {
      console.log("Users Data is empty");
      return [];
    } else {
      for (let i of allUsers) {
        i._id = i._id.toString();
      }
      return allUsers;
    }
  },

  async addCommentsToUser(userID, commentID) {
    errorHandler.checkStringObjectId(userID, "user ID");
    errorHandler.checkStringObjectId(commentID, "Comment ID");
    const usersCollection = await users();
    const updatedInfo = await usersCollection.updateOne(
      {
        _id: ObjectId(userID),
      },
      {
        $push: {
          comments: ObjectId(commentID),
        },
      }
    );

    if (updatedInfo.updatedCount === 0) throw "Update failed to add a comment!";
  },
  async getUserComments(UserID) {
    errorHandler.checkStringObjectId(UserID, "User ID");
    const commentsData = require("./index").comments;
    const user = await this.getUser(UserID);
    const comments = [];
    for (comment of user.comments) {
      console.log(commentsData);
      comments.push(await commentsData.getComment(comment.toString()));
    }
    return comments;
  },

  async userLikesAProduct(UserID, ProductID) {
    errorHandler.checkStringObjectId(UserID, "User ID");
    errorHandler.checkStringObjectId(ProductID, "Product ID");
    const usersCollection = await users();

    const updatedInfo = await usersCollection.updateOne(
      {
        _id: ObjectId(UserID),
      },
      {
        $push: {
          LikeHistory: ObjectId(ProductID),
        },
      }
    );

    if (updatedInfo.updatedCount === 0)
      throw "Update failed to add like info to user collection!";
  },
  async userDisLikesAProduct(UserID, ProductID) {
    errorHandler.checkStringObjectId(UserID, "User ID");
    errorHandler.checkStringObjectId(ProductID, "Product ID");
    const usersCollection = await users();

    const updatedInfo = await usersCollection.updateOne(
      {
        _id: ObjectId(UserID),
      },
      {
        $pull: {
          LikeHistory: ObjectId(ProductID),
        },
      }
    );

    if (updatedInfo.updatedCount === 0)
      throw "Update failed to add dislike info to user collection!";
  },

  async getUserLikedProducts(UserID) {
    errorHandler.checkStringObjectId(UserID, "User ID");
    const products = require("./index").products;
    const user = await this.getUser(UserID);

    const productsList = [];
    for (productID of user.LikeHistory) {
      productsList.push(await products.getProductById(productID.toString()));
    }
    return productsList;
  },

  async userPurchasesAProduct(UserID, ProductID) {
    errorHandler.checkStringObjectId(UserID, "User ID");
    errorHandler.checkStringObjectId(ProductID, "Product ID");
    const products = require("./index").products;
    const usersCollection = await users();

    const updatedInfo = await usersCollection.updateOne(
      {
        _id: ObjectId(UserID),
      },
      {
        $push: {
          purchaseHistory: ObjectId(ProductID),
        },
      }
    );

    if (updatedInfo.updatedCount === 0)
      throw "Update failed to add purchase info to user collection!";

    await products.updateStockOfProduct(ProductID);
  },

  async userViewsAProduct(UserID, ProductID) {
    errorHandler.checkStringObjectId(UserID, "User ID");
    errorHandler.checkStringObjectId(ProductID, "Product ID");
    const usersCollection = await users();

    const updatedInfo = await usersCollection.updateOne(
      {
        _id: ObjectId(UserID),
      },
      {
        $push: {
          viewHistory: ObjectId(ProductID),
        },
      }
    );

    if (updatedInfo.updatedCount === 0)
      throw "Update failed to add view info to user collection!";
  },

  async getUserViewedProdcuts(UserID) {
    errorHandler.checkStringObjectId(UserID, "User ID");
    const products = require("./index").products;
    const user = await this.getUser(UserID);

    const productsList = [];
    for (productID of user.viewHistory) {
      productsList.push(await products.getProductById(productID.toString()));
    }
    return productsList;
  },

  async getUserBoughtProducts(UserID) {
    errorHandler.checkStringObjectId(UserID, "User ID");
    const products = require("./index").products;
    const user = await this.getUser(UserID);

    const productsList = [];
    for (productID of user.purchaseHistory) {
      productsList.push(await products.getProductById(productID.toString()));
    }
    return productsList;
  },
};
