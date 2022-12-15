import { Button, Paper } from "@material-ui/core"
import { Add } from "@material-ui/icons"
import FloatingActionButton from "material-ui/FloatingActionButton"
import React from "react"
import { messages } from "../../../../lib"
import DynamicEditControl from "./dynamicEditControl"
import style from "./style.module.sass"

interface props {
  label
  properties
  fields
}

const ArrayEditor = (props: props) => {
  const { label, properties, fields } = props
  return (
    <>
      <div className={style.arrayTitle}>
        {label}
        <FloatingActionButton
          mini={true}
          secondary={true}
          onClick={() => fields.push({})}
          style={{ marginLeft: "20px" }}
        >
          <Add />
        </FloatingActionButton>
      </div>

      <ol style={{ listStyle: "none" }}>
        {fields.map((field, index) => (
          <li key={index}>
            <Paper
              style={{ margin: "20px 0 20px 20px", backgroundColor: "#f7f7f7" }}
              elevation={4}
            >
              <div className={style.arrayItemHead}>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => fields.remove(index)}
                >
                  {messages.actions_delete}
                </Button>

                {index > 0 && (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => fields.move(index, index - 1)}
                  >
                    {messages.actions_moveUp}
                  </Button>
                )}

                {index + 1 < fields.length && (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => fields.move(index, index + 1)}
                  >
                    {messages.actions_moveDown}
                  </Button>
                )}
              </div>

              <div className={style.arrayInnerBox}>
                {properties.map((property, propertyIndex) => {
                  const fieldName = `${field}.${property.key}`
                  return (
                    <DynamicEditControl
                      key={propertyIndex}
                      type={property.type}
                      fieldName={fieldName}
                      label={property.label}
                      options={property.options}
                      properties={property.properties}
                    />
                  )
                })}
              </div>
            </Paper>
          </li>
        ))}
      </ol>
    </>
  )
}

export default ArrayEditor
