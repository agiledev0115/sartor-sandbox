import { Add } from "@material-ui/icons"
import IconButton from "material-ui/IconButton"
import React from "react"
import { Link } from "react-router-dom"
import { messages } from "../../../../lib"

const Buttons = () => (
  <span>
    <Link to="/admin/settings/shipping/add">
      <IconButton
        touch={true}
        tooltipPosition="bottom-left"
        tooltip={messages.settings_addShippingMethod}
      >
        <Add htmlColor="#fff" />
      </IconButton>
    </Link>
  </span>
)

export default Buttons
