import { useEffect, useMemo, useState } from "react";
import { Button } from "../../components/ui/Button";
import { Checkbox } from "../../components/ui/Checkbox";
import { listCategories } from "../../api/questionBankApi";
import type { Category } from "../../domain/questionBank/questionBankTypes";
import type { Lobby } from "../../domain/lobby/lobbyTypes";
import { useAuthStore } from "../../stores/authStore";
import { useErrorStore } from "../../stores/errorStore";
import { useLobbyActions } from "./useLobbyActions";

type LobbyCategorySelectorProps = {
  lobby: Lobby;
  currentUserId: string | null;
  controlsDisabled?: boolean;
};

export function LobbyCategorySelector({ lobby, currentUserId, controlsDisabled = false }: LobbyCategorySelectorProps) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const showError = useErrorStore((state) => state.showError);
  const { updateCategories } = useLobbyActions();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>(lobby.selectedCategoryIds);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const isHost = currentUserId === lobby.hostUserId;
  const isLocked = lobby.status !== "Open";

  useEffect(() => {
    setSelectedIds(lobby.selectedCategoryIds);
  }, [lobby.selectedCategoryIds]);

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    let isActive = true;
    setIsLoading(true);
    listCategories({ accessToken })
      .then((items) => {
        if (isActive) {
          setCategories(items);
        }
      })
      .catch(() => {
        if (isActive) {
          showError({
            title: "Categories unavailable",
            message: "Question categories could not be loaded.",
            displayMode: "toast",
          });
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [accessToken, showError]);

  const activeCategories = useMemo(() => categories.filter((category) => category.isActive), [categories]);
  const selectedNames = selectedIds.map((id) => categories.find((category) => category.id === id)?.name ?? id);
  const dirty = selectedIds.length !== lobby.selectedCategoryIds.length || selectedIds.some((id) => !lobby.selectedCategoryIds.includes(id));

  function toggleCategory(categoryId: string, checked: boolean) {
    setSelectedIds((current) => {
      if (checked) {
        return current.includes(categoryId) ? current : [...current, categoryId];
      }
      return current.filter((id) => id !== categoryId);
    });
  }

  async function saveSelection() {
    setIsSaving(true);
    try {
      await updateCategories(lobby.id, selectedIds);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="lobby-setup-section" aria-labelledby="lobby-categories-title">
      <div className="lobby-setup-section__header">
        <h2 id="lobby-categories-title">Categories</h2>
        <span>{lobby.selectedCategoryIds.length} selected</span>
      </div>
      {isLoading ? <p className="disabled-reason">Loading categories...</p> : null}
      <div className="lobby-category-grid">
        {activeCategories.map((category) => {
          const checkboxId = `lobby-category-${category.id}`;
          return (
            <label key={category.id} className="lobby-category-option" htmlFor={checkboxId}>
              <Checkbox
                id={checkboxId}
                checked={selectedIds.includes(category.id)}
                disabled={!isHost || isLocked || isSaving || controlsDisabled}
                onChange={(event) => toggleCategory(category.id, event.currentTarget.checked)}
              />
              <span>{category.name}</span>
            </label>
          );
        })}
      </div>
      {!isHost ? <p className="disabled-reason">Selected: {selectedNames.join(", ") || "None"}</p> : null}
      {isHost ? (
        <Button
          type="button"
          variant="secondary"
          onClick={() => void saveSelection()}
          disabled={!dirty || selectedIds.length === 0 || isLocked || controlsDisabled}
          isLoading={isSaving}
        >
          Save categories
        </Button>
      ) : null}
    </section>
  );
}
