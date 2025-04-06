import React from "react"
import { createRoot } from "react-dom/client"
import { observable, action } from "mobx"
import { deserializeObservably } from "../common/ast"

require("./styling.css")

import rental from "../ch03/rental-AST"
import { Projection } from "./projection"

const apiUrl = "http://localhost:8080/contents"

const state = observable({
     ast: null
})

fetch(apiUrl)
.then((response) => response.json())
.then(action((json) => {
     state.ast = deserializeObservably(json)
}))

import { observer } from "mobx-react" 

const save = (_) => {
     fetch(apiUrl, {
         method: "PUT",
         headers: {
             "Content-Type": "application/json"
         },
         body: JSON.stringify(serialize(state.ast)) 
     })
 }

const App = observer(({ state }) =>
    state.ast                
        ? 
        <div>
          <button className="save" onClick={save}>Save</button>
          <Projection
        astObject={state.ast}  
        ancestors={[]}
    /></div>
        : <div className="spinner"></div>
)

createRoot(document.getElementById("root"))
    .render(
        <App state={state} />
    )