const errorHandler = require("./DatabaseErrorHandling");

// const facet = [
//   { property: "product_type", value: "plant" },
//   { property: "color", value: "green" },
// ];

// errorHandler.checkFacet(facet);

const properies = {
  product_type: "plant",
  color: "green",
};
errorHandler.checkFilterProperties(properies);

// const propertiesType = [
//   { name: "product_type", type: "string" },
//   { name: "color", type: "number" },
// ];

// errorHandler.checkPropertiesOfProduct(propertiesType);

// const address = {
//   Line1: "332 Webster Ave",
//   Line2: "Apt #2L",
//   City: "8",
//   State: "New Jersey",
//   Country: "USA",
//   ZipCode: 79980,
// };

// errorHandler.checkAddress(address);

// const property = { name: "weight in lbs", type: "number" };

// errorHandler.checkFilterProperties(property);
