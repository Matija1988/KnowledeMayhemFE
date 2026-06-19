import { Link } from "react-router-dom";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { EmptyTableState, Table } from "../../components/ui/Table";
import type { Question } from "../../domain/questionBank/questionBankTypes";

type QuestionTableProps = {
  questions: Question[];
  onDelete: (question: Question) => void;
};

export function QuestionTable({ questions, onDelete }: QuestionTableProps) {
  if (questions.length === 0) {
    return <EmptyTableState>No questions match the current filters.</EmptyTableState>;
  }

  return (
    <Table caption="Question management results">
      <thead>
        <tr>
          <th scope="col">Question</th>
          <th scope="col">Category</th>
          <th scope="col">Status</th>
          <th scope="col">Answers</th>
          <th scope="col">Correct</th>
          <th scope="col">Created</th>
          <th scope="col">Updated</th>
          <th scope="col">Actions</th>
        </tr>
      </thead>
      <tbody>
        {questions.map((question) => {
          const correctAnswer = question.answers.find((answer) => answer.isCorrect);
          return (
            <tr key={question.id}>
              <td>{question.text}</td>
              <td>{question.categoryName}</td>
              <td>
                <Badge tone={question.isActive ? "success" : "warning"}>{question.isActive ? "Active" : "Inactive"}</Badge>
              </td>
              <td>{question.answers.length}</td>
              <td>
                {correctAnswer ? (
                  <Badge tone="info">{correctAnswer.text}</Badge>
                ) : (
                  <Badge tone="danger">Missing</Badge>
                )}
              </td>
              <td>{formatDate(question.createdAtUtc)}</td>
              <td>{question.updatedAtUtc ? formatDate(question.updatedAtUtc) : "Not updated"}</td>
              <td>
                <div className="question-bank-actions">
                  <Link className="ui-button ui-button--secondary" to={`/admin/question-bank/questions/${question.id}/edit`}>
                    Edit
                  </Link>
                  <Button type="button" variant="danger" disabled={!question.isActive} onClick={() => onDelete(question)}>
                    Deactivate
                  </Button>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}
