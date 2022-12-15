import { Paper } from "@material-ui/core"
import { Create, Delete } from "@material-ui/icons"
import IconButton from "material-ui/IconButton"
import React from "react"
import { messages } from "../../../lib"
import style from "./style.module.sass"

const GalleryItem = ({ url, alt, id, onDelete, onImageEdit }) => (
  <Paper elevation={4} square>
    <div className={style.preview}>
      <img src={url} title={alt} />
    </div>
    <div className={style.footer}>
      <IconButton
        touch
        tooltip={messages.edit}
        tooltipPosition="top-right"
        onClick={onImageEdit}
      >
        <Create htmlColor="rgba(0,0,0,0.5)" />
      </IconButton>
      <IconButton
        touch
        tooltip={messages.actions_delete}
        tooltipPosition="top-right"
        onClick={() => {
          onDelete(id)
        }}
      >
        <Delete htmlColor="rgba(0,0,0,0.5)" />
      </IconButton>
    </div>
  </Paper>
)

export default GalleryItem
