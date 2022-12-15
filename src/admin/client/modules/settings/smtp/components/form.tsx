import { Button, Paper } from "@material-ui/core"
import React, { FC, useEffect } from "react"
import { Field, InjectedFormProps, reduxForm } from "redux-form"
import { TextField } from "redux-form-material-ui"
import { messages } from "../../../../lib"
import style from "./style.module.sass"

interface props {
  handleSubmit
  pristine
  submitting
  onLoad: Function
}

const EmailSettings: FC<props & InjectedFormProps<{}, props>> = (
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
            name="host"
            hintText="smtp.server.com"
            floatingLabelText={messages.settings_smtpHost}
          />
          <Field
            component={TextField}
            fullWidth
            name="port"
            type="number"
            hintText="465"
            floatingLabelText={messages.settings_smtpPort}
          />
          <Field
            component={TextField}
            fullWidth
            name="user"
            floatingLabelText={messages.settings_smtpUser}
          />
          <Field
            component={TextField}
            fullWidth
            name="pass"
            type="password"
            floatingLabelText={messages.settings_smtpPass}
          />
          <Field
            component={TextField}
            fullWidth
            name="from_name"
            floatingLabelText={messages.settings_emailFromName}
          />
          <Field
            component={TextField}
            fullWidth
            name="from_address"
            type="email"
            floatingLabelText={messages.settings_emailFromAddress}
          />
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
  form: "EmailSettingsForm",
  enableReinitialize: false,
})(EmailSettings)
