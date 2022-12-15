import { render } from "@testing-library/react"
import { expect } from "chai"
import * as React from "react"
import App from "../app"

describe("<App>", () => {
  it("renders title Dashboard", () => {
    const { getByText } = render(<App />)
    const linkElement = getByText(/Dashboard/i)
    expect(document.body.contains(linkElement))
  })
})
