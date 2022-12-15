import React from "react"
import ForgotPassword from "../components/forgotPassword/index"

const ForgotPasswordContainer = props => (
  <>
    <section className="section">
      <div className="container">
        <div className="content">
          <ForgotPassword {...props} />
        </div>
      </div>
    </section>
  </>
)

export default ForgotPasswordContainer
