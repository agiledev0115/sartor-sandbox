import { Button, Divider } from "@material-ui/core"
import { Refresh } from "@material-ui/icons"
import { List } from "material-ui/List"
import React, { useEffect } from "react"
import { messages } from "../../../../lib"
import Head from "./head"
import CustomersListItem from "./item"
import style from "./style.module.sass"

interface props {
  items
  selected
  loadingItems
  hasMore
  onSelect
  onSelectAll
  loadMore
  settings
  onLoad
}

const CustomersList = (props: props) => {
  const {
    items,
    selected,
    loadingItems,
    hasMore,
    onSelect,
    onSelectAll,
    loadMore,
    settings,
    onLoad,
  } = props

  useEffect(() => {
    onLoad()
  }, [])

  const rows = items.map((item, index) => (
    <CustomersListItem
      key={index}
      customer={item}
      selected={selected}
      onSelect={onSelect}
      settings={settings}
    />
  ))

  return (
    <>
      <List>
        <Head onSelectAll={onSelectAll} />
        <Divider />
        {rows}
        <div className={style.more}>
          <Button
            variant="contained"
            color="primary"
            disabled={loadingItems || !hasMore}
            endIcon={<Refresh />}
            onClick={loadMore}
          >
            {messages.actions_loadMore}
          </Button>
        </div>
      </List>
    </>
  )
}

export default CustomersList
