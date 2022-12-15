import { Button } from "@material-ui/core"
import React, { FC, useEffect } from "react"
import { Link } from "react-router-dom"
import apps from "../../../../apps"
import { messages } from "../../../../lib"
import AppItem from "./appItem"
import ServiceItem from "./serviceItem"

interface props {
  services: {
    data: {
      id: string
      cover_url: string
      name: string
      developer: {
        name: string
      }
      enabled: boolean
    }[]
  }
  webstoreAuthorized: boolean
  fetchData: Function
}

const ServicesList: FC<props> = (props: props) => {
  const { services, webstoreAuthorized, fetchData } = props

  useEffect(() => {
    fetchData()
  }, [])

  let serviceItems = null
  if (services && services.data) {
    serviceItems = services.data.map((service, index) => (
      <ServiceItem key={index} service={service} />
    ))
  }

  const appItems = apps.map((app, index) => (
    <AppItem key={index} app={app.Description} />
  ))

  return (
    <div
      className="row row--no-gutter scroll col-full-height"
      style={{ padding: 20, alignContent: "flex-start" }}
    >
      {appItems}
      {!webstoreAuthorized && (
        <div
          style={{
            width: "100%",
            marginTop: 30,
            color: "rgba(0, 0, 0, 0.52)",
          }}
        >
          {messages.loadFromWebstore}&nbsp;&nbsp;
          <Link to="/admin/apps/login">
            <Button variant="contained" color="primary">
              {messages.loginTitle}
            </Button>
          </Link>
        </div>
      )}
      {serviceItems}
    </div>
  )
}

export default ServicesList
