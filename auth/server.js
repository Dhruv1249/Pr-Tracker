require("dotenv").config();
const app = require("./src/app");
const connectDB= require("./src/config/db");
const PORT = process.env.PORT;

connectDB();

app.listen(PORT, () => {
  console.log("auth services running on port: ", PORT);
});