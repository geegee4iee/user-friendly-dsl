import React from "react"
import { isAstObject, placeholderAstObject, astReferenceTo, newAstObject } from "../common/ast"
import { TextValue, NumberValue, DropDownValue } from "./value-components"
import { action, observable } from "mobx"
import { observer } from "mobx-react"
import { asClassNameArgument } from "./css-utils"
import { AddNewButton, AstObjectUiWrapper } from "./support-components"

const indefiniteArticleFor = (nextWord) => "a" + ((typeof nextWord === "string" && nextWord.toLowerCase().match(/^[aeiou]/)) ? "n" : "")

export const Projection = observer(({ astObject, ancestors, replaceWith }) => {
    if (isAstObject(astObject)) {
        const { settings } = astObject

        const editStateFor = (propertyName) => observable({
            value: settings[propertyName],
            inEdit: false,
            setValue: (newValue) => { settings[propertyName] = newValue }
        })

        switch (astObject.concept) {
            case "Record Type": return <AstObjectUiWrapper>
                <div>
                    <span className="keyword ws-right">Record Type</span>
                    <span className="value"><TextValue
                        editState={editStateFor("name")} placeholderText="<name>" /></span>
                </div>
                <div className="section">
                    <div><span className="keyword">attributes:</span></div>
                    {
                        settings["attributes"].map((attribute, index) =>
                            <Projection
                                astObject={attribute}
                                ancestors={[astObject, ...ancestors]}
                                key={index}
                                replaceWith={() => {
                                    settings["attributes"].splice(index, 1)
                                }}
                            />)
                    }
                    <AddNewButton buttonText="+ attribute"
                        actionFunction={() => {
                            settings["attributes"].push(newAstObject("Data Attribute"))
                        }} />
                </div>
            </AstObjectUiWrapper>

            case "Data Attribute": return <AstObjectUiWrapper className="attribute"
                astObject={astObject} deleteAstObject={replaceWith}>
                <span className="keyword ws-right">the</span>
                <span className="value"><TextValue
                    editState={editStateFor("name")} placeholderText="<name>" /></span>
                <span className="keyword ws-both">is {indefiniteArticleFor(settings["type"])}</span>
                <span className="value enum-like ws-right"><DropDownValue
                    className="value enum-like ws-right"
                    editState={editStateFor("type")}
                    options={["amount", "date range", "percentage"]}
                    placeholderText="<type>"
                /></span>
                {settings["initial value"] ? <div className="inline">
                    <span className="keyword ws-right">initially</span>
                    {settings["initial value"] === placeholderAstObject
                        ? <DropDownValue
                            editState={observable({
                                inEdit: true,
                                setValue: (newValue) => {
                                    settings["initial value"] = newAstObject(value)
                                }
                            })}
                            options={[
                                "Attribute Reference",
                                "Number"
                            ]}
                            placeholderText="<initial value>"
                            actionText="(choose concept for initial value)"
                        />
                        : <Projection
                            astObject={settings["initial value"]}
                            ancestors={[astObject, ...ancestors]}
                            replaceWith={() => {
                                delete settings["initial value"]
                            }}
                        />
                    }
                </div>
                    : <AddNewButton buttonText="+ initial value"
                        actionFunction={() => {
                            settings["initial value"] = placeholderAstObject
                        }} />
                }

            </AstObjectUiWrapper>

            case "Attribute Reference": {
                const recordType = ancestors.find((ancestor) => ancestor.concept === "Record Type")
                const attributes = recordType.settings["attributes"]
                return <AstObjectUiWrapper className="inline" astObject={astObject} deleteAstObject={replaceWith}>
                    <span className="keyword ws-right">the</span>
                    <DropDownValue
                        editState={observable({
                            value: settings["attribute"] && settings["attribute"].ref.settings["name"],
                            inEdit: false,
                            setValue: (newValue) => {
                                settings["attribute"] = astReferenceTo(
                                    attributes.find((attribute) => attribute.settings["name"] === newValue)
                                )

                            }
                        })}
                        className="reference"
                        options={attributes.map((attribute) => attribute.settings["name"])}
                        actionText="(choose an attribute to reference)"
                        placeholderText="<attribute>"
                    />
                </AstObjectUiWrapper>
            }

            case "Number": {
                const type = parent && parent.concept === "Data Attribute" && parent.settings["type"]
                return <AstObjectUiWrapper className="inline" astObject={astObject} deleteAstObject={replaceWith}>
                    {type === "amount" && <span className="keyword">$</span>}
                    <span className="value"><NumberValue editState={editStateFor("value")} placeholderText="<number>" /></span>
                    {type === "percentage" && <span className="keyword">%</span>}
                </AstObjectUiWrapper>
            }

            default: return
                <div className="inline">
                    <em>{"No projection defined for concept: " + astObject.concept}</em>
                </div>
        }

    }
    return <em>{"No projection defined for value: " + astObject}</em>
})
