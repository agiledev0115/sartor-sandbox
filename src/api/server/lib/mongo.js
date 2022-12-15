import winston from "winston"
import url from "url"
import { MongoClient } from "mongodb"
import settings from "./settings"

import moment from "moment"
import _ from "lodash"
import emquery from "emquery"

const mongodbConnection = settings.mongodbServerUrl
const mongoPathName = url.parse(mongodbConnection).pathname
const dbName = mongoPathName.substring(mongoPathName.lastIndexOf("/") + 1)

const RECONNECT_INTERVAL = 1000
const CONNECT_OPTIONS = {
  reconnectTries: 3600,
  reconnectInterval: RECONNECT_INTERVAL,
  useNewUrlParser: true,
}

const onClose = () => {
  winston.info("MongoDB - API  connection was closed")
}

const onReconnect = () => {
  winston.info("MongoDB - API  reconnected")
}

export let db = null

const connectWithRetry = () => {
  MongoClient.connect(mongodbConnection, CONNECT_OPTIONS, (err, client) => {
    if (err) {
      winston.error(
        `MongoDB - API connection was failed: ${err.message}`,
        err.message
      )
      setTimeout(connectWithRetry, RECONNECT_INTERVAL)
    } else {
      db = client.db(dbName)
      db.on("close", onClose)
      db.on("reconnect", onReconnect)
      winston.info("MongoDB - API connected successfully")
    }
  })
}

connectWithRetry()
