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

//WHAT IS THE ARGUMENT 1 IN exit()?
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

//use findByPk to avoid adding task to non-existing user
//every user's tasks should start from id 1. This is not correct
app.post('/users/:userId/tasks', (req,res,next)=>{
    Task.create(req.body)
        .then(task => res.json(task))
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

app.put('/users/:userId', (req, res, next) => {
    User.findByPk(req.params.userId)
        .then(user => {
            if(user){
                return user.update(req.body)
                    .then(user => res.json(user))
            }else{
                res.status(404).end();
            }
        })
        .catch(next);
})

app.get('/users/:userId/tasks/:taskId', (req, res, next)=>{
    Task.findOne({
        where: {
            id: req.params.taskId,
            userId: req.params.userId
        }
    })
        .then(task => {
            if (task){
                return res.json(task)
            }else{
                return res.status(404).end()
            }
        })
        .catch(next)
})

// Delete a user's task
app.delete('/users/:userId/tasks/:taskId',(req,res,next)=>{
    Task.destroy({
        where: {
            id: req.params.taskId,
            userId: req.params.userId
        }
    })
        .then(task => {
            if(task){
                return res.status(204).end()
            }else{
                return res.status(404).end()
            }
        })
        .catch(next)
})

app.listen(port, () => console.log("listening on port " + port))