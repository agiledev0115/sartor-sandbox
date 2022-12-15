import { Add } from "@material-ui/icons"
import IconButton from "material-ui/IconButton"
import React from "react"
import { Link } from "react-router-dom"
import { messages } from "../../../../../lib"

const Buttons = () => (
  <span>
    <Link to="/admin/settings/redirects/add">
      <IconButton
        touch
        tooltipPosition="bottom-left"
        tooltip={messages.redirectAdd}
      >
        <Add htmlColor="#fff" />
      </IconButton>
    </Link>
  </span>
)

export default Buttons
