import React from "react"
import { action } from "mobx"
import { observer } from "mobx-react"
import { asClassNameArgument } from "./css-utils"

const isMissing = (value) => value === null || value === undefined || value === ""

const inputValueComponent = ({ inputType, isValid }) =>
    observer(({ editState, placeholderText }) =>
        editState.inEdit
            ? <input
                type={inputType}
                defaultValue={editState.value}
                autoFocus={true}
                onBlur={action((event) => {
                    const newValue = event.target.value
                    if (!isValid || isValid(newValue)) {
                        editState.setValue(newValue)
                    }
                    editState.inEdit = false
                })}
                onKeyUp={action((event) => {
                    if (event.key === "Enter") {
                        const newValue = event.target.value
                        if (!isValid || isValid(newValue)) {
                            editState.setValue(newValue)
                            editState.inEdit = false
                        }
                    }
                    if (event.key === "Escape") {
                        editState.inEdit = false
                    }
                })}
                onClick={(event) => {
                    event.stopPropagation()
                }}
            />
            : <DisplayValue className="value" editState={editState} placeholderText={placeholderText} />
    )


export const TextValue = inputValueComponent({ inputType: "text" })

const isNumber = (str) => !isNaN(str) && (str.trim().length > 0)
export const NumberValue = inputValueComponent({ inputType: "number", isValid: isNumber })


export const DropDownValue = observer(({ editState, className, options, placeholderText, actionText }) =>
    editState.inEdit
        ? <select
            autoFocus={true}
            value={editState.value}
            style={{ width: Math.max(...options.map((option) => option.length), actionText && actionText.length) + "ch" }}
            onChange={action((event) => {
                const newValue = event.target.value
                if (newValue !== actionText) {
                    editState.setValue(newValue)
                    editState.inEdit = false
                }
            })}
            onBlur={action((_) => {
                editState.inEdit = false
            })}
            onKeyUp={action((event) => {
                if (event.key === "Escape") {
                    editState.inEdit = false
                }
            })}
            className={className}
        >
            {actionText && <option key={-1} className="action">{actionText}</option>}
            {options.map((option, index) => <option key={index}>{option}</option>)}
        </select>
        : <DisplayValue className={className} editState={editState} placeholderText={placeholderText} />
)

export const DisplayValue = ({ className, editState, placeholderText }) =>
    <span className={asClassNameArgument(className, isMissing(editState.value) && "value-missing")}
        onClick={action((event) => {
            event.stopPropagation()
            editState.inEdit = true
        })}>
        {isMissing(editState.value) ? placeholderText : editState.value}
    </span>