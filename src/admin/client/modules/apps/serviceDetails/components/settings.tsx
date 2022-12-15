import { Button, Divider, Paper } from "@material-ui/core"
import React from "react"
import { Field, reduxForm } from "redux-form"
import { TextField } from "redux-form-material-ui"
import { messages } from "../../../../lib"
import { CustomToggle } from "../../../shared/form"
import style from "./style.module.sass"

interface props {
  handleSubmit
  pristine
  submitting
  initialValues
}

const ServiceSettingsForm = (props: props) => {
  const { handleSubmit, pristine, submitting, initialValues } = props
  const fields = Object.keys(initialValues).map((key, index) => {
    const value = initialValues[key]
    return (
      <div key={index}>
        {typeof value === "boolean" && (
          <>
            <Field
              component={CustomToggle}
              name={key}
              fullWidth={false}
              label={key}
              style={{ paddingTop: 16, paddingBottom: 16, width: "auto" }}
            />
            <Divider />
          </>
        )}

        {typeof value === "number" && (
          <Field
            component={TextField}
            fullWidth={true}
            type="number"
            name={key}
            floatingLabelText={key}
          />
        )}

        {typeof value !== "boolean" && typeof value !== "number" && (
          <Field
            component={TextField}
            fullWidth={true}
            name={key}
            floatingLabelText={key}
          />
        )}
      </div>
    )
  })

  return (
    <div style={{ maxWidth: 720, width: "100%" }}>
      <div className="gray-title" style={{ margin: "0 0 15px 20px" }}>
        {messages.drawer_settings}
      </div>
      <form
        onSubmit={handleSubmit}
        style={{
          display: "initial",
          width: "100%",
        }}
      >
        <Paper style={{ margin: "0px 20px" }} elevation={4}>
          <div style={{ padding: "10px 30px 30px 30px" }}>{fields}</div>
          <div
            className="buttons-box"
            style={{ display: pristine ? "none" : "block" }}
          >
            <Button
              variant="contained"
              color="primary"
              type="submit"
              className={style.button}
              disabled={pristine || submitting}
            >
              {messages.save}
            </Button>
          </div>
        </Paper>
      </form>
    </div>
  )
}

export default reduxForm({
  form: "WebStoreServiceSettingsForm",
  enableReinitialize: true,
})(ServiceSettingsForm)
