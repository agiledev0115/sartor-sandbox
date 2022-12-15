import { Button, Paper } from "@material-ui/core"
import React from "react"
import { Field, reduxForm } from "redux-form"
import { TextField } from "redux-form-material-ui"
import { api, messages } from "../../../../lib"
import Editor from "../../../shared/editor"
import { CustomToggle } from "../../../shared/form"
import ImageUpload from "../../../shared/imageUpload"
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

const asyncValidate = values => {
  return new Promise<void>((resolve, reject) => {
    if (values.slug && values.slug.length > 0) {
      api.sitemap
        .retrieve({ path: "/" + values.slug })
        .then(({ status, json }) => {
          if (status === 404) {
            resolve()
          } else {
            if (json && !Object.is(json.resource, values.id)) {
              reject({ slug: messages.errors_urlTaken })
            } else {
              resolve()
            }
          }
        })
    } else {
      resolve()
    }
  })
}

const ProductCategoryEditForm = props => {
  const {
    uploadingImage,
    handleSubmit,
    pristine,
    reset,
    submitting,
    onImageUpload,
    onImageDelete,
    isSaving,
    initialValues,
  } = props
  let imageUrl = null
  let categoryId = null

  if (initialValues) {
    categoryId = initialValues.id
    imageUrl = initialValues.image
  }

  if (categoryId) {
    return (
      <Paper className="paper-box" elevation={4}>
        <form onSubmit={handleSubmit}>
          <div className={style.innerBox}>
            <Field
              name="name"
              component={TextField}
              floatingLabelText={messages.productCategories_name + " *"}
              fullWidth={true}
            />
            <div className="field-hint" style={{ marginTop: 40 }}>
              {messages.description}
            </div>
            <Field
              name="description"
              entityId={categoryId}
              component={Editor}
            />
            <div className={style.shortBox}>
              <Field
                name="enabled"
                component={CustomToggle}
                label={messages.enabled}
                className={style.toggle}
              />
              <ImageUpload
                uploading={uploadingImage}
                imageUrl={imageUrl}
                onDelete={onImageDelete}
                onUpload={onImageUpload}
              />
            </div>
            <div className="blue-title">{messages.seo}</div>
            <Field
              name="slug"
              component={TextField}
              floatingLabelText={messages.slug}
              fullWidth={true}
            />
            <p className="field-hint">{messages.help_slug}</p>
            <Field
              name="meta_title"
              component={TextField}
              floatingLabelText={messages.pageTitle}
              fullWidth={true}
            />
            <Field
              name="meta_description"
              component={TextField}
              floatingLabelText={messages.metaDescription}
              fullWidth={true}
            />
          </div>
          <div
            className={
              "buttons-box " +
              (pristine ? "buttons-box-pristine" : "buttons-box-show")
            }
          >
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
              disabled={pristine || submitting || isSaving}
            >
              {messages.save}
            </Button>
          </div>
        </form>
      </Paper>
    )
  } else {
    return null
  }
}

export default reduxForm({
  form: "ProductCategoryEditForm",
  validate,
  asyncValidate,
  asyncBlurFields: ["slug"],
  enableReinitialize: true,
})(ProductCategoryEditForm)
