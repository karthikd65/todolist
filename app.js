const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");
const _ = require("lodash");

const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));




mongoose.connect("mongodb://localhost:27017/todolistDB", {useUnifiedTopology: true }, {useNewUrlParser: true });


const itemsSchema = {
  name:String
};
const Item = mongoose.model("Item", itemsSchema);


const item1 = Item(
  {name: "Buy Food"}
);
const item2 = Item(
  {name: "Eat Food"}
);
const item3 = Item(
  {name: "Get Milk"}
);

var defaultItems = [item1, item2, item3];

var customListSchema = {
  name: String,
  items: [itemsSchema]
};
const CustomList = mongoose.model("CustomList", customListSchema);


app.get("/", function(req, res){
  Item.find({}, function(err, foundItems){
    if(foundItems.length===0){
      Item.insertMany(defaultItems, function(err){
        if(err)
        console.log(err);
      });
    res.redirect("/");
    }
  else{
  res.render("week", {listName: "Today", listItems: foundItems});
    }

  })

});



app.post("/", function(req, res){
  let itemName = req.body.itemName;
  let listName = req.body.list;




  const item4 = Item({
    name: itemName
  });

  if(listName === "Today"){
  item4.save();
  res.redirect("/");
  }

  else{
    CustomList.findOne({name:listName}, function(err, foundList){
      foundList.items.push(item4);
      foundList.save();
      res.redirect("/"+listName);
    });
  }

});

app.post("/delete", function(req, res){
  const itemid = req.body.checkbox;
  const listName = req.body.listName;
  if(listName==="Today"){
    Item.findByIdAndRemove(itemid, function(err){
      if(err){
        console.log(err);
      }
    })
    res.redirect("/");
  }
  else{
    CustomList.findOneAndUpdate({name:listName}, {$pull: {items:{_id:itemid}}}, function(err, result){
      if(!err){
        res.redirect("/" + listName);
      }
    })
  }

})

app.get("/:customListName", function(req, res){
  customListName = _.capitalize(req.params.customListName);
  CustomList.findOne({name: customListName}, function(err, result){
    if(!err){
      if(!result){
        const list = new CustomList(
          {name: customListName,
          items: defaultItems}
        );
        list.save();
        res.redirect("/"+customListName);
        // res.render("week", {listName:customListName, listItems: result.items});
      }
      else{
        // console.log("exists!");
        res.render("week", {listName: result.name, listItems: result.items});
      }
    }
  });
});


app.listen(3000);
