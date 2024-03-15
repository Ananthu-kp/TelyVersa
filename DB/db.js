const mongoose=require("mongoose");

const connect=mongoose.connect("mongodb://ananthukp17:Ananthukp17@ac-qla8qhh-shard-00-00.ttpdct1.mongodb.net:27017,ac-qla8qhh-shard-00-01.ttpdct1.mongodb.net:27017,ac-qla8qhh-shard-00-02.ttpdct1.mongodb.net:27017/TelyVersa?ssl=true&replicaSet=atlas-f7fpfm-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0")

connect.then(()=>console.log("Database Connected"))
    .catch((err)=>console.log(err.message))
    