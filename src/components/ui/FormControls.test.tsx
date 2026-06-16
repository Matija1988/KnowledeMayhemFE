import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FormField } from "./FormField";
import { Input } from "./Input";

describe("form controls", () => {
  it("connects labels and errors to inputs", () => {
    render(
      <FormField id="code" label="Lobby code" error="Enter a code.">
        <Input id="code" aria-describedby="code-error" />
      </FormField>,
    );

    expect(screen.getByLabelText("Lobby code")).toBeInTheDocument();
    expect(screen.getByText("Enter a code.")).toHaveAttribute("id", "code-error");
  });
});
