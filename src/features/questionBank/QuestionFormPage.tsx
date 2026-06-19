import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Modal } from "../../components/ui/Modal";
import { useQuestionBankStore } from "../../stores/questionBankStore";
import { QuestionForm } from "./QuestionForm";
import { useQuestionBankActions } from "./useQuestionBankActions";

export function QuestionFormPage() {
  const { questionId } = useParams();
  const navigate = useNavigate();
  const categories = useQuestionBankStore((state) => state.categories);
  const questions = useQuestionBankStore((state) => state.questions.items);
  const conflictMessage = useQuestionBankStore((state) => state.conflictMessage);
  const pending = useQuestionBankStore((state) => state.pendingOperations);
  const actions = useQuestionBankActions();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const question = useMemo(() => questions.find((item) => item.id === questionId) ?? null, [questions, questionId]);

  useEffect(() => {
    void actions.loadCategories();
    if (questionId && !question) {
      void actions.loadQuestions();
    }
  }, [questionId]);

  async function saveQuestion(value: Parameters<typeof actions.saveQuestion>[0]) {
    const saved = await actions.saveQuestion(value, questionId);
    if (saved) {
      navigate("/admin/question-bank/questions");
    }
  }

  async function removeQuestion() {
    if (!questionId) return;
    const removed = await actions.removeQuestion(questionId);
    if (removed) {
      navigate("/admin/question-bank/questions");
    }
  }

  return (
    <section className="question-bank-section">
      <Card>
        <div className="question-bank-section__header">
          <h2>{questionId ? "Edit question" : "New question"}</h2>
          {questionId ? (
            <Button type="button" variant="danger" onClick={() => setConfirmDelete(true)}>
              Deactivate
            </Button>
          ) : null}
        </div>
        {conflictMessage ? (
          <div className="question-bank-warning" role="alert">
            {conflictMessage}
          </div>
        ) : null}
        <QuestionForm
          question={question}
          categories={categories}
          isPending={pending.includes("createQuestion") || pending.includes("updateQuestion")}
          onSubmit={saveQuestion}
          onCancel={() => navigate("/admin/question-bank/questions")}
        />
      </Card>
      {confirmDelete ? (
        <Modal title="Deactivate question" onClose={() => setConfirmDelete(false)}>
          <p>Deactivate this question? It will be hidden from default active lists.</p>
          <div className="question-bank-actions">
            <Button type="button" variant="danger" isLoading={pending.includes("deleteQuestion")} onClick={removeQuestion}>
              Deactivate
            </Button>
            <Button type="button" variant="secondary" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
          </div>
        </Modal>
      ) : null}
    </section>
  );
}
