const app = require("./app");
const mongoose = require("mongoose");

mongoose
  .connect(process.env.DB_HOST, { ignoreUndefined: true })
  .then(() => {
    app.listen(3000, () => {
      console.log("Database connection successful");
    });
  })
  .catch((error) => {
    console.log(error.message);
    process.exit(1);
  });
