import React from "react"
import { createRoot } from "react-dom/client"
import { observable, action } from "mobx"

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
     state.ast = json
}))

createRoot(document.getElementById("root"))
     .render(
          <Projection
               astObject={observable(rental)}
               ancestors={[]} />
     )