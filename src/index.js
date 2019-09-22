require('dotenv').config();

const express = require('express');
require('./db/mongoose.js');

const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');

const app = express();
const port = process.env.PORT || 3000;

// Register middleware function
app.use((req, res, next) => {
  console.log(req.method, req.path);

  next();
});

app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});
