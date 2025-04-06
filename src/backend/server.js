const { readContents } = require("./storage")  
let contents = readContents() 

const express = require("express")      
const server = express()                   

server.get("/contents", (request, response) => {        
    response.json(contents) 
}) 

// TODO  add PUT code                   #5

// TODO  add static serving code   

const { join } = require("path")
server.use(express.static(join(__dirname, "..", "..", "dist")))

const port = 8080 
server.listen(port, () => {          
    console.log(`Server started on: http://localhost:${port}`) 
})

server.use(express.json({ limit: "1gb" }))
server.put("/contents", (request, response) => { 
    const newContents = request.body 
    writeContents(newContents) 
    contents = newContents 
    response.send() 
})