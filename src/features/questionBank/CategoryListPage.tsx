import { useEffect, useMemo, useState } from "react";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Modal } from "../../components/ui/Modal";
import { Badge } from "../../components/ui/Badge";
import { getUserRoleFromJwt, canManageCategories } from "../../domain/auth";
import type { Category } from "../../domain/questionBank/questionBankTypes";
import { useAuthStore } from "../../stores/authStore";
import { useQuestionBankStore } from "../../stores/questionBankStore";
import { CategoryForm } from "./CategoryForm";
import { useQuestionBankActions } from "./useQuestionBankActions";

export function CategoryListPage() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const role = getUserRoleFromJwt(accessToken);
  const canWrite = canManageCategories(role);
  const categories = useQuestionBankStore((state) => state.categories);
  const pending = useQuestionBankStore((state) => state.pendingOperations);
  const [editing, setEditing] = useState<Category | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Category | null>(null);
  const actions = useQuestionBankActions();

  useEffect(() => {
    void actions.loadCategories();
  }, []);

  const sortedCategories = useMemo(
    () => [...categories].sort((first, second) => first.name.localeCompare(second.name)),
    [categories],
  );
  const isSaving = pending.includes("createCategory") || pending.includes("updateCategory");

  async function saveCategory(value: { name: string; description: string }) {
    const saved = await actions.saveCategory(value, editing?.id);
    if (saved) {
      setEditing(null);
      setShowCreate(false);
    }
  }

  async function removeCategory() {
    if (!confirmDelete) return;
    const removed = await actions.removeCategory(confirmDelete.id);
    if (removed) {
      setConfirmDelete(null);
      void actions.loadCategories();
    }
  }

  return (
    <section className="question-bank-section">
      <div className="question-bank-section__header">
        <h2>Categories</h2>
        {canWrite ? (
          <Button type="button" onClick={() => setShowCreate(true)}>
            New category
          </Button>
        ) : (
          <Badge tone="warning">Read only</Badge>
        )}
      </div>

      {showCreate || editing ? (
        <Card>
          <h3>{editing ? "Edit category" : "New category"}</h3>
          <CategoryForm
            category={editing}
            isPending={isSaving}
            onSubmit={saveCategory}
            onCancel={() => {
              setEditing(null);
              setShowCreate(false);
            }}
          />
        </Card>
      ) : null}

      <div className="question-bank-list">
        {sortedCategories.map((category) => (
          <Card key={category.id}>
            <div className="question-bank-row">
              <div>
                <h3>{category.name}</h3>
                <p>{category.description}</p>
              </div>
              <Badge tone={category.isActive ? "success" : "warning"}>{category.isActive ? "Active" : "Inactive"}</Badge>
            </div>
            {canWrite ? (
              <div className="question-bank-actions">
                <Button type="button" variant="secondary" onClick={() => setEditing(category)}>
                  Edit
                </Button>
                <Button type="button" variant="danger" disabled={!category.isActive} onClick={() => setConfirmDelete(category)}>
                  Deactivate
                </Button>
              </div>
            ) : null}
          </Card>
        ))}
      </div>

      {confirmDelete ? (
        <Modal title="Deactivate category" onClose={() => setConfirmDelete(null)}>
          <p>Deactivate {confirmDelete.name}? Existing questions remain reviewable, but new questions cannot use it.</p>
          <div className="question-bank-actions">
            <Button type="button" variant="danger" isLoading={pending.includes("deleteCategory")} onClick={removeCategory}>
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
