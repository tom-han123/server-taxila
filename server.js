const express = require("express");
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require("body-parser");
const dotenv = require("dotenv").config();
const connectdb = require("./config/dbConnection");
const errorhandler = require("./middleware/errorHandler");

connectdb();
const app = express();
app.use(cors());
app.use(morgan('dev'));
app.use('/uploads',express.static('uploads'));
app.use(bodyParser.urlencoded({ extended: true }));

const port = process.env.PORT || 5000;

app.use(express.json());

app.use("/api/user", require("./user/routes/userRoute"));
app.use("/api/tutorial", require("./tutorial/routes/tutoRoutes"));
app.use("/api/review", require("./review/routes/reviewRoutes"));
app.use(errorhandler);


app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });