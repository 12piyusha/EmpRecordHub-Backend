const mongoose=require("mongoose");

mongoose.connect('mongodb://127.0.0.1:27017/mycart',{
    useNewUrlParser :true,
    useUnifiedTopology :true,
});

var db=mongoose.connection;

var uploadSchema=new mongoose.Schema({
    imageName :String,
});
var uploadModel=mongoose.model('uploadImage',uploadSchema);

module.exports=uploadModel;