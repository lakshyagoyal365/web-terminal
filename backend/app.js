const express = require("express")
const cors = require("cors")
const {fileData, ls, dirExists} = require("./myFsCommands")

const app = express()

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// app.get("/ls/*dir",async (req, res)=>{
//   let dir = req.params.dir[0]
//     if(dir==""){dir = "./"}
//     console.log(dir)
//   try {
//     let data = await ls(dir);
//     res.send(data)
//   }
//   catch(err){
//     console.log(err)
//   }
// })

// app.get("/ls",async (req, res)=>{
//   let dir = req.query.path
//     if(dir==""){dir = "./"}
//     console.log(dir)
//   try {
//     let data = await ls(dir);
//     res.send(data)
//   }
//   catch(err){
//     res.send(err)
//     console.log(err)
//   }
// })

app.get("/cat",async (req, res)=>{
  try {
    const data = await fileData(req.query.file)
    res.send(data)
  } catch (err) {
    console.error(err)
    res.status(404).send("File not found")
  }
})

app.get("/ls",async (req, res)=>{
  try {
    const data = await ls(req.query.dir)
    res.send(data)
  } catch (err) {
    console.error(err)
    res.status(404).send("Dir not found")
  }
})

app.get("/isDir",async (req, res)=>{
  console.log(req.params.dir)
  try {
    const data = await dirExists(req.query.dir)
    res.send(data)
  } catch (err) {
    console.error(err)
    res.status(404).send("Dir not found")
  }
})

// app.get("/getAllChild/*dir",async (req, res)=>{
//   let dir = req.params.dir[0]
//     if(dir==""){dir = "./"}
//     console.log(dir)
//   try {
//     let data = await getAllChild(dir);
//     res.send(data)
//   }
//   catch(err){
//     console.log(err)
//   }
// })

// app.get("/fileData/*file",async (req, res)=>{
//   try {
//     let data = await getAllChild(req.params.file[0]);
//     res.send(data)
//   }
//   catch(err){
//     console.log(err)
//   }
// })

let port = 3000;
app.listen(port,()=>{
  console.log(`listening to the port ${port}`)
})