import { Button, TextField } from "@material-ui/core"
import React, { useEffect, useState } from "react"
import { api, messages } from "../lib"

export const Description = {
  key: "google-analytics",
  name: "Google Analytics",
  coverUrl: "/admin-assets/images/apps/googleAnalytics.webp",
  description: `Google Analytics gives you the digital analytics tools you need to analyze data from all touchpoints in one place, for a deeper understanding of the customer experience.
  <p>This App logs page views and Enhanced ecommerce events:</p>
  <ol>
    <li>Page view</li>
    <li>Product view</li>
    <li>Search</li>
    <li>Add to cart</li>
    <li>Remove from cart</li>
    <li>Begin checkout</li>
    <li>Set shipping method</li>
    <li>Set payment method</li>
    <li>Purchase</li>
  </ol>
  <p>This App will add gtag.js to your site. The Global Site Tag (gtag.js) provides a framework for streamlined web page tagging – giving you better control while making implementation easier. Using gtag.js lets you benefit from the latest tracking features and integrations as they become available.</p>`,
}

const GTagCode = `<!-- Global site tag (gtag.js) - Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_TRACKING_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_TRACKING_ID');
</script>`

export const App = () => {
  const [trackingID, setTrackingID] = useState("")

  const fetchSettings = async () => {
    try {
      const { json } = await api.apps.settings.retrieve("google-analytics")
      const appSettings = json
      if (appSettings) {
        setTrackingID(appSettings.GA_TRACKING_ID)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const updateSettings = () => {
    const gtag =
      trackingID && trackingID.length > 0
        ? GTagCode.replace(/GA_TRACKING_ID/g, trackingID)
        : ""

    api.apps.settings.update("google-analytics", {
      GA_TRACKING_ID: trackingID,
    })
    api.theme.placeholders.update("google-analytics", {
      place: "head_start",
      value: gtag,
    })
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  return (
    <>
      Enter your Google Analytics Tracking ID to track page views and other
      events.
      <TextField
        type="text"
        variant="outlined"
        value={trackingID}
        onChange={event => setTrackingID(event.target.value)}
        label="Tracking ID"
        helperText="UA-XXXXXXXX-X"
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
