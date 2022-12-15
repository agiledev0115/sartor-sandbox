import React from "react"
import ResetPassword from "../components/resetPassword/index"

const ResetPasswordContainer = props => (
  <>
    <section className="section">
      <div className="container">
        <div className="content">
          <ResetPassword {...props} />
        </div>
      </div>
    </section>
  </>
)

export default ResetPasswordContainer
