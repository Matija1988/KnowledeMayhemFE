import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Modal } from "../../components/ui/Modal";
import { Pagination } from "../../components/ui/Pagination";
import type { Question } from "../../domain/questionBank/questionBankTypes";
import { useQuestionBankStore } from "../../stores/questionBankStore";
import { QuestionFilters } from "./QuestionFilters";
import { QuestionTable } from "./QuestionTable";
import { useQuestionBankActions } from "./useQuestionBankActions";

export function QuestionListPage() {
  const categories = useQuestionBankStore((state) => state.categories);
  const questions = useQuestionBankStore((state) => state.questions);
  const filters = useQuestionBankStore((state) => state.filters);
  const pending = useQuestionBankStore((state) => state.pendingOperations);
  const setFilters = useQuestionBankStore((state) => state.setFilters);
  const resetFilters = useQuestionBankStore((state) => state.resetFilters);
  const [confirmDelete, setConfirmDelete] = useState<Question | null>(null);
  const actions = useQuestionBankActions();

  useEffect(() => {
    void actions.loadCategories();
  }, []);

  useEffect(() => {
    void actions.loadQuestions(filters);
  }, [filters.pageNumber, filters.pageSize, filters.category, filters.isActive, filters.text, filters.orderBy]);

  async function removeQuestion() {
    if (!confirmDelete) return;
    const removed = await actions.removeQuestion(confirmDelete.id);
    if (removed) {
      setConfirmDelete(null);
      void actions.loadQuestions(filters);
    }
  }

  return (
    <section className="question-bank-section">
      <div className="question-bank-section__header">
        <h2>Questions</h2>
        <Link className="ui-button ui-button--primary" to="/admin/question-bank/questions/new">
          New question
        </Link>
      </div>
      <Card>
        <QuestionFilters categories={categories} filters={filters} onChange={setFilters} onReset={resetFilters} />
      </Card>
      <Card>
        {pending.includes("loadQuestions") ? <p role="status">Loading questions...</p> : null}
        <QuestionTable questions={questions.items} onDelete={setConfirmDelete} />
        <Pagination
          pageNumber={questions.pageNumber}
          pageSize={questions.pageSize}
          totalCount={questions.totalCount}
          onPageChange={(pageNumber) => setFilters({ pageNumber })}
          onPageSizeChange={(pageSize) => setFilters({ pageSize })}
        />
      </Card>
      {confirmDelete ? (
        <Modal title="Deactivate question" onClose={() => setConfirmDelete(null)}>
          <p>Deactivate this question? It will be hidden from default active lists.</p>
          <div className="question-bank-actions">
            <Button type="button" variant="danger" isLoading={pending.includes("deleteQuestion")} onClick={removeQuestion}>
              Deactivate
            </Button>
            <Button type="button" variant="secondary" onClick={() => setConfirmDelete(null)}>
              Cancel
            </Button>
          </div>
        </Modal>
      ) : null}
    </section>
  );
}
