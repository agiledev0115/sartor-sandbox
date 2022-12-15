import { render, screen } from "@testing-library/react"
import React from "react"
import App from "../modules/shared/editor"

it("renders welcome message in the Editor", () => {
  render(
    <App
      input={{
        value: "<p>Hello</p>",
        onChange: value => console.log("Testing", value),
      }}
    />
  )
  expect(screen.getByText("Hello")).toBeInTheDocument()
})
