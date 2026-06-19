import { NavLink, Outlet } from "react-router-dom";
import { getUserRoleFromJwt } from "../../domain/auth";
import { useAuthStore } from "../../stores/authStore";
import { Badge } from "../../components/ui/Badge";

export function QuestionBankLayout() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const role = getUserRoleFromJwt(accessToken);

  return (
    <main className="question-bank-page">
      <header className="question-bank-header">
        <div>
          <h1>Question bank</h1>
          <p>Manage categories, questions, answers, and playable content state.</p>
        </div>
        <Badge tone={role === "Admin" ? "success" : "info"}>{role}</Badge>
      </header>
      <nav className="question-bank-nav" aria-label="Question bank navigation">
        <NavLink to="/admin/question-bank" end>
          Dashboard
        </NavLink>
        <NavLink to="/admin/question-bank/categories">Categories</NavLink>
        <NavLink to="/admin/question-bank/questions">Questions</NavLink>
      </nav>
      <Outlet />
    </main>
  );
}
