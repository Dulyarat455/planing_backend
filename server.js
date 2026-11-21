const express = require("express");
const app = express();

const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv  = require("dotenv");

dotenv.config();


const  userController = require('./controllers/UserController')
const  sectionController = require('./controllers/SectionController')
const  groupController = require('./controllers/GroupController')


//User
app.post('/api/user/create', (req, res) => userController.create(req,res))
app.post('/api/user/list', (req, res) => userController.list(req,res))
app.post('/api/user/signIn', (req, res) => userController.signIn(req,res))
app.post('/api/user/signInRfId', (req, res) => userController.signInRfId(req,res))


//Section
app.post('/api/section/create', (req, res) => sectionController.create(req,res))
app.get('/api/group/list', (req, res) => sectionController.list(req,res))


//Group
app.post('/api/group/create', (req, res) => groupController.create(req,res))
app.get('/api/group/create', (req, res) => groupController.list(req,res))






app.listen(3000, () =>{
    console.log("API Server Runing...");
})