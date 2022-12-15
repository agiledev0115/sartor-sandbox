const category = require("./category")
const dummy = require('mongoose-dummy');
const ignoredFields = ['_id', 'created_at', '__v', /detail.*_info/];

let randomObject = dummy(category, {
  ignore: ignoredFields,
  returnDate: true
})
console.log(randomObject);
