const express = require("express");
const router = express.Router();
const data = require("../data");
const bcrypt = require("bcryptjs");
usersData = data.users;
const xss = require("xss");
errorCheck = require("../errorCheck");
dataError = require("../Error/DatabaseErrorHandling");

router.get("/form", async (req, res) => {
  console.log("out of /form");
  if (req.session.user) {
    console.log("into 1st /form");

    return res.redirect("/users/details");
  } else {
    console.log("into 2nd /form");

    return res.render("pages/loginPage", {
      title: "First",
    });
  }
});

router.get("/logout", async (req, res) => {
  try {
    console.log(req.session);

    req.session.destroy();
    console.log(req.session);
    return res.redirect("/");
  } catch (e) {
    console.log(e);
  }
});

router.get("/", async (req, res) => {
  try {
    const usersInfo = await usersData.getAllUsers();
    res.json(usersInfo);
  } catch (error) {
    res.status().json({ message: "No Daata (/)" });
  }
});

// Users Details Pages
router.get("/details", async (req, res) => {
  console.log(req.session.user);

  try {
    if (req.session.user) {
      const userInfo = await usersData.getUser(req.session.user._id);
      console.log("fdsc");
      const userComments = await usersData.getUserComments(
        req.session.user._id
      );
      console.log("rfeds");
      // const userLikes = await usersData.getUserLikedProducts(req.params.id);
      const userViewedProduct = await usersData.getUserViewedProdcuts(
        req.session.user._id
      );
      console.log("fds");
      const userBoughtProducts = await usersData.getUserBoughtProducts(
        req.session.user._id
      );
      console.log("fr");

      return res.render("pages/userDetail", {
        title: "User Info page",
        userInfo: userInfo,
        comments: userComments,
        // likes: userLikes,
        viewdProduct: userViewedProduct,
        purchase: userBoughtProducts,
      });
    } else {
      return res.json({ message: "Not  signedIn" });
    }
  } catch (error) {
    console.log(error);
    res.sendStatus(404);
  }
});


router.get("/user/:id", async (req, res) => {
  try {
    const userInfo = await usersData.getUser(req.params.id);
    res.json(userInfo);
  } catch (error) {
    res.status().json({ message: "No Data (/:id)" });
  }
});

// router.get("/form", async (req, res) => {
//   console.log("out of /form");
//   if (req.session.user) {
//     console.log("into 1st /form");

//     return res.redirect("/users/details");
//   } else {
//     console.log("into 2nd /form");

//     return res.render("pages/loginPage", {
//       title: "First",
//     });
//   }
// });

// router.get("/login", async (req, res) => {
//   if (req.session.user) {
//     return res.redirect("/users/details"); //temporarily    redirect to products route
//   } else {
//     return res.render("pages/loginPage", { title: "Login Page" });
//   }

router.post("/login", async (req, res) => {
  console.log("login");
  if (req.session.user) {
    return res.render("pages/userDetail", { title: "Already In" });
  } else {
    let email = xss(req.body.email.trim());
    const password = xss(req.body.password.trim());
    let userClient;
    console.log("\n\n Email: ", email, "\n\n");
    errors = [];

    if (errorCheck.stringCheck(email) == false)
      errors.push("Invalid user E-mail address.");
    if (errorCheck.stringCheck(password) == false)
      errors.push("Invalid password.");
    email = email.toLowerCase();

    const users = await usersData.getAllUsers();
    for (let i = 0; i < users.length; i++) {
      if (users[i].emailId == email) {
        userClient = users[i];
      }
    }
    console.log("UserClient: ", userClient);
    if (!userClient)
      errors.push("User E-mail address or password does not match.");

    if (errors.length > 0) {
      return res.render("pages/loginPage", {
        title: "No Match found",
        errors: errors,
      });
    }

    let match = await bcrypt.compare(password, userClient.password);
    console.log("Match : ", match);
    console.log("Error: ", errors);
    if (match) {
      req.session.user = userClient;
      console.log(req.session.user);
      // let comp = req.session.previousRoute;
      // if (comp) {
      req.session.previousRoute = "";
      req.session.cartItems = [];
      return res.redirect("/users/details");
      // }
      // return res.redirect("/products");
    } else {
      errors.push("User E-mail address or password does not match");
      return res.render("pages/loginPage", {
        title: "Errors",
        // partial: "login-script",
        errors: errors,
      });
    }
  }
});

router.get("/signup", async (req, res) => {
  if (req.session.user) {
    return res.redirect("/");
  }
  return res.render("pages/signUp");
});

router.post("/signup", async (req, res) => {
  const firstName = xss(req.body.firstName);
  const lastName = xss(req.body.lastName);
  const email = xss(req.body.emailId);
  const password = xss(req.body.password);
  const phoneNumber = xss(req.body.phoneNumber);
  const Line1 = xss(req.body.Line1);
  const Line2 = xss(req.body.Line2);
  const City = xss(req.body.City);
  const State = xss(req.body.State);
  const ZipCode = xss(req.body.ZipCode);

  errors = [];
  if (!errorCheck.stringCheck(firstName))
    // errors.push;
    throw "Invalid FirstName (routes/users)";
  if (!errorCheck.stringCheck(lastName))
    // errors.push;
    throw "Invalid LastName (routes/users)";
  if (!errorCheck.emailValidate(email))
    // errors.push
    throw "Invalid Email (routes/users)";
  if (!errorCheck.validPassword(password))
    // errors.push
    throw "Invalid Password (routes/users)";
  if (!errorCheck.phoneNumberValid(phoneNumber))
    // errors.push
    throw "Invalid PhoneNumber (routes/users)";
  if (!errorCheck.stringCheck(Line1)) throw "Invalid LineOne (routes/users )";

  if (!errorCheck.stringCheck(Line2)) throw "Invalid LineTwo (routes/users )";
  if (!errorCheck.stringCheck(City)) throw "Invalid City (routes/users )";

  if (!errorCheck.stringCheck(State)) throw "Invalid State (routes/users )";
  if (!errorCheck.zipcCodeValid(ZipCode))
    throw "Invalid Zip Code (routes/users )";
  address = {
    Line1: Line1,
    Line2: Line2,
    City: City,
    State: State,
    ZipCode: parseInt(ZipCode),
    Country: "USA",
  };

  dataError.checkAddress(address);
  // Just for woking part I'm throwing JSON error
  if (errors.length > 0) {
    return res.json({ errors: "Erros while adding" });
  }
  try {
    const allUsers = await usersData.getAllUsers();
    let emailUsed;
    allUsers.find((user) => {
      if (user.emailId === email.toLowerCase()) {
        emailUsed = true;
        console.log("adsas");
        return emailUsed;
      } else {
        console.log("nnnn");
        emailUsed = false;
        return emailUsed;
      }
    });

    console.log(emailUsed);
    if (emailUsed == false) {
      const newUser = await usersData.addUser(
        firstName,
        lastName,
        phoneNumber,
        email.toLowerCase(),
        password,
        address
      );
      console.log(newUser);
      // req.seesion.user = newUser;
      //Just for now redirecting to the root route
      // res.redirect("/");

      return res.render("pages/loginPage", {
        title: "signIn Done",
      });
    } else {
      return res.render("pages/signUp", {
        title: "error",
        error: "Email is already used",
      });
    }
  } catch (error) {
    console.log(error);
    return res.json({ message: " error from addUser()" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const userInfo = await usersData.getUser(req.params.id);
    res.json(userInfo);
  } catch (error) {
    res.status().json({ message: "No Data (/:id)" });
  }
});

module.exports = router;
