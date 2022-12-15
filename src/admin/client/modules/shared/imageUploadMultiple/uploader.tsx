// @ts-nocheck
import { Button } from "@material-ui/core"
import Snackbar from "material-ui/Snackbar"
import React from "react"
import Dropzone from "react-dropzone"
import { messages } from "../../../lib"
import style from "./style.module.sass"

interface props {
  uploading
  onUpload: Function
}

class MultiUploader extends React.Component<props> {
  onDrop = files => {
    let form = new FormData()
    files.map(file => {
      form.append("file", file)
    })

    console.log(files)

    console.log(form)

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
          accept="image/*"
          ref={node => {
            this.dropzone = node
          }}
          style={{}}
          className={style.dropzone}
          activeClassName={style.dropzoneActive}
          rejectClassName={style.dropzoneReject}
        >
          {this.props.children}
          {!this.props.children && (
            <div className={style.dropzoneEmpty}>{messages.help_dropHere}</div>
          )}
        </Dropzone>

        {!uploading && (
          <Button
            variant="contained"
            color="primary"
            style={{ marginLeft: 20, marginTop: 10 }}
            onClick={() => {
              this.dropzone.open()
            }}
          >
            {messages.chooseImage}
          </Button>
        )}

        <Snackbar open={uploading} message={messages.messages_uploading} />
      </>
    )
  }
}

export default MultiUploader
