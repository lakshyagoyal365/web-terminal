/* eslint-disable react-hooks/exhaustive-deps */
import { Terminal, useTerminal } from '@wterm/react'
import '@wterm/react/css'
import { useState, useEffect, useRef } from 'react'
import { executeCommand } from './terminal/executeCommand'

function App () {
  const { write, ref } = useTerminal()
  const terminalBusy = useRef(false)


  const [cwd, setCwd] = useState('./myFileSys/home/guest')
  const [currentLine, setCurrentLine] = useState('')
  const [history, setHistory] = useState([])
  const [historyIdx, setHistoryIdx] = useState(0)
  const [cursorPos, setCursorPos] = useState(0)

  async function typeText (text, speed = 10) {
    for (const char of text) {
      write(char)
      await new Promise(resolve => setTimeout(resolve, speed))
    }
  }

  function displayPath (path) {
    if (path.startsWith('./myFileSys/home/guest')) {
      return path.replace('./myFileSys/home/guest', '~')
    }

    if (path === './myFileSys') {
      return '/'
    }

    if (path.startsWith('./myFileSys/')) {
      return path.replace('./myFileSys', '')
    }

    return path
  }

  function renderPrompt(newLine=""){
    write('\r') // move cursor to start
      write('\x1b[2K') // clear the entire line
      write(`\x1b[1;33mguest@la-kshya.com:\x1b[34m ${displayPath(cwd)}\x1b[37m $ ${newLine}`)
  }

  //   useEffect(()=>{
  //     const banner =
  // ` /$$                 /$$                 /$$
  // | $$                | $$                | $$
  // | $$        /$$$$$$ | $$   /$$  /$$$$$$$| $$$$$$$  /$$   /$$  /$$$$$$
  // | $$       |____  $$| $$  /$$/ /$$_____/| $$__  $$| $$  | $$ |____  $$
  // | $$        /$$$$$$$| $$$$$$/ |  $$$$$$ | $$  \ $$| $$  | $$  /$$$$$$$
  // | $$       /$$__  $$| $$_  $$  \____  $$| $$  | $$| $$  | $$ /$$__  $$
  // | $$$$$$$$|  $$$$$$$| $$ \  $$ /$$$$$$$/| $$  | $$|  $$$$$$$|  $$$$$$$
  // |________/ \_______/|__/  \__/|_______/ |__/  |__/ \____  $$ \_______/
  //                                                    /$$  | $$
  //                                                   |  $$$$$$/
  //                                                    \______/           `
  // write(banner)
  //   }, [])

  useEffect(() => {
    async function showBanner () {
      terminalBusy.current = true

      const banner = " \x1b[32mType 'help' to see all available commands."
      const prompt = `\r\n\x1b[1;33mguest@la-kshya.com:\x1b[34m ${displayPath(cwd)}\x1b[37m $ `
      await typeText(banner + '\n' + prompt)

      terminalBusy.current = false
    }

    showBanner()
  }, [])

  async function handleData (data) {

    if(terminalBusy.current){
      return
    }

    if (data == '\u0008' || data == '\u007f') {
      //Backspace is pressed
      if(cursorPos==0){
        return
      }
      let newPos = cursorPos-1
      let newLine = currentLine.slice(0,newPos) + currentLine.slice(cursorPos)

      renderPrompt(newLine)

      let moveLeft = newLine.length - newPos
      write(`\x1b[${moveLeft}D`)

      setCursorPos(newPos)
      setCurrentLine(newLine)
      return
    } 
    
    else if (data == '\r') {
      //Enter key is pressed

      terminalBusy.current = true

      const result = await executeCommand(currentLine, cwd)
      if (typeof result == 'object') {
        if (result.output) {
          await typeText(result.output)
        } else if (result.newCwd) {
          let newCwd = result.newCwd
          setCwd(newCwd)
          await typeText('')
        } else {
          await typeText(result)
        }
      } else if (typeof result == 'string') {
        await typeText('\r\n\x1b[22;37m' + result, 15)
      }
      const newHistory = [...history, currentLine]

      setHistory(newHistory)
      setHistoryIdx(newHistory.length)
      setCurrentLine('')
      setCursorPos(0)

      let currentWorkingDir
      if (result.newCwd) {
        currentWorkingDir = result.newCwd
      } else {
        currentWorkingDir = cwd
      }
      const prompt = `\r\n\x1b[1;33mguest@la-kshya.com:\x1b[34m ${displayPath(currentWorkingDir)}\x1b[37m $ `
      await typeText('\n' + prompt)

      terminalBusy.current = false

      return
    } 
    
    else if (data === '\x1b[A') {
      // ↑ Up Arrow
      if(historyIdx==0 || history.length==0){
        return
      }

      let newIdx = historyIdx-1
      let previousCommand = history[newIdx]

      renderPrompt()

      await typeText(previousCommand, 30)
      setHistoryIdx(newIdx)
      setCurrentLine(previousCommand)
      setCursorPos(previousCommand.length)

      return
    } 
    
    else if (data === '\x1b[B') {
      // ↓ Down Arrow
      if(historyIdx>=history.length || history.length==0){
        return
      }
      console.log(historyIdx)

      let newIdx = historyIdx+1

      renderPrompt()
    
      if(newIdx == history.length){
        setHistoryIdx(newIdx)
        renderPrompt()
        setCurrentLine("")
        return
      }

      let nextCommand = history[newIdx]
      await typeText(nextCommand, 30)
      setHistoryIdx(newIdx)
      setCurrentLine(nextCommand)
      setCursorPos(nextCommand.length)

      return
    } 
    
    else if (data === '\x1b[C') {
      // → Right Arrow
      if(cursorPos>=currentLine.length){return}
      setCursorPos(prev=>prev+1)
      write('\x1b[C')
      return
    } 
    
    else if (data === '\x1b[D') {
      // ← Left Arrow
      if(cursorPos==0){return}
      setCursorPos(prev=>prev-1)
      write('\x1b[D')
      return
    }
    else if (data === '\x12') {
      // Ctrl + R
      window.location.reload()
      return
    }

    setCurrentLine(prev => prev + data)
    setCursorPos((prev)=>prev+1)
    write(data)
  }

  return (
    <div className='w-full h-screen bg-zinc-900 py-6 px-2 tracking-tight' onContextMenu={(e)=>e.preventDefault()}>
      <Terminal
        style={{
          '--term-font-size': '21px',
          '--term-row-height': '24px',
          '--term-cursor': '#8f8f72'
        }}
        cursorBlink
        cols={100}
        ref={ref}
        autoFocus
        onData={handleData}
      />
    </div>
  )
}

export default App
