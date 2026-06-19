import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { Card } from "./Card";
import { Checkbox } from "./Checkbox";
import { FormError } from "./FormError";
import { FormField } from "./FormField";
import { Input } from "./Input";
import { LoadingSpinner } from "./LoadingSpinner";
import { Modal } from "./Modal";
import { Pagination } from "./Pagination";
import { Select } from "./Select";
import { EmptyTableState, Table } from "./Table";
import { Textarea } from "./Textarea";
import { Toast } from "./Toast";

describe("ui primitives", () => {
  it("renders shared form and display primitives with accessible hooks", () => {
    render(
      <>
        <Card>
          <FormField id="title" label="Title" error="Required">
            <Input id="title" aria-describedby="title-error" />
          </FormField>
          <Textarea aria-label="Body" />
          <Select aria-label="Status">
            <option>Active</option>
          </Select>
          <Checkbox aria-label="Published" />
          <FormError message="Form problem" />
          <Button isLoading>Save</Button>
          <Badge tone="success">Active</Badge>
          <LoadingSpinner />
          <Toast title="Saved">Done</Toast>
        </Card>
        <Table caption="Rows">
          <tbody>
            <tr>
              <td>Cell</td>
            </tr>
          </tbody>
        </Table>
        <EmptyTableState>Empty</EmptyTableState>
        <Pagination pageNumber={1} pageSize={10} totalCount={1} onPageChange={() => undefined} onPageSizeChange={() => undefined} />
        <Modal title="Confirm">Modal body</Modal>
      </>,
    );

    expect(screen.getByLabelText("Title")).toBeInTheDocument();
    expect(screen.getByLabelText("Published")).toBeInTheDocument();
    expect(screen.getByText("Loading")).toBeInTheDocument();
    expect(screen.getByRole("dialog", { name: "Confirm" })).toBeInTheDocument();
  });
});
