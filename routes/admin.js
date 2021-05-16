const express = require("express");
const router = express.Router();
const data = require("../data");
const adminData = data.admin;
const productsData = data.products;
const usersData = data.users;
const bcrypt = require("bcryptjs");
const errorCheck = require("../errorCheck");
const xss = require("xss");

dataError = require("../Error/DatabaseErrorHandling");

router.get("/", async (req, res) => {
  if (!req.session.admin) {
    return res.redirect("/");
  }
  try {
    let productList = await adminData.getAdmin(req.session.admin._id);
    productList = productList.addedProducts;

    const products = [];
    for (i of productList) {
      i = i.toString();

      try {
        products.push(await productsData.getProductById(i));
      } catch (e) {
        if (e == 4000) {
          continue;
        } else {
          throw "fatel error";
        }
      }
    }

    let hasProduct = false;

    if (productList.length > 0) {
      hasProduct = true;
    }
    return res.render("pages/admin", {
      adminAuth: req.session.admin ? true : false,
      title: "All Product List",
      productList: products,
      hasProduct: hasProduct,
    });
  } catch (e) {
    console.log(e);
    return res.sendStatus(400);
  }
});
router.get("/users/:id", async (req, res) => {
  console.log(req.session.admin);
  errors = [];
  if (!req.session.admin) {
    return res.render("pages/home", {
      title: "Admin Access Only",
      partial: "getProductTypes",
    });
  }
  try {
    userInfo = await usersData.getUser(req.params.id);
    console.log(userInfo);

    if (userInfo) {
      return res.render("pages/userInfo", {
        title: "User Information",
        userInfo: userInfo,
        adminAuth: req.session.admin ? true : false,
      });
    }
  } catch (error) {
    errors.push(error);
    return res.render("pages/home", {
      title: "Admin Access Only",
      adminErrors: errors,
      adminAuth: req.session.admin ? true : false,
      partial: "getProductTypes",
    });
  }
});

/////////////////////////////////
router.get("/signup", async (req, res) => {
  if (req.session.admin) {
    return res.redirect("/");
  } else {
    return res.render("pages/adminSignup", {
      title: "New adminSignup",
      adminAuth: req.session.admin ? true : false,
    });
  }
});
////////////////////////////////

router.post("/signup", async (req, res) => {
  // if (req.session.admin) {
  //   res.redirect("/admin");
  // } else {
  //   firstName = xss(req.body.adminFirstName);
  //   lastName = xss(req.body.adminLastName);
  //   adminId = xss(req.body.adminId);
  //   adminPassword = xss(req.body.adminSignUpPassword);
  //   secretPasscode = xss(req.body.secretPasscode);
  //   errors = [];
  //   if (!errorCheck.stringCheck(firstName)) errors.push("Invalid First Name");
  //   if (!errorCheck.stringCheck(lastName)) errors.push("Invalid Last Name");
  //   if (!errorCheck.emailValidate(adminId)) errors.push("Invalid Admin Id");
  //   if (!errorCheck.validPassword(adminPassword))
  //     errors.push(
  //       "Invalid Admin Password. there should be atleast 8 characters"
  //     );

  //   if (!errorCheck.stringCheck(secretPasscode))
  //     errors.push("Invalid Passcode");
  //   if (!(secretPasscode == "CS546")) errors.push("Invalid Passcode");
  //   if (errors.length > 0) {
  //     return res.render("pages/adminError", {
  //       title: "error page",
  //       errors: errors,
  //     });
  //   }
  // }
  try {
    if (req.session.admin) {
      return res.redirect("/admin");
    } else {
      firstName = xss(req.body.adminFirstName);
      lastName = xss(req.body.adminLastName);
      adminId = xss(req.body.adminId);
      adminPassword = xss(req.body.adminSignUpPassword);
      secretPasscode = xss(req.body.secretPasscode);
      errors = [];
      if (!errorCheck.stringCheck(firstName)) errors.push("Invalid First Name");
      if (!errorCheck.stringCheck(lastName)) errors.push("Invalid Last Name");
      if (!errorCheck.emailValidate(adminId)) errors.push("Invalid Admin Id");
      if (!errorCheck.validPassword(adminPassword))
        errors.push("Invalid Admin Password");

      if (!errorCheck.stringCheck(secretPasscode))
        errors.push("Invalid Passcode");
      if (!(secretPasscode == "CS546")) errors.push("Invalid Passcode");
      if (errors.length > 0) {
        return res.render("pages/adminError", {
          title: "error page",
          errors: errors,
        });
      }

      const allAdmin = await adminData.getAllAdmins();
      let emailUsed = false;
      allAdmin.find((element) => {
        if (element.emailID == adminId.toLowerCase()) {
          emailUsed = true;
          errors.push("Email already used");
          return;
        }
      });
      if (emailUsed == false) {
        const newAdmin = await adminData.addAdmin(
          firstName,
          lastName,
          adminPassword,
          adminId.toLowerCase()
        );
        //req.session.admin = newAdmin;
        return res.redirect("/");
      } else {
        return res.render("pages/adminError", {
          title: "error page",
          errors: errors,
        });
      }
    }
  } catch (error) {
    console.log("admin/signup :", error);
    res.redirect("/");
  }
});
// //////////////////////////////

router.post("/adminLogin", async (req, res) => {
  try {
    if (req.session.admin) {
      return res.redirect("/admin");
    }

    let adminUser;

    let adminEmail = xss(req.body.adminEmail.trim());
    let adminPassword = xss(req.body.adminPassword.trim());
    errors = [];
    if (errorCheck.emailValidate(adminEmail) == false)
      errors.push("Invalid user E-mail");
    if (errorCheck.validPassword(adminPassword) == false)
      errors.push("Inavlid Password!!");
    adminEmail = adminEmail.toLowerCase();
    const allAdmin = await adminData.getAllAdmins();
    for (i = 0; i < allAdmin.length; i++) {
      if (allAdmin[i].emailID == adminEmail) {
        adminUser = allAdmin[i];
      }
    }

    if (!adminUser)
      errors.push("Admin's Email Address or Password does not match");

    if (errors.length > 0) {
      return res.render("pages/adminError", {
        title: "error page",
        errors: errors,
      });
    }

    let matchPass = bcrypt.compareSync(adminPassword, adminUser.password);

    if (matchPass) {
      req.session.admin = adminUser;
      console.log(req.session.admin);

      return res.redirect("/");
    } else {
      errors.push("Admins's Email or password does not match");
      return res.render("pages/adminError", {
        title: "error page",
        errors: errors,
      });
    }
  } catch (error) {
    errors.push(error);
    return res.render("pages/adminError", {
      title: "error page",
      errors: errors,
    });
  }
});
////////////////////////////////////////////////////////////////
//admin logout

router.get("/logout", async (req, res) => {
  try {
    if (req.session.admin) {
      req.session.destroy();
      res.redirect("/");
    }
  } catch (error) {
    console.log(error);
  }
});

/////////////////////////////////
//Users userInfo

router.get("/users", async (req, res) => {
  if (!req.session.admin) {
    return res.redirect("/");
  }
  try {
    errors = [];
    usersDetails = await usersData.getAllUsers();
    if (usersDetails.length > 0) {
      hasUsers = true;
      return res.render("pages/usersList", {
        title: "Users List",
        users: usersDetails,
        hasUsers: hasUsers,
        adminAuth: req.session.admin ? true : false,
      });
    }
  } catch (error) {
    errors.push(error);
    return res.render("pages/home", {
      title: "Admin Access Only",
      errors: errors,
      adminAuth: req.session.admin ? true : false,
      partial: "getProductTypes",
    });
  }
});
////////////////////////////////

module.exports = router;
