import mongoose, { model, Schema } from "mongoose";
import { mongoDbUrl } from "./config.js";

mongoose.connect(mongoDbUrl)

const UserSchema = new Schema({
    username: {type: String, unique: true},
    password: {type: String} 
})

export const UserModel = model("Users", UserSchema);

const ContentSchema = new Schema({
    title: String,
    link: String,
    tags: [{type: mongoose.Types.ObjectId, ref: "Tag"}],
    userId: {type: mongoose.Types.ObjectId, ref: "Users", required: true}
})

export const ContentModel = model("Content", ContentSchema);