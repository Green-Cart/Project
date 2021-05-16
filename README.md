CS 546 Web Programming Final Project: Green Cart

Mandatory Steps:

A. Github Link:
1. Pull the code from the main branch or finalversion  branch from the repository.
1. npm install
3. Seed the database using the command: node seed/seed.js or use npm run seed
4. run npm start to start the server.
5. Click on http://localhost:3000 or copy this Local URL in your browser. You will be redirected to the Home Page of our project: Green Cart.
6. # SECRET CODE  for creating/ Signing up admin account is CS546

B. Green Cart: Home Page (http://localhost:3000/)
1. On the navigation bar, you will get few links like Green Cart, Login, Sign Up  and Admin Login. 
2. On clicking on Green Cart,  you will get redirected to the Home Page.
3. On clicking on Login, you will get redirected to the login page with URL:  (http://localhost:3000/users/form)
   3.1  On clicking on Login, you will get redirected to the login page where you can use existing login details or can create new user login. On successful login, you will get redirected to the Home Page where you will get logout, user profile and cart links in the navigation bar.
   
4. On clicking on Sign up, you will get redirected to the Sign Up page of the user with the URL:  (http://localhost:3000/users/signup)
  4.1 On new Sign Up for the user, you will get redirected to the Home Page where you will need to login again.

5. On clicking on Admin Login, you will get Modal Popup to Admin Login with login and signup facility.
  5.1 Here, you can use existing login details to login or do new sign up for admin with secret passcode CS546.
  5.2 On successful admin login, you will get redirected to home where you will need to login again.
  5.3 On successful signup, you will get redirected to the home page with admin logout, user list and inventory links in the navigation bar.

6. In modal, on clicking on Admin Sign up, you will get redirected to the Admin Sign Up page with URL:  (http://localhost:3000/admin/signup)
7. After navigation bar we have search filter which will search for products based on the names provided.
8. Next, we have drop down filter for plants, seeds, fertilizer. On changing the drop down list, you will get respected sub filter which is not mandatory but will further search for products based on certain parameters passed. Else, it will give all the data of a particular list (Ex: if you select plants from dropdown and without sub filter; once you click on filter,  it will give all plants data)
9. Below dropdown we have the products list. In every box, you will get some basic details of a product and view product button. On clicking, you will get redirected to the individual product page with URL:  (http://localhost:3000/products/product/id)


C. Green cart: Single product page 
1. This page works based on logged in users role (Admin/User).
2. If not logged in and clicked on view product from home page, you will get redirected here but cannot like, dislike, comment (review) or add any product to the cart.
3. Same as for, if you are logged in as an admin, you can only view particular products with basic details.
4. If you are logged in as valid user (customer), you can like/dislike, add reviews and add products in your cart.
5. This page has some functionalities:
   5.1 If you click on like, the count will get increased but if you click second time it will get disliked and the count gets subtracted.
   5.2 If you add and submit review, it will get added on the same page in the reviews section.
   5.3 Here, we have 'add to cart' button. On clicking,  your product gets added to the cart and to check your cart you need to click on the cart icon present on top of navigation bar.

D. Green cart: Cart page (http://localhost:3000/cart/)
1. On clicking on the cart icon present on navigation bar of the logged in user, you will get redirected here.
2. Here, you can see products you have added in the cart with user details on top and total price of all products added below the products list.
3. At the bottom, you have confirmation button, on clicking it, you will get an alert message of your purchase done and your product count gets subtracted by 1 of an individual product bought and will get redirect to the home page. 

E. Green cart: User Profile link:  (http://localhost:3000/users/details)
1. When you are logged in as a user, you can see the user profile button on the navigation bar
2. On clicking that, you will get redirected here.
3. You can see products you purchased with likes, comments, and viewed list.

F.Green cart: Admin/UserList link: (http://localhost:3000/users/details)
1. Here, you will get a list of all users with clickable name and email. Once you click on that, you will get redirected to the admin/user details page.
2. One back button is placed  to go back to the previous list page.


G: Green Cart: Admin/ Inventory link: (http://localhost:3000/users/details)
1. Here, you can add products and can on delete products.
2. For adding, you will get a modal with validation. On successful submission, the product will get added to the list.
