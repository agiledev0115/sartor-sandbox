import { FC, useEffect } from "react"
import { auth } from "../lib"

const Logout: FC = () => {
  useEffect(() => {
    auth.removeToken()
  }, [])

  return null
}

export default Logout
