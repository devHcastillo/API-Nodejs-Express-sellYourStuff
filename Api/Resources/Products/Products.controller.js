const ProductModel = require("./Productos.model");

let getProducts = () => {
  return ProductModel.find({});
};

let getProduct = (id) => {
  return ProductModel.findById({ _id: id });
};

let createProduct = (product, dueno) => {
  return new ProductModel({ ...product, dueno }).save();
};

let deleteProduct = (id) => {
  return ProductModel.findByIdAndRemove(id);
};

let updateProduct = (id, product, username) => {
  return ProductModel.findOneAndUpdate(
    { _id: id },
    {
      ...product,
      dueno: username,
    },
    {
      new: true,
    }
  );
};

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  deleteProduct,
  updateProduct,
};
