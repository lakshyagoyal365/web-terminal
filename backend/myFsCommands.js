const fs = require("fs/promises");
const path = require("path")

async function getAllChild(dir){
  try{
    const entries = await fs.readdir(dir);
  return entries.join("   ")
  }
  catch(err){
    console.log(err);
    return ""
  } 
}

async function fileData(file) {
  return await fs.readFile(file, "utf-8")
}

async function ls(dir) {
  try{
    const entries = await fs.readdir(dir);
  const result = await Promise.all(
    entries.map(async (entry)=>{
    const stat = await fs.stat(path.join(dir,entry))
    if(stat.isDirectory()){
      return "\x1b[2;34m" + entry + "\x1b[0m"
    }
    return entry
  }))
  
  return result.join("   ")
  }
  catch(err){
    console.log(err);
    return ""
  }
}

async function dirExists(path) {
  try{
    const stats = await fs.stat(path)
    return  stats.isDirectory()
  }catch(err){
    return 'cd: no such file or directory';
  }
}


module.exports = {fileData, ls, dirExists}