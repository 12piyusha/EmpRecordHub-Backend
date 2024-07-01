var express = require("express");
var router = express.Router();
var empModel = require("../modules/employees");
var uploadModel = require("../modules/upload");
var path=require("path");
var jwt=require("jsonwebtoken");


var multer=require("multer");
var employee = empModel.find({});
var imagedata = uploadModel.find({});



router.use(express.static(__dirname+"./public/"));


if (typeof localStorage === "undefined" || localStorage === null) {
  //npm install node-localstorage
  //npm install jsonwebtoken
  const LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch');
}



var Storage = multer.diskStorage({
// npm install express multer
   destination:"./public/uploads/",
   filename:(req,file,cb)=>{
     cb(null,file.fieldname+"_"+Date.now()+path.extname(file.originalname));
   }
});

var upload=multer({
storage:Storage
}).single('file');


//  middleware function for checking login or not.
function checkLogin(req,res,next){
  var mytoken=localStorage.getItem('mytoken');
  try {
    //it will verify mytoken that we have created when we are go to login page
    jwt.verify(mytoken, 'loginToken');
  } catch(err) {
    res.send("You need to login to access Employee record data.");
  }
  //if login verify then it will pass to next method and display Employee record if its verify.
  next();
}

router.post('/upload',upload,function(req,res,next){

  var imageFile =req.file.filename;
  var success=req.file.filename + " uploaded successfully.";

  var imageDetails=new uploadModel({
    imageName :imageFile,
  })
 
   imageDetails.save(function (err, doc) {
    if (err) {
      console.error("Error saving employee details:", err);
      return res.status(500).send("Internal Server Error");
    }

  uploadModel.find({}, function (err, data) {
      if (err) {
        console.error("Error fetching image records:", err);
        return res.status(500).send("Internal Server Error");
      }
      res.render("upload-file", {
        title: "Upload File",
        records: data,
        success: success
      });
    });
   });
});

router.get("/upload", function (req, res, next) {

  imagedata.exec(function(err,data){
    if(err) throw err;
    res.render("upload-file", { title: "Upload File", records:data,success:"" });
  });
});

router.get("/",checkLogin, function (req, res, next) {
  //here we pass one middleware to check that there is login ornot.if there is login then only it render the employee record page for safety purpose otherwise it will throw error.
  employee.exec(function (err, data) {
    if (err) throw err;

    res.render("index", {
      title: "Employee Records",
      records: data,
      success: "",
    });
  });
});

router.get("/login", function (req, res, next){
  //whenever we goto login page then it will generate the token 
  var token = jwt.sign({ foo: 'bar' }, 'loginToken');
  //it will save the token into the local storage.
  localStorage.setItem('mytoken', token);
  //it will send that message that login ssuccesfully after generating token and saving it to local Storage using pacakage node-localstorage.
  res.send("Login Successfully.");
});

router.get("/logout", function (req, res, next){
  //this will remove mytoken form local Storage.
  localStorage.removeItem('mytoken');
  res.send("Logout Successfully.");

});

//for inserting the Records in the database
router.post("/", function (req, res, next) {
  var empDetails = new empModel({
    name: req.body.name,
    email: req.body.email,
    etype: req.body.etype,
    hourlyrate: req.body.hourlyrate,
    totalHour: req.body.totalHour,
  });
  console.log(empDetails);

  empDetails.save(function (err, res1) {
    if (err) {
      console.error("Error saving employee details:", err);
      return res.status(500).send("Internal Server Error");
    }

    empModel.find({}, function (err, data) {
      if (err) {
        console.error("Error fetching employee records:", err);
        return res.status(500).send("Internal Server Error");
      }

      res.render("index", {
        title: "Employee Records",
        records: data,
        success: " Record Inserted Successfully.",
      });
    });
  });
});

//for filtering the Records in the database based upon name and email
router.post("/search/", function (req, res, next) {
  var fltrName = req.body.filtername;
  var fltremail = req.body.fileremail;

  var filtername = {};

  if (
    fltrName &&
    fltrName.trim() !== "" &&
    fltremail &&
    fltremail.trim() !== ""
  ) {
    filterParameter = { $and: [{ name: fltrName }, { email: fltremail }] };
  } else if (
    fltrName &&
    fltrName.trim() !== "" &&
    (!fltremail || fltremail.trim() === "")
  ) {
    filterParameter = { name: fltrName };
  } else if (
    (!fltrName || fltrName.trim() === "") &&
    fltremail &&
    fltremail.trim() !== ""
  ) {
    filterParameter = { email: fltremail };
  }

  empModel.find(filterParameter).exec(function (err, data) {
    if (err) {
      console.error("Error fetching employee records:", err);
      return res.status(500).send("Internal Server Error");
    }
    res.render("index", {
      title: "Employee Records",
      records: data,
      success: " Record Searched Successfully.",
    });
  });
});

//deleting the record function
router.get("/delete/:id", function (req, res, next) {
  var id = req.params.id;
  empModel.findByIdAndDelete(id).exec(function (err, data) {
    if (err) {
      console.error("Error fetching employee records:", err);
      return res.status(500).send("Internal Server Error");
    }

    empModel.find({}, function (err, data) {
      if (err) {
        console.error("Error fetching employee records:", err);
        return res.status(500).send("Internal Server Error");
      }
      res.render("index", {
        title: "Employee Records",
        records: data,
        success: " Record Deleted Successfully.",
      });
    });
  });
});

//editing or updating  record function
router.get("/edit/:id", function (req, res, next) {
  var id = req.params.id;
  var edit = empModel.findById(id);
  edit.exec(function (err, data) {
    if (err) {
      console.error("Error fetching employee records:", err);
      return res.status(500).send("Internal Server Error");
    }
    res.render("edit", { title: "Edit Employee Record", records: data });
  });
});

router.post("/update/", function (req, res, next) {
  empModel.findByIdAndUpdate(
    req.body.id,
    {
      name: req.body.name,
      email: req.body.email,
      etype: req.body.etype,
      hourlyrate: req.body.hourlyrate,
      totalHour: req.body.totalHour,
    },
    { new: true },
    function (err, updatedData) {
      // Added { new: true } to return the updated document
      if (err) {
        console.error("Error updating employee record:", err);
        return res.status(500).send("Internal Server Error");
      }

      empModel.find({}, function (err, data) {
        if (err) {
          console.error("Error fetching employee records:", err);
          return res.status(500).send("Internal Server Error");
        }
        res.render("index", {
          title: "Employee Records",
          records: data,
          success: " Record Updated Successfully.",
        });
      });
    }
  );
});
module.exports = router;
