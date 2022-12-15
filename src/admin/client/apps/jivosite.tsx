import { Button, TextField } from "@material-ui/core"
import React, { useEffect, useState } from "react"
import { api, messages } from "../lib"

export const Description = {
  key: "jivosite",
  name: "JivoSite онлайн-консультант",
  coverUrl: "/admin-assets/images/apps/jivosite.webp",
  description: `JivoSite – чат для сайта и инструмент для общения с клиентами в социальных сетях, мессенджерах и мобильных приложениях. Зарабатывайте больше, не упуская ни одного обращения.`,
}

export const App = () => {
  const [code, setCode] = useState("")

  const fetchSettings = async () => {
    try {
      const { json } = await api.apps.settings.retrieve("jivosite")
      const appSettings = json
      if (appSettings) {
        setCode(appSettings.code)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const updateSettings = () => {
    api.apps.settings.update("jivosite", { code: code })
    api.theme.placeholders.update("jivosite", {
      place: "body_end",
      value: code,
    })
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  return (
    <>
      Введите код JivoSite
      <TextField
        type="text"
        variant="outlined"
        multiline
        fullWidth
        rows={10}
        value={code}
        onChange={event => setCode(event.target.value)}
        label="Код чата JivoSite"
        helperText="<!-- BEGIN JIVOSITE CODE {literal} -->"
        style={{ marginTop: "25px" }}
      />
      <div style={{ textAlign: "right" }}>
        <Button variant="contained" color="secondary" onClick={updateSettings}>
          {messages.save}
        </Button>
      </div>
    </>
  )
}
