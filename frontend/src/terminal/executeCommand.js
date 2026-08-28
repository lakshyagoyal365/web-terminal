import { commands } from "./command";
import {parseCommand} from "./parseCommand";

export async function executeCommand(input, cwd){
    const {command, args} = parseCommand(input);
    const cmd = commands[command];
    if(!cmd){
        return `${command} : Command not found `
    }
    const newArgs = (args||[]).map((arg)=>{
        if(arg=="~"){return "./myFileSys/home/guest"};
        if(arg=="root" || arg=="./"){return "./myFileSys"};
        return arg
    })
    if(cwd.startsWith("~")){cwd = cwd.replace('~',"./myFileSys/home/guest")};
    if(cwd.startsWith("root")|| cwd.startsWith("/")){cwd = cwd.replace('/',"./myFileSys/")};

    return await cmd.execute(newArgs, cwd);
}