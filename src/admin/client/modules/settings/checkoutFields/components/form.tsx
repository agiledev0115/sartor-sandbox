import { Button, Paper } from "@material-ui/core"
import { RadioButton } from "material-ui/RadioButton"
import React, { FC, useEffect } from "react"
import { Field, InjectedFormProps, reduxForm } from "redux-form"
import { RadioButtonGroup, TextField } from "redux-form-material-ui"
import { messages } from "../../../../lib"
import style from "./style.module.sass"

const radioButtonStyle = {
  marginTop: 14,
  marginBottom: 14,
}

interface props {
  handleSubmit
  pristine
  submitting
  onLoad: Function
}

const CheckoutFieldForm: FC<props & InjectedFormProps<{}, props>> = (
  props: props & InjectedFormProps<{}, props>
) => {
  const { handleSubmit, pristine, submitting, onLoad } = props

  useEffect(() => {
    onLoad()
  }, [])

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "initial",
        width: "100%",
      }}
    >
      <Paper className="paper-box" elevation={4}>
        <div className={style.innerBox}>
          <Field
            component={TextField}
            fullWidth
            name="label"
            floatingLabelText={messages.settings_fieldLabel}
          />
          <Field
            component={TextField}
            fullWidth
            name="placeholder"
            floatingLabelText={messages.settings_fieldPlaceholder}
          />
          <div className="blue-title">{messages.settings_fieldStatus}</div>

          <Field name="status" component={RadioButtonGroup}>
            <RadioButton
              value="required"
              label={messages.settings_fieldRequired}
              style={radioButtonStyle}
            />
            <RadioButton
              value="optional"
              label={messages.settings_fieldOptional}
              style={radioButtonStyle}
            />
            <RadioButton
              value="hidden"
              label={messages.settings_fieldHidden}
              style={radioButtonStyle}
            />
          </Field>
        </div>
        <div className="buttons-box">
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
  )
}

export default reduxForm({
  form: "CheckoutFieldForm",
  enableReinitialize: true,
})(CheckoutFieldForm)
