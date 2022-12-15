import { Add, Delete } from "@material-ui/icons"
import IconButton from "material-ui/IconButton"
import React, { FC, useState } from "react"
import { messages } from "../../../../lib"
import DeleteConfirmation from "../../../shared/deleteConfirmation"
import Search from "./search"

interface props {
  search
  setSearch: Function
  selectedCount
  onDelete: Function
  onCreate: Function
}

const Buttons: FC<props> = (props: props) => {
  const [openDelete, setOpenDelete] = useState(false)

  const { search, setSearch, selectedCount, onDelete, onCreate } = props

  const deleteOrders = () => {
    setOpenDelete(false)
    onDelete()
  }

  return (
    <>
      <Search value={search} setSearch={setSearch} />
      {selectedCount > 0 && (
        <>
          <IconButton
            touch
            tooltipPosition="bottom-left"
            tooltip={messages.actions_delete}
            onClick={() => setOpenDelete(true)}
          >
            <Delete htmlColor="#fff" />
          </IconButton>
          <DeleteConfirmation
            open={openDelete}
            isSingle={false}
            itemsCount={selectedCount}
            onCancel={() => setOpenDelete(false)}
            onDelete={deleteOrders}
          />
        </>
      )}
      <IconButton
        touch
        tooltipPosition="bottom-left"
        tooltip={messages.orders_titleAdd}
        onClick={() => onCreate}
      >
        <Add htmlColor="#fff" />
      </IconButton>
    </>
  )
}

export default Buttons
