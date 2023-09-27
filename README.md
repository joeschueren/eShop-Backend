# eShop Backend API

eShop is an ecommerce website that displays products from the eShop inventory. It has a user-friendly cart system that allows users to collect items they want to purchase. The site has user authentication and account creation. Users can checkout securely anytime with the site stripe integration.

# About

The eShop Backend API is an integral part of the eShop ecommerce platform. It powers essential backend functionality, including user authentication, product data retrieval, and secure payment processing through Stripe.

## Features

- Pulls inventory stored in MongoDB Database using mongoose and sends to Frontend
- Allows user to sign in, sign out, and register from the frontend
- Encrypts user's data to securely authenticate
- Accepts requests for users to checkout and generates a secure URL for the user
- Allows items to be added or removed from the inventory


## eShop Live Demo and Frontend

The live demo of eShop is available here: https://eshop-three-neon.vercel.app

The repository for the frontend of eShop is available here: https://github.com/joeschueren/eShop-Frontend