import React from "react"
import Account from "../components/account/index"

const AccountContainer = props => (
  <>
    <section className="section">
      <div className="container">
        <div className="content">
          <Account {...props} />
        </div>
      </div>
    </section>
  </>
)

export default AccountContainer
