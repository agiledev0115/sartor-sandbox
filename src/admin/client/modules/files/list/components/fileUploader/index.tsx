// @ts-nocheck
import { Button } from "@material-ui/core"
import Snackbar from "material-ui/Snackbar"
import React from "react"
import Dropzone from "react-dropzone"
import { messages } from "../../../../../lib"
import style from "./style.module.sass"

interface props {
  uploading
  onUpload
}

class MultiUploader extends React.Component<props> {
  onDrop = files => {
    let form = new FormData()
    files.map(file => {
      form.append("file", file)
    })
    this.props.onUpload(form)
  }
  dropzone: any

  render() {
    const { uploading } = this.props
    return (
      <>
        <Dropzone
          onDrop={this.onDrop}
          multiple={true}
          disableClick={true}
          ref={node => {
            this.dropzone = node
          }}
          style={{}}
          className={style.dropzone + (uploading ? " " + style.uploading : "")}
          activeClassName={style.dropzoneActive}
          rejectClassName={style.dropzoneReject}
        >
          <div className={style.dropzoneEmpty}>
            {messages.help_dropHere}
            <Button
              className={style.button}
              onClick={() => {
                this.dropzone.open()
              }}
            >
              {messages.chooseImage}
            </Button>
          </div>
        </Dropzone>

        <Snackbar open={uploading} message={messages.messages_uploading} />
      </>
    )
  }
}

export default MultiUploader
