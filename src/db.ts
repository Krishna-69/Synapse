import mongoose, { model, Schema } from "mongoose";

mongoose.connect("mongodb+srv://admin:admin%40123@cluster0.fnkgnnt.mongodb.net/Synapse")

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