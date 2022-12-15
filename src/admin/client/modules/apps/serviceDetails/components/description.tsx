import { Button, Paper } from "@material-ui/core"
import React from "react"
import { messages } from "../../../../lib"
import style from "./style.module.sass"

interface props {
  service
  loadingEnableDisable
  enableService
  disableService
}

const ServiceDescription = (props: props) => {
  const { service, loadingEnableDisable, enableService, disableService } = props
  if (service) {
    return (
      <div style={{ maxWidth: 720, width: "100%" }}>
        <Paper className="paper-box" elevation={4}>
          <div className={style.innerBox}>
            <div className="row">
              <div className="col-xs-4">
                <img
                  src={service.cover_url}
                  alt={service.name}
                  className={style.cover}
                />
              </div>
              <div className="col-xs-8">
                <h1 className={style.title}>{service.name}</h1>
                <div className={style.developer}>{service.developer.name}</div>
                {!service.enabled && (
                  <Button
                    variant="contained"
                    color="primary"
                    disabled={loadingEnableDisable}
                    onClick={enableService}
                  >
                    {messages.enable}
                  </Button>
                )}
                {service.enabled && (
                  <Button
                    variant="contained"
                    color="primary"
                    disabled={loadingEnableDisable}
                    onClick={disableService}
                  >
                    {messages.disable}
                  </Button>
                )}
              </div>
            </div>
            <div
              className={style.description}
              dangerouslySetInnerHTML={{ __html: service.description }}
            />
          </div>
        </Paper>
      </div>
    )
  } else {
    return null
  }
}

export default ServiceDescription
