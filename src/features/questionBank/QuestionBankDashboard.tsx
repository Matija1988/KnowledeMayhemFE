import { Link } from "react-router-dom";
import { Card } from "../../components/ui/Card";

export function QuestionBankDashboard() {
  return (
    <section className="question-bank-grid" aria-label="Question bank dashboard">
      <Card>
        <h2>Categories</h2>
        <p>Review category availability and maintain authoring options.</p>
        <Link className="ui-button ui-button--primary" to="/admin/question-bank/categories">
          Open categories
        </Link>
      </Card>
      <Card>
        <h2>Questions</h2>
        <p>Create, validate, search, and deactivate playable questions.</p>
        <Link className="ui-button ui-button--primary" to="/admin/question-bank/questions">
          Open questions
        </Link>
      </Card>
    </section>
  );
}
