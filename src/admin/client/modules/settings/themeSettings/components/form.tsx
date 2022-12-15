import { Button, Paper } from "@material-ui/core"
import sortBy from "lodash/sortBy"
import React, { FC, useEffect } from "react"
import { InjectedFormProps, reduxForm } from "redux-form"
import { messages } from "../../../../lib"
import DynamicEditControl from "./dynamicEditControl"
import style from "./style.module.sass"

interface props {
  handleSubmit
  pristine
  submitting
  initialValues
  reset
  settingsSchema
  onLoad: Function
}

const ThemeSettings: FC<props & InjectedFormProps<{}, props>> = (
  props: props & InjectedFormProps<{}, props>
) => {
  const {
    handleSubmit,
    pristine,
    submitting,
    initialValues,
    reset,
    settingsSchema,
    onLoad,
  } = props

  useEffect(() => {
    onLoad()
  }, [])

  if (initialValues && settingsSchema) {
    let lastSection = null
    const sortedSettingsSchema = sortBy(settingsSchema, ["section", "label"])

    const fields = sortedSettingsSchema.map((item, index) => {
      let sectionTitle = null
      if (item.section !== lastSection) {
        lastSection = item.section
        sectionTitle =
          item.section && item.section !== "" ? (
            <div className={style.sectionTitle}>{item.section}</div>
          ) : null
      }

      return (
        <div key={index}>
          {sectionTitle}
          <DynamicEditControl
            type={item.type}
            fieldName={item.key}
            label={item.label}
            options={item.options}
            properties={item.properties}
          />
        </div>
      )
    })

    return (
      <form
        onSubmit={handleSubmit}
        style={{
          display: "initial",
          width: "100%",
        }}
      >
        <div style={{ margin: 20, color: "rgba(0, 0, 0, 0.52)" }}>
          {messages.themeSettings}
        </div>
        <Paper className="paper-box" elevation={4}>
          <div className={style.innerBox}>{fields}</div>
          <div className="buttons-box">
            <Button
              variant="contained"
              color="primary"
              className={style.button}
              onClick={reset}
              disabled={pristine || submitting}
            >
              {messages.cancel}
            </Button>
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
  } else {
    return null
  }
}

export default reduxForm({
  form: "ThemeSettingsForm",
  enableReinitialize: true,
})(ThemeSettings)
