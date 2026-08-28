async function fetchDirChilds(dir) {
    const response = await fetch(`/ls?dir=${encodeURIComponent(dir)}`)
    return response.text()
}

async function fetchFileData(file) {
    const response = await fetch(`/cat?file=${encodeURIComponent(file)}`)
    return response.text()
}

async function checkDir(dir) {
    const response = await fetch(`/isDir?dir=${encodeURIComponent(dir)}`)
    return response.text()
}

function resolvePath(target, cwd){
    let newPath;
    if(target == ".."){
        const parts = cwd.split("/")
        if(parts.length>2){
            parts.pop()
        }
        newPath = parts.join("/")
    }
    else if(!target){
        newPath = cwd
    }
    else if(target=="."){
        newPath = cwd
    }
    else if(target=="/"){
        newPath = './myFileSys'
    }
    else if(target.startsWith("/")){
        newPath = target.replace("/", "./myFileSys/")
    }
    else if(target.startsWith("~")){
        newPath = target.replace("~", "./myFileSys/home/guest")
    }
    else if(!target.startsWith("./")){
        newPath = `${cwd}/${target}`
    }
    else{
        newPath = target
    }
    return newPath
}


export const commands = {
    help: {
        description: "Show available commands",
        execute: (args) => {
            if (args != '') {
                return "help: command doesn't expects any arguments"
            }
            const list = [
                "",
                ...Object.entries(commands).map(([name, cmd]) => ` ${name.padEnd(20)} ${cmd.description}`),
                ""
            ].join("\r\n")
            return list
        }
    },

    echo: {
        description: "Print text",
        execute: (args) => {
            return args.map(arg => arg.replace(/^['"]|['"]$/g, "")).join(" ")
        }
    },

    ls: {
        description: "List files",
        execute: async (args, cwd) => {
            // (!args[0] ) ? cwd : args[0]
            const dir = resolvePath(args[0], cwd);
            let childs = await fetchDirChilds(dir);
            return childs
         }
    },

    cd: {
        description: "Change directory",
        execute: async (args, cwd) => { 
            const dir = resolvePath(args[0], cwd);
            let isDir = await checkDir(dir)
            if(isDir == 'true' || isDir == true){
                return {newCwd: dir}
            }
            else{
                return "cd: no such file or directory"
            }
        }
    },

    clear: {
        description: "Clear the terminal",
        execute: () => {
            return { output: "\x1b[2J\x1b[3J\x1b[H" };
        }
    },

    pwd: {
        description: "Show current directory",
        execute: (args, cwd) => {
            let newCwd;
            if(cwd.startsWith("./myFileSys")){newCwd = cwd.replace("./myFileSys", "")}
            else{newCwd=cwd}
            return newCwd;
        }
    },

    cat: {
        description: "Prints the contents of a file",
        execute: async (args, cwd) => {
            const results = await Promise.all(
                args.map(arg => fetchFileData(cwd + arg))
            )

            return results.join("\r\n\n")
        }
    }
}