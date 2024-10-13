import mongoose from "mongoose";
import 'dotenv/config';
const uri = process.env.MONGO_URL;

mongoose.connect(uri).then(() => { 
    console.log("connection successful");
}).catch((e) => {
    console.log("No connection" + e);
});

