import { Button } from "@material-ui/core"
import Dialog from "material-ui/Dialog"
import { Table, TableBody, TableRow, TableRowColumn } from "material-ui/Table"
import TextField from "material-ui/TextField"
import React, { FC, useEffect, useState } from "react"
import { api, helper, messages } from "../../../lib"

const SearchBox = ({ text, onChange }) => {
  return (
    <TextField
      fullWidth
      floatingLabelText={messages.products_search}
      onChange={onChange}
      value={text}
    />
  )
}

interface SearchResultProps {
  products
  selectedId
  settings
  onSelect: Function
}

const SearchResult = (props: SearchResultProps) => {
  const { products, selectedId, settings, onSelect } = props
  const rows = products.map((product, index) => {
    let priceFormatted = helper.formatCurrency(product.price, settings)
    const isSelected = product.id === selectedId

    return (
      <TableRow key={index} selected={isSelected}>
        <TableRowColumn>{product.name}</TableRowColumn>
        <TableRowColumn>{product.category_name}</TableRowColumn>
        <TableRowColumn>{product.sku}</TableRowColumn>
        <TableRowColumn style={{ textAlign: "right" }}>
          {priceFormatted}
        </TableRowColumn>
      </TableRow>
    )
  })

  return (
    <Table
      height="400px"
      selectable
      multiSelectable={false}
      onRowSelection={() => onSelect}
    >
      <TableBody>{rows}</TableBody>
    </Table>
  )
}

interface props {
  title: string
  submitLabel: string
  cancelLabel: string
  modal?: boolean
  settings
  open: boolean
  onCancel: Function
  onSubmit: Function
}

const ConfirmationDialog: FC<props> = (props: props) => {
  const [open, setOpen] = useState(props.open)
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState("")
  const [selectedId, setSelectedId] = useState(null)

  const {
    title,
    submitLabel,
    cancelLabel,
    modal = false,
    settings,
    onCancel,
    onSubmit,
  } = props

  useEffect(() => {
    setOpen(props.open)
  }, [props.open])

  const handleCancel = () => {
    setOpen(false)
    if (onCancel) {
      onCancel()
    }
  }

  const handleSubmit = () => {
    setOpen(false)
    if (onSubmit) {
      onSubmit(selectedId)
    }
  }

  const handleRowSelection = selectedRows => {
    if (selectedRows && selectedRows.length > 0) {
      const selectedIndex = selectedRows[0]
      const selectedProductId =
        products && products.length >= selectedIndex
          ? products[selectedIndex].id
          : null
      setSelectedId(selectedProductId)
    }
  }

  const handleSearch = (event, value) => {
    setSearch(value)

    api.products
      .list({
        limit: 50,
        enabled: true,
        discontinued: false,
        fields:
          "id,name,category_id,category_name,sku,enabled,discontinued,price,on_sale,regular_price",
        search: value,
      })
      .then(productsResponse => {
        console.log(productsResponse.json.data)
        setProducts(productsResponse.json.data)
      })
  }

  const actions = [
    <Button
      variant="contained"
      color="primary"
      onClick={handleCancel}
      style={{ marginRight: 10 }}
    >
      {cancelLabel}
    </Button>,
    <Button variant="contained" color="primary" onClick={handleSubmit}>
      {submitLabel}
    </Button>,
  ]

  return (
    <Dialog
      title={title}
      actions={actions}
      actionsContainerStyle={{ borderTop: "1px solid rgb(224, 224, 224)" }}
      modal={modal}
      open={open}
      onRequestClose={handleCancel}
    >
      <SearchBox text={search} onChange={handleSearch} />
      <SearchResult
        products={products}
        selectedId={selectedId}
        onSelect={handleRowSelection}
        settings={settings}
      />
    </Dialog>
  )
}

export default ConfirmationDialog
