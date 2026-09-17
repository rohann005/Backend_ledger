const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
    index : true
  },
 status: {
    type: String,
    enum: {
        values : ["ACTIVE", "INACTIVE","SUSPENDED"],
        message : "status must be either ACTIVE, INACTIVE or SUSPENDED" 
 },
 default: "ACTIVE"
},
currency: {
    type: String,
    required: [true, 'Currency is required'],
    default : "INR"
}
},{ timestamps: true

});

accountSchema.index({ user: 1, status: 1 });
const accountModel = mongoose.model('account', accountSchema);

module.exports = accountModel;