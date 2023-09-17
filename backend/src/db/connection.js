import mongoose from "mongoose";

mongoose.set('debug', true); // Enable Mongoose debugging


export const initConnection = () => {
  mongoose
    // .connect("mongodb://localhost:27017/userPostDB")
    .connect("mongodb+srv://admin:admin@clusterm0.srqbfxy.mongodb.net/TrelloClone") //! Here we specify the name of the online database within the cluster's connection code, if it's not found it will create the database. 2. How does it know the collection to add in or delete from? => it uses the specified in the controller.js file

    .then(() => console.log("BD connected"))
    .catch((err) => console.log(err));
};
