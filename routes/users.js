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
      authenticated: false,
      adminAuth: req.session.admin ? true : false,
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
  try {
    if (req.session.user) {
      const userInfo = await usersData.getUser(req.session.user._id);

      const userComments = await usersData.getUserComments(
        req.session.user._id
      );
      console.log("rfeds");
      // const userLikes = await usersData.getUserLikedProducts(req.params.id);
      let userViewedProduct = await usersData.getUserViewedProdcuts(
        req.session.user._id
      );
      console.log(userViewedProduct);
      // userViewedProduct = [...new Set(userViewedProduct)];

      const userBoughtProducts = await usersData.getUserBoughtProducts(
        req.session.user._id
      );
      const userLikedProducts = await usersData.getUserLikedProducts(
        req.session.user._id
      );

      return res.render("pages/userDetail", {
        title: "User Info page",
        authenticated: true,
        adminAuth: req.session.admin ? true : false,
        userInfo: userInfo,
        comments: userComments,
        // likes: userLikes,
        viewdProduct: userViewedProduct,
        purchase: userBoughtProducts,
        liked: userLikedProducts,
      });
    } else {
      return res.redirect("/users/form");
    }
  } catch (error) {
    return res.sendStatus(404);
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
    return res.render("pages/userDetail", {
      authenticated: req.session.user ? true : false,
      adminAuth: req.session.admin ? true : false,
      title: "Already In",
    });
  } else {
    let email = xss(req.body.email.trim());
    const password = xss(req.body.password.trim());
    let userClient;
    console.log("\n\n Email: ", email, "\n\n");
    errors = [];

    if (errorCheck.emailValidate(email) == false)
      errors.push("Invalid user E-mail address.");
    if (errorCheck.validPassword(password) == false)
      errors.push("Invalid password.");
    email = email.toLowerCase();

    const users = await usersData.getAllUsers();
    for (let i = 0; i < users.length; i++) {
      if (users[i].emailId == email) {
        userClient = users[i];
      }
    }

    if (!userClient)
      errors.push("User E-mail address or password does not match.");

    if (errors.length > 0) {
      return res.render("pages/loginPage", {
        authenticated: false,
        title: "No Match found",
        errors: errors,
      });
    }

    let match = await bcrypt.compare(password, userClient.password);

    if (match) {
      req.session.user = userClient;
      console.log(req.session.user);

      req.session.cartItems = [];
      return res.redirect("/users/details");

      return res.redirect("/");
    } else {
      errors.push("User E-mail address or password does not match");
      return res.render("pages/loginPage", {
        title: "Errors",
        authenticated: false,
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
  return res.render("pages/signUp", {
    title: "SignUp Page",
    authenticated: false,
    adminAuth: req.session.admin ? true : false,
  });
});

router.post("/signup", async (req, res) => {
  dataSignIn = req.body;
  const firstName = xss(dataSignIn.firstName);
  const lastName = xss(dataSignIn.lastName);
  const email = xss(dataSignIn.emailId);
  const password = xss(dataSignIn.password);
  const phoneNumber = xss(dataSignIn.phoneNumber);
  const Line1 = xss(dataSignIn.Line1);
  const Line2 = xss(dataSignIn.Line2);
  const City = xss(dataSignIn.City);
  const State = xss(dataSignIn.State);
  const ZipCode = xss(dataSignIn.ZipCode);

  errors = [];
  if (!errorCheck.stringCheck(firstName))
    errors.push("Invalid FirstName (routes/users)");
  if (!errorCheck.stringCheck(lastName))
    errors.push("Invalid LastName (routes/users)");
  if (!errorCheck.emailValidate(email))
    errors.push("Invalid Email (routes/users)");
  if (!errorCheck.validPassword(password))
    errors.push("Invalid Password (routes/users)");
  if (!errorCheck.phoneNumberValid(phoneNumber))
    errors.push("Invalid PhoneNumber (routes/users)");
  if (!errorCheck.stringCheck(Line1))
    errors.push("Invalid LineOne (routes/users )");
  if (!errorCheck.stringCheck(Line2))
    errors.push("Invalid LineTwo (routes/users )");
  if (!errorCheck.stringCheck(City))
    errors.push("Invalid City (routes/users )");

  if (!errorCheck.stringCheck(State))
    errors.push("Invalid State routes/users )");
  if (!errorCheck.zipcCodeValid(ZipCode))
    errors.push("Invalid Zip Code (routes/users )");
  address = {
    Line1: Line1,
    Line2: Line2,
    City: City,
    State: State,
    ZipCode: parseInt(ZipCode),
    Country: "USA",
  };
  try {
    dataError.checkAddress(address);
    // Just for woking part I'm throwing JSON error
    if (errors.length > 0) {
      return res.render("pages/signUp", {
        authenticated: false,
        title: "Error SignUp",
        errors: errors,
        dataSignIn: dataSignIn,
      });
    }

    const allUsers = await usersData.getAllUsers();
    let emailUsed = false;
    console.log("Fdscz");
    allUsers.find((user) => {
      if (user.emailId === email.toLowerCase()) {
        emailUsed = true;
        return;
      }
    });

    if (emailUsed == false) {
      const newUser = await usersData.addUser(
        firstName,
        lastName,
        phoneNumber,
        email.toLowerCase(),
        password,
        address
      );

      // req.seesion.user = newUser;
      //Just for now redirecting to the root route
      // res.redirect("/");
      req.session.user = newUser;
      return res.render("pages/loginPage", {
        authenticated: true,
        adminAuth: req.session.admin ? true : false,
        title: "signIn Done",
      });
    } else {
      return res.render("pages/signUp", {
        authenticated: false,
        title: "error",
        error: "Email is already used",
      });
    }
  } catch (error) {
    errors.push(error);
    return res.render("pages/signUp", {
      title: errors[0],
      authenticated: false,
      errors: errors,
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const userInfo = await usersData.getUser(req.params.id);
    return res.json(userInfo);
  } catch (error) {
    return res.status().json({ message: "No Data (/:id)" });
  }
});

module.exports = router;
