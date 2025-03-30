import React from "react"
import { isAstObject } from "../common/ast"
import { TextValue, NumberValue, DropDownValue } from "./value-components"
import { observable } from "mobx"
import { observer } from "mobx-react"

const indefiniteArticleFor = (nextWorld) => "a" + (nextWorld.toLowerCase().match(/^[aeiou]/) ? "n" : "")

export const Projection = observer(({ astObject, ancestors }) => {
    if (isAstObject(astObject)) {
        const { settings } = astObject

        const editStateFor = (propertyName) => observable({
            value: settings[propertyName],
            inEdit: false,
            setValue: (newValue) => { settings[propertyName] = newValue }
        })

        switch (astObject.concept) {
            case "Record Type": return <div>
                <div>
                    <span className="keyword ws-right">Record Type</span>
                    <span className="value"><TextValue
                        editState={editStateFor("name")} /></span>
                </div>
                <div className="section">
                    <div><span className="keyword">attributes:</span></div>
                    {
                        settings["attributes"].map((attribute, index) => <Projection astObject={attribute} ancestors={[astObject, ...ancestors]} key={index} />)
                    }
                </div>
            </div>

            case "Data Attribute": return <div className="attribute">
                <span className="keyword ws-right">the</span>
                <span className="value">{settings["name"]}</span>
                <span className="keyword ws-both">is {indefiniteArticleFor(settings["type"])}</span>
                <span className="value enum-like ws-right"><DropDownValue
                    className="value enum-like ws-right"
                    editState={editStateFor("type")}
                    options={["amount", "date range", "percentage"]}
                /></span>
                {settings["initial value"] &&
                    <div className="inline">
                        <span className="keyword ws-right"> initially</span>
                        <Projection
                            astObject={settings["initial value"]}
                            ancestors={[astObject, ...ancestors]}
                        />
                    </div>}
            </div>

            case "Attribute Reference": {
                const recordType = ancestors.find((ancestor) => ancestor.concept === "Record Type")

                const attributes = recordType.settings["attributes"]
                return <div className="inline">
                    <span className="keyword ws-right">the</span>
                    <DropDownValue
                        editState={observable({
                            value: settings["attribute"].ref.settings["name"],
                            inEdit: false,
                            setValue: (newValue) => {
                                settings["attribute"].ref =
                                    attributes.find((attribute) =>
                                        attribute.settings["name"] === newValue)
                            }
                        })}
                        className="reference"
                        options={attributes.map(
                            (attribute) => attribute.settings["name"])}
                    />
                </div>
            }

            case "Number": {
                const type = parent && parent.concept === "Data Attribute" && parent.settings["type"]
                return <div className="inline">
                    {type === "amount" && <span className="keyword">$</span>}
                    <span className="value"><NumberValue editState={editStateFor("value")} /></span>
                    {type === "percentage" && <span className="keyword">%</span>}
                </div>
            }

            default: return
                <div className="inline">
                    <em>{"No projection defined for concept: " + astObject.concept}</em>
                </div>
        }

    }
    return <em>{"No projection defined for value: " + astObject}</em>
})