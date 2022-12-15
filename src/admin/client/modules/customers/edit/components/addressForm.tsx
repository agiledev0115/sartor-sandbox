import { Button } from "@material-ui/core"
import React, { FC } from "react"
import { Field, InjectedFormProps, reduxForm } from "redux-form"
import { TextField } from "redux-form-material-ui"
import { messages } from "../../../../lib"
import style from "./style.module.sass"

const validate = values => {
  const errors = {}
  const requiredFields = ["city"]

  requiredFields.map(field => {
    if (values && !values[field]) {
      errors[field] = messages.errors_required
    }
  })

  return errors
}

interface props {
  handleSubmit?
  pristine?
  submitting?
  onCancel?: Function
  onSubmit?: Function
}

const CustomerAddressForm: FC<props & InjectedFormProps<{}, props>> = (
  props: props & InjectedFormProps<{}, props>
) => {
  const { handleSubmit, pristine, submitting, onCancel, onSubmit } = props

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "initial",
        width: "100%",
      }}
    >
      <>
        <Field
          component={TextField}
          fullWidth
          name="full_name"
          floatingLabelText={messages.fullName}
        />
        <Field
          component={TextField}
          fullWidth
          name="company"
          floatingLabelText={messages.company}
        />
        <Field
          component={TextField}
          fullWidth
          name="address1"
          floatingLabelText={messages.address1}
        />
        <Field
          component={TextField}
          fullWidth
          name="address2"
          floatingLabelText={messages.address2}
        />
        <Field
          component={TextField}
          fullWidth
          name="city"
          floatingLabelText={messages.city}
        />
        <Field
          component={TextField}
          fullWidth
          name="state"
          floatingLabelText={messages.state}
        />
        <Field
          component={TextField}
          fullWidth
          name="postal_code"
          floatingLabelText={messages.postal_code}
        />
        <Field
          component={TextField}
          fullWidth
          name="country"
          floatingLabelText={messages.country}
        />
        <Field
          component={TextField}
          fullWidth
          name="phone"
          floatingLabelText={messages.phone}
        />
      </>
      <div className={style.shippingButtons}>
        <Button variant="contained" color="primary" onClick={() => onCancel}>
          {messages.cancel}
        </Button>
        <Button
          variant="contained"
          color="primary"
          type="submit"
          style={{ marginLeft: 12 }}
          disabled={pristine || submitting}
        >
          {messages.save}
        </Button>
      </div>
    </form>
  )
}

export default reduxForm<props, { onCancel?: Function }>({
  form: "CustomerAddressForm",
  validate,
  enableReinitialize: true,
})(CustomerAddressForm)
