import { Button, TextField } from "@material-ui/core"
import React, { useEffect, useState } from "react"
import { api, messages } from "../lib"

export const Description = {
  key: "facebook-customer-chat",
  name: "Facebook Customer Chat",
  coverUrl: "/admin-assets/images/apps/messenger.webp",
  description: `<p>The Messenger Platform's customer chat plugin allows you to integrate your Messenger experience directly into your website. This allows your customers to interact with your business anytime with the same personalized, rich-media experience they get in Messenger.</p>
  <p><img src='/admin-assets/images/apps/facebookCustomerChatPlugin.webp' /></p>
  <p>The customer chat plugin automatically loads recent chat history between the person and your business, meaning recent interactions with your business on messenger.com, in the Messenger app, or in the customer chat plugin on your website will be visible. This helps create a single experience for your customers, and enables you to continue the conversation even after they have left your webpage. No need to capture their information to follow up, just use the same conversation in Messenger.</p>
  <p>To access your Facebook's Page ID:</p>
  <ol>
    <li>Open your Facebook page.</li>
    <li>Click the About tab.</li>
    <li>Scroll down to the bottom of the Page Info section.</li>
    <li>Next to Facebook Page ID, you can find your page ID.</li>
  </ol>`,
}

const chatCode = `<div class="fb-customerchat" page_id="PAGE_ID" minimized="IS_MINIMIZED"></div>`

export const App = () => {
  const [pageID, setPageID] = useState("")
  const [minimized, setMinimized] = useState("false")

  const fetchSettings = async () => {
    try {
      const { json } = await api.apps.settings.retrieve(
        "facebook-customer-chat"
      )
      const appSettings = json
      if (appSettings) {
        setPageID(appSettings.pageID)
        setMinimized(appSettings.minimized)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const updateSettings = () => {
    const htmlCode =
      pageID && pageID.length > 0
        ? chatCode
            .replace(/PAGE_ID/g, pageID)
            .replace(/IS_MINIMIZED/g, minimized)
        : ""

    api.apps.settings.update("facebook-customer-chat", {
      pageId: pageID,
      minimized: minimized,
    })
    api.theme.placeholders.update("facebook-customer-chat", {
      place: "body_end",
      value: htmlCode,
    })
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  return (
    <>
      <TextField
        type="text"
        variant="outlined"
        fullWidth
        value={pageID}
        onChange={event => setPageID(event.target.value)}
        label="Page ID"
        style={{ marginTop: "25px" }}
      />
      <TextField
        type="text"
        variant="outlined"
        fullWidth
        value={minimized}
        onChange={event => setMinimized(event.target.value)}
        label="Minimized"
        helperText="false"
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
