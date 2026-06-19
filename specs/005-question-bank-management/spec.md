# Feature Specification: Question Bank Management

**Feature Branch**: `005-question-bank-management`

**Created**: 2026-06-18

**Status**: Draft

**Input**: User description: "FE feature implementation. Feature 5: Question Bank Management for moderators and admins, including role-based post-login redirect, protected management routes, category CRUD for admins, question CRUD for admins and moderators, answer editing with exactly four answers and exactly one correct answer, paginated and filtered question list, soft-delete behavior, centralized loading and error handling, dark blue/white management UI, accessibility, and tests."

## Clarifications

### Session 2026-06-18

- Q: How should category or question saves handle concurrent edits from another staff user? -> A: When the backend reports stale or conflicting data, block save, show a conflict message, and require reload.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Reach The Right Post-Login Area (Priority: P1)

Authenticated users are sent to the correct area for their role: players continue to the lobby, while moderators and admins enter the question bank management area.

**Why this priority**: Role-based entry is the gate for every management capability and prevents players from seeing administration surfaces.

**Independent Test**: Can be tested by signing in with player, moderator, and admin accounts and confirming each user lands on the correct destination with management access enforced.

**Acceptance Scenarios**:

1. **Given** a player signs in successfully, **When** login completes, **Then** the player is redirected to the lobby.
2. **Given** a moderator signs in successfully, **When** login completes, **Then** the moderator is redirected to question bank management.
3. **Given** an admin signs in successfully, **When** login completes, **Then** the admin is redirected to question bank management.
4. **Given** a player attempts to open a management screen directly, **When** access is evaluated, **Then** the player is denied with a blocking permission message.

---

### User Story 2 - Admin Manages Categories (Priority: P1)

Admins can view, create, edit, and deactivate categories used to organize gameplay questions.

**Why this priority**: Questions require valid categories, and admins need category control before moderators can reliably author questions.

**Independent Test**: Can be tested by using an admin account to create a category, update its details, deactivate it, and confirm it is clearly marked inactive and unavailable for new questions by default.

**Acceptance Scenarios**:

1. **Given** an admin is in category management, **When** they enter a unique required name and required description, **Then** the category is created and appears in the category list.
2. **Given** an admin edits an existing category, **When** valid changes are saved, **Then** the list reflects the updated category details.
3. **Given** an admin deactivates a category after confirmation, **When** the action completes, **Then** the category is shown as inactive and is hidden from selectable active-category defaults.
4. **Given** a moderator views categories, **When** they open category management, **Then** they can read categories but cannot create, update, or deactivate them.

---

### User Story 3 - Moderator Or Admin Manages Questions And Answers (Priority: P1)

Moderators and admins can create and edit questions with exactly four answers and exactly one correct answer, then deactivate questions when they should no longer be used.

**Why this priority**: The question bank has no gameplay value unless authorized staff can maintain playable questions with valid answer sets.

**Independent Test**: Can be tested by creating a question with four answer rows, choosing one correct answer, saving it, editing it with a replaced answer set, and deactivating it.

**Acceptance Scenarios**:

1. **Given** a moderator or admin starts a new question, **When** the form opens, **Then** exactly four answer rows are available.
2. **Given** the question form has fewer or more than four answers, **When** the user attempts to save, **Then** save is blocked with field-level validation.
3. **Given** no answer or more than one answer is marked correct, **When** the user attempts to save, **Then** save is blocked until exactly one answer is marked correct.
4. **Given** a valid category, question text, four answer texts, and one correct answer, **When** the user saves, **Then** the question is created or updated with its full answer set.
5. **Given** a question is deactivated after confirmation, **When** the action completes, **Then** it is visibly inactive and omitted from default active lists.

---

### User Story 4 - Find And Review Questions Efficiently (Priority: P2)

Moderators and admins can browse questions with pagination, filtering, search, ordering, status indicators, and clear row actions.

**Why this priority**: A usable question bank requires staff to find, inspect, and maintain existing questions as the content grows.

**Independent Test**: Can be tested by loading a populated question list, changing page size, paging through results, filtering by category and active status, searching text, and opening an edit flow from a row action.

**Acceptance Scenarios**:

1. **Given** the question bank contains more questions than one page, **When** the user changes pages or page size, **Then** the list shows the requested result page and keeps controls understandable.
2. **Given** category, active-status, and text filters are applied, **When** the list refreshes, **Then** only matching questions are displayed.
3. **Given** questions have active or inactive states, **When** the list renders, **Then** each state is visible without relying on color alone.
4. **Given** a question row is displayed, **When** the user chooses edit or deactivate, **Then** the appropriate protected workflow starts.

### Edge Cases

- A user signs in with no recognized role or multiple roles; the most privileged recognized management role determines access, otherwise the user is treated as a player.
- A player manually enters a management URL; access is blocked without briefly exposing management data.
- A moderator attempts category create, update, or deactivate actions; the action is unavailable and any direct attempt is rejected with a permission message.
- A category name duplicates an existing active category; save is blocked with a clear validation or service error.
- A category is inactive or soft-deleted; it remains visible where history requires it but cannot be selected for new questions by default.
- A question references a category that later becomes inactive; the existing question can still be reviewed, but new or changed questions cannot select inactive categories.
- A user navigates away with unsaved form changes; the user is warned before losing edits.
- A category or question is changed by another staff user before the current user saves; when the backend reports a stale or conflicting save, the save is blocked, a conflict message is shown, and the user must reload the latest content before retrying.
- Loading, saving, or deleting fails; the user sees a centralized error message and no local state is falsely committed.
- The list is empty after filters; the UI explains that no questions match and offers a clear path to adjust filters or create a question if allowed.
- Keyboard-only and screen-reader users can navigate forms, choose the correct answer, understand validation errors, operate pagination, and complete confirmation dialogs.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST redirect authenticated users after login according to role: players to the lobby, moderators and admins to question bank management.
- **FR-002**: The system MUST protect all management screens so players and unauthenticated users cannot access them.
- **FR-003**: The system MUST allow admins to view, create, update, and deactivate categories.
- **FR-004**: The system MUST allow moderators to view categories for question authoring but not create, update, or deactivate categories.
- **FR-005**: Category creation and update MUST require a name of at most 40 characters and a description of at most 300 characters.
- **FR-006**: Category names MUST be unique among usable categories.
- **FR-007**: The system MUST prevent new or changed questions from selecting inactive or soft-deleted categories.
- **FR-008**: The system MUST allow moderators and admins to view, create, update, and deactivate questions.
- **FR-009**: Question creation and update MUST require a category, question text, exactly four answer texts, and exactly one correct answer.
- **FR-010**: Question text and answer text MUST each be limited to at most 1000 characters.
- **FR-011**: Updating a question MUST replace the full answer set shown in the question form.
- **FR-012**: The answer editor MUST always present exactly four answer rows and MUST prevent adding a fifth answer or removing below four answers.
- **FR-013**: Correct-answer selection MUST behave as a single-choice selection so only one answer can be correct at a time.
- **FR-014**: The question list MUST support pagination, page-size selection, category filtering, active-status filtering, optional text search, and created-date ordering.
- **FR-015**: The question list MUST display question text, category, active/inactive status, answer count, correct-answer indicator, created date, updated date, and available actions.
- **FR-016**: Soft-delete actions MUST require confirmation and MUST show inactive state clearly after completion.
- **FR-017**: Default lists MUST hide inactive or soft-deleted items unless the user chooses a filter that includes inactive items supported by the backend.
- **FR-018**: The system MUST use shared loading behavior for loading, creating, updating, and deleting categories and questions.
- **FR-019**: The system MUST prevent duplicate submits while create, update, or delete actions are pending.
- **FR-020**: Errors MUST be presented through centralized user-facing error handling, with blocking modals for permission denial, delete confirmation, and unsaved-change warnings where appropriate.
- **FR-021**: The system MUST block stale category or question saves when the backend reports a stale or conflicting change, show a conflict message, and require reloading the latest content before retrying.
- **FR-022**: All management UI controls MUST use the shared dark blue and white visual system and MUST NOT rely on browser-default styling.
- **FR-023**: All form controls MUST have labels, validation errors MUST be associated with fields, tables MUST have meaningful headers, confirmation dialogs MUST manage focus, and state indicators MUST NOT rely on color alone.
- **FR-024**: Gameplay question answering MUST remain separate from management question review, and management data MUST NOT expose correct answers inside gameplay before answer submission.

### Key Entities

- **User Role**: The user's authorization level for post-login navigation and management actions. Recognized roles are player, moderator, and admin.
- **Category**: A grouping for questions, including name, description, active state, creation/update timestamps, and optional deletion timestamp.
- **Question**: A managed prompt tied to a category, including text, active state, creation/update timestamps, optional deletion timestamp, and its answer set.
- **Answer**: One of exactly four options for a question, including text, correctness marker, active state, and timestamps.
- **Question Filter**: The user's current list criteria, including page, page size, category, active status, optional search text, and ordering.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of successful login attempts route players, moderators, and admins to the correct first screen for their role.
- **SC-002**: 100% of direct player attempts to access management screens are denied before management data is displayed.
- **SC-003**: Admins can create, update, and deactivate a category in under 2 minutes using only the visible UI.
- **SC-004**: Moderators or admins can create a valid question with four answers and one correct answer in under 3 minutes.
- **SC-005**: 100% of invalid question forms with missing category, missing text, not exactly four answers, or not exactly one correct answer are blocked before save.
- **SC-006**: Users can filter and locate a known question in a populated list within 30 seconds using category, active status, or text search.
- **SC-007**: 100% of destructive or deactivating actions require confirmation before completion.
- **SC-008**: The primary category and question management flows can be completed with keyboard-only input, visible focus, labeled controls, and understandable validation feedback.
- **SC-009**: Loading and pending feedback appears for create, update, delete, and list-loading actions within 500 ms of action start.
- **SC-010**: 100% of active, inactive, and correct-answer states shown in management UI include a text label or icon with an accessible name in addition to color.
- **SC-011**: 100% of backend-reported stale category or question save conflicts are blocked in the UI without overwriting newer staff changes.

## Assumptions

- Existing authentication already provides a reliable user role claim or equivalent role information after login.
- Admins have full category and question management rights; moderators have question management rights and category read access only.
- Soft delete means a category or question becomes inactive and receives a deletion timestamp rather than being permanently removed.
- Restore of soft-deleted entities is out of scope unless already supported by the backend.
- Default management lists show active content first and hide inactive or soft-deleted content unless filters include inactive content supported by the backend.
- Public question browsing, bulk edit, import/export, difficulty management, media attachments, audit-log viewing, and separate moderator dashboard design are out of scope.
