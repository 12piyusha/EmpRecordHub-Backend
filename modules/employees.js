var mongoose=require("mongoose");
mongoose.set('strictQuery', true);
mongoose.connect('mongodb://127.0.0.1:27017/mycart',
    {
        useNewUrlParser :true,
        useUnifiedTopology :true,
        // strictQuery: true,
    }
);


var db=mongoose.connection;
var employeeSchema=new mongoose.Schema({
    name :String,
    email:String,
    etype:String,
    hourlyrate:Number,
    totalHour:Number,
    total:Number,
});


employeeSchema.methods.Income=function(){
    this.total=(this.hourlyrate*this.totalHour);
    console.log("Total Income of %s is %d.\n",this.name,this.total);
};

var employeeModel=mongoose.model("Employee",employeeSchema);

var employee1=new employeeModel({
    name:"Piyusha",
    email:"bhadangepiyusha09@gmail.com",
    etype:"hourly",
    hourlyrate:10,
    totalHour:160,
})
var employee2=new employeeModel({
    name:"Kritika",
    email:"dhandekritika16@gmail.com",
    etype:"hourly",
    hourlyrate:8,
    totalHour:150,
})
var employee3=new employeeModel({
    name:"Yash",
    email:"kolheyash21@gmail.com",
    etype:"hourly",
    hourlyrate:20,
    totalHour:130,
})
db.on("connected",function(){
    console.log("Connected to Mongodb Successfully.");
})
db.on("disconnected",function(){
    console.log("Disonnected to Mongodb Successfully.");
})
db.on("error", console.error.bind(console, "connection error"));
db.once("open", function () {
    // employee1.save(function (err, employee1) {
    //   if (err) console.log(err.message);
    //   employee1.Income();
    //   console.log("Data is saved succesfully.");
    // });
    // employee2.save(function (err, employee2) {
    //   if (err) console.log(err.message);
    //   employee2.Income();
    //   console.log("Data is saved succesfully.");
    // });
    // employee3.save(function (err, employee3) {
    //   if (err) console.log(err.message);
    //   employee3.Income();
    //   console.log("Data is saved succesfully.");
    // });
  });
  
module.exports=employeeModel;