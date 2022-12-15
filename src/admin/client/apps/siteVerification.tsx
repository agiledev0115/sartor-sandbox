import { Button, TextField } from "@material-ui/core"
import React, { useEffect, useState } from "react"
import { api, messages } from "../lib"

export const Description = {
  key: "site-verification",
  name: "Site Verification",
  coverUrl: "/admin-assets/images/apps/siteVerification.webp",
  description: `Note that verifying your site with these services is not necessary in order for your site to be indexed by search engines. To use these advanced search engine tools and verify your site with a service, paste the HTML Tag code below.
  <p>Supported verification services:</p>
  <ol>
    <li><a target="_blank" href="https://www.google.com/webmasters/tools/" rel="external noopener noreferrer">Google Search Console</a></li>
    <li><a target="_blank" href="https://www.bing.com/webmaster/" rel="external noopener noreferrer">Bing Webmaster Center</a></li>
    <li><a target="_blank" href="https://pinterest.com/website/verify/" rel="external noopener noreferrer">Pinterest Site Verification</a></li>
    <li><a target="_blank" href="https://webmaster.yandex.com/sites/" rel="external noopener noreferrer">Yandex.Webmaster</a></li>
  </ol>`,
}

const googleExample = '<meta name="google-site-verification" content="1234" />'
const bingExample = '<meta name="msvalidate.01" content="1234" />'
const pinterestExample = '<meta name="p:domain_verify" content="1234" />'
const yandexExample = '<meta name="yandex-verification" content="1234" />'

export const App = () => {
  const [google, setGoogle] = useState("")
  const [bing, setBing] = useState("")
  const [pinterest, setPinterest] = useState("")
  const [yandex, setYandex] = useState("")

  const fetchSettings = async () => {
    try {
      const { json } = await api.apps.settings.retrieve("site-verification")
      const appSettings = json
      if (appSettings) {
        setGoogle(appSettings.google)
        setBing(appSettings.bing)
        setPinterest(appSettings.pinterest)
        setYandex(appSettings.yandex)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const updateSettings = () => {
    const metaTags = [google, bing, pinterest, yandex]
      .map(tag => (tag && tag.length > 0 ? tag : null))
      .filter(tag => tag !== null)
      .join("\n")

    api.apps.settings.update("site-verification", {
      google: google,
      bing: bing,
      pinterest: pinterest,
      yandex: yandex,
    })

    api.theme.placeholders.update("site-verification", {
      place: "head_start",
      value: metaTags,
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
        value={google}
        onChange={({ target }) => setGoogle(target.value)}
        label="Google"
        fullWidth
        helperText={googleExample}
        style={{ marginTop: "25px" }}
      />

      <TextField
        type="text"
        variant="outlined"
        value={bing}
        onChange={({ target }) => setBing(target.value)}
        label="Bing"
        fullWidth
        helperText={bingExample}
        style={{ marginTop: "25px" }}
      />

      <TextField
        type="text"
        variant="outlined"
        value={pinterest}
        onChange={({ target }) => setPinterest(target.value)}
        label="Pinterest"
        fullWidth
        helperText={pinterestExample}
        style={{ marginTop: "25px" }}
      />

      <TextField
        type="text"
        variant="outlined"
        value={yandex}
        onChange={({ target }) => setYandex(target.value)}
        label="Yandex"
        fullWidth
        helperText={yandexExample}
        style={{ marginTop: "25px" }}
      />

      <div style={{ textAlign: "right", marginTop: 20 }}>
        <Button variant="contained" color="secondary" onClick={updateSettings}>
          {messages.save}
        </Button>
      </div>
    </>
  )
}
