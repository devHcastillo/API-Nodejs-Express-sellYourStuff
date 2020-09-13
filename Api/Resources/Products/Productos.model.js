const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    title: {
        type:String,
        required: [true, "Product must have a title"]

    },
    price: {
        type:Number,
        min: 0,
        required: [true, "Product must have a price"]

    },
    moneda: {
        type:String,
        maxlength: 3,
        minlength: 3,
        required: [true, "Product must have a moneda"]

    },
    dueno: {
        type:String,
        required: [true, "Product must have a dueno"]

    }
})

module.exports = mongoose.model('product', productSchema);