import { MoreVert } from "@material-ui/icons"
import IconButton from "material-ui/IconButton"
import IconMenu from "material-ui/IconMenu"
import MenuItem from "material-ui/MenuItem"
import React from "react"
import { Link } from "react-router-dom"
import { messages } from "../../../../lib"

const WebStoreMenu = () => {
  return (
    <IconMenu
      iconButtonElement={
        <IconButton touch>
          <MoreVert htmlColor="#fff" />
        </IconButton>
      }
      targetOrigin={{ horizontal: "right", vertical: "top" }}
      anchorOrigin={{ horizontal: "right", vertical: "top" }}
    >
      <MenuItem
        containerElement={<Link to="/admin/apps/account" />}
        primaryText={messages.account}
      />
    </IconMenu>
  )
}

export default WebStoreMenu
