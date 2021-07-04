const express = require("express");
const https = require("https");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require('lodash');
//const date = require(__dirname + "/date.js");

const app = express();

mongoose.set('useFindAndModify', false);

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.static("public"));


mongoose.connect("mongodb+srv://Admin-Francois:Imagine1@@cluster0.ootzv.mongodb.net/todolistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const itemsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "No name entered"]
  }
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "This your todolist!"
});

const item2 = new Item({
  name: "Hit the + button to add a new item."
});

const item3 = new Item({
  name: "<-- Hit to delete an item."
});

const defaultItems = [item1, item2, item3];
//const day = date.getDate();

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

  Item.find({}, function(err, founditems) {

    if (founditems.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Inserted 3 default records - Successfully");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {
        listTitle: "Today",
        //listTitle: day,
        newListItems: founditems
      });
    }
    //  mongoose.connection.close();
  });

});

app.get("/:customListName", function(req, res) {
const customListName = _.upperFirst(req.params.customListName);
List.findOne({name: customListName}, function(err, foundlist){
  if(!err){
    if(!foundlist){
      const list = new List({
        name: customListName,
        items: defaultItems
      });
      list.save();
      res.redirect("/" + customListName);
  }else{
    res.render("list", {
      listTitle: foundlist.name,
      //listTitle: day,
      newListItems: foundlist.items
    });
  }
}
});

});

app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

if(listName === "Today"){
  item.save();
  res.redirect("/");
}else{
  List.findOne({name: listName}, function(err, foundlist){
    foundlist.items.push(item);
    foundlist.save();
    res.redirect("/" + listName);
  });
}
});

app.post("/delete", function(req, res){
 const checkedItemId = req.body.checkbox;
 const listName = req.body.listName;

if(listName === "Today"){
  Item.findByIdAndRemove({_id: checkedItemId}, function(err){
    if(err){
      console.log(err);
    }else{
      res.redirect("/");
    }
  });
}else{
  List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
    if(!err){
      res.redirect("/" + listName);
    }
  });
}
});
//findOneAndUpdate
//create a new page using the same list.ejs functionality
// app.get("/work", function(req, res) {
//   res.render("list", {
//     listTitle: "Work List",
//     newListItems: workItems
//   });
// });

app.get("/about", function(req, res) {
  res.render("about");
});

app.listen(process.env.PORT || 3000, function() {
  console.log("Server started");
});
