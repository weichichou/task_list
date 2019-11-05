const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = 5000

const Sequelize = require('sequelize');
const sequelize = new Sequelize('postgres://postgres:secret@localhost:5432/postgres');

const User = sequelize.define('user', {
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    }
  });

  const Task = sequelize.define("task", {
    userId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    description: {
      type: Sequelize.STRING
    },
    completed: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    }
  });

sequelize.sync()
  .then(() => console.log("Tables created successfully"))
  .catch(err => {
    console.error("Unable to create tables, shutting down...", err);
    process.exit(1);
  });

app.use(bodyParser.json())

app.post('/echo', (req, res) => {
    res.json(req.body)
})

app.post('/users',(req,res,next)=>{
    User.create(req.body)
        .then(user => res.json(user))
        .catch(err => next(err))
})

app.get('/users/:userId', (req, res, next)=> {
    User.findByPk(req.params.userId)
        .then(user => {
            if(!user){
                res.status(404).end();
            }else{
                res.json(user);
            }
        })
        //WHY PUT next IN catch HERE?
        .catch(next);
});

app.listen(port, () => console.log("listening on port " + port))