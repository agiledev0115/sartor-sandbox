import { Button, Paper } from "@material-ui/core"
import React from "react"
import { Field, reduxForm } from "redux-form"
import { TextField } from "redux-form-material-ui"
import { messages } from "../../../../lib"
import style from "./style.module.sass"

const validate = values => {
  const errors = {}
  const requiredFields = ["name"]

  requiredFields.forEach(field => {
    if (values && !values[field]) {
      errors[field] = messages.errors_required
    }
  })

  return errors
}

const Form = props => {
  const { handleSubmit, pristine, submitting, isSaving, initialValues } = props

  let statusId = null

  if (initialValues) {
    statusId = initialValues.id
  }

  return (
    <Paper className="paper-box" elevation={4}>
      <form onSubmit={handleSubmit}>
        <div className={style.innerBox}>
          <Field
            name="name"
            component={TextField}
            floatingLabelText={messages.orderStatusName + " *"}
            fullWidth
          />
          <br />
          <Field
            name="description"
            component={TextField}
            floatingLabelText={messages.description}
            fullWidth
            multiLine
            rows={1}
          />
        </div>
        <div className="buttons-box">
          <Button
            variant="contained"
            color="primary"
            className={style.button}
            onClick={props.onCancel}
          >
            {messages.cancel}
          </Button>
          <Button
            variant="contained"
            color="primary"
            type="submit"
            className={style.button}
            disabled={pristine || submitting || isSaving}
          >
            {statusId ? messages.save : messages.add}
          </Button>
        </div>
      </form>
    </Paper>
  )
}

export default reduxForm({
  form: "FormOrderStatus",
  validate,
  enableReinitialize: true,
})(Form)
