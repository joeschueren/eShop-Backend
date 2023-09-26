const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const dotenv = require("dotenv").config();
const stripe = require('stripe')(process.env.STRIPE_KEY);

const saltRounds = 10;


// Sets up app and the ability to contact react app
app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(cors());


// connects to mongodb
mongoose.connect(process.env.MONGO_URL.toString());

// creates mongoose schema
const userSchema = new mongoose.Schema({
    email: String,
    hashedPassword: String
})

// creates user model
const User = mongoose.model("User", userSchema)


// handles the registration of new users and encrypts their data
app.post("/register", function(req, res){
    const email = req.body.email;
    let  auth = false;
    let message ="";

    User.findOne({email: email}).then(function(foundUser){
        if(foundUser){
            message = "Username already taken try another.";
            res.json([auth, message])
        }
        else{
            bcrypt.hash(req.body.password, saltRounds, function(err, hash){
                if(err){
                    console.log(err);
                }
                else{
                    const newUser = new User({
                        email: email,
                        hashedPassword: hash
                    })
                    
                    newUser.save();
        
                    auth = true;

                    res.json([auth, message]);
                
                }})
        }
    
    })


    
});

// Handles logging in a user
app.post("/login", function(req, res){
    const email = req.body.email;
    const password = req.body.password;

    let auth = false;
    let message = "";
    User.findOne({email: email}).then(function(foundUser){
        if(foundUser){
            bcrypt.compare(password, foundUser.hashedPassword, function(err, result){
                if(result){
                    auth = true;
                    res.json([auth, message])
                }
                else{
                    auth = false;
                    message = "Information entered did not match any in our system";
                    res.json([auth, message])
                }
            })
        }
        else{
            message = "Information entered did not match any in our systems";
            res.json([auth, message]);
        }
    })
})
// Set up the inventory for mongoDB
const inventorySchema = {
    id: Number,
    title: String,
    price: Number,
    description: String,
    category: String,
    image: String,
}

const Inventory = mongoose.model("inventory", inventorySchema);

let storeItems = new Map();

Inventory.find().exec().then((docs) => {
    for(let i = 0; i< docs.length; i++){
        storeItems.set(docs[i].id, {priceInCents: docs[i].price*100, name: docs[i].title})
    }
});

// Gets all the items from the inventory and sends them over to server
app.get("/inventory", function(req, res){
    Inventory.find().sort({id: 1})
    .exec()
    .then((docs) =>{
        res.json(docs);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error fetching products');
      });
})

// Uses environment variable to make the add and delete routes more secure
const apiKey = process.env.API_KEY.toString;

// Leaves the server open to being able to add new products
app.post("/add/"+apiKey, function(req, res){
    id = req.body.id;
    title = req.body.title;
    price = req.body.price;
    description = req.body.description;
    category = req.body.category;
    image = req.body.image;

    const newInventory = new Inventory({
        id: id,
        title: title,
        price: price,
        description: description,
        category: category,
        image: image
    })

    newInventory.save();
})

// Leaves the server open to being able to delete old products
app.post("/delete/"+apiKey, function(req, res){
    let title = req.body.title;
    Inventory.findOneAndDelete({title: title}).then((err) => console.log(err))

})

app.post("/checkout", async function(req, res){
    try{
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: req.body.items.map(item => {
            const storeItem = storeItems.get(item.id)
            return{
            price_data:{
                currency: "usd",
                product_data: {
                    name: storeItem.name
                },
                unit_amount: storeItem.priceInCents
            },
            quantity: item.quantity
        }
        }),
        success_url: "https://eshop-three-neon.vercel.app/",
        cancel_url: "https://eshop-three-neon.vercel.app/cart"
    })
    res.json({url: session.url})
    }
    catch(e) {
        res.status(500).json({erroe: e.message})
    }
})

app.listen(5000, function(){
    console.log("Server running on port 5000");
})