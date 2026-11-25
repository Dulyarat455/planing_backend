const express = require("express");
const app = express();

const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv  = require("dotenv");

dotenv.config();



const  userController = require('./controllers/UserController')
const  sectionController = require('./controllers/SectionController')
const  groupController = require('./controllers/GroupController')
const  dieController = require('./controllers/DieController')
const  machineController = require('./controllers/MachineController')
const  boardController = require('./controllers/BoardController')



app.use(cors());

//Board fullscreen images
app.get('/api/board/fullscreen-images', boardController.listImages);
app.get('/api/board/fullscreen-image', boardController.getImage);
app.get('/api/board/fullscreen-image/:id', boardController.getImage);
app.post(
    '/api/board/fullscreen-image',
    boardController.authorizeImageChange,
    express.raw({ type: boardController.imageTypes, limit: '10mb', inflate: false }),
    boardController.uploadImage,
    boardController.handleImageUploadError,
);
app.delete('/api/board/fullscreen-image/:id', boardController.authorizeImageChange, boardController.deleteImage);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));



//User
app.post('/api/user/create', (req, res) => userController.create(req,res))
app.post('/api/user/list', (req, res) => userController.list(req,res))
app.post('/api/user/signIn', (req, res) => userController.signIn(req,res))
app.post('/api/user/signInRfId', (req, res) => userController.signInRfId(req,res))


//Section
app.post('/api/section/create', (req, res) => sectionController.create(req,res))
app.get('/api/section/list', (req, res) => sectionController.list(req,res))


//Group
app.post('/api/group/create', (req, res) => groupController.create(req,res))
app.get('/api/group/list', (req, res) => groupController.list(req,res))


//die
app.post('/api/die/create', (req, res) => dieController.create(req,res))
app.get('/api/die/list', (req, res) => dieController.list(req,res))


//machine
app.post('/api/machine/create', (req, res) => machineController.create(req,res))
app.get('/api/machine/list', (req, res) => machineController.list(req,res))




app.listen(3001, () =>{
    console.log("API Server Runing...");
})
