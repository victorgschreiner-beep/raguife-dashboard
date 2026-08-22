import { Routes, Route, Navigate } from 'react-router-dom'
import FacilitatorLayout from './components/layout/FacilitatorLayout'
import Home from './pages/Home'
import NewSession from './pages/NewSession'
import QRCodePage from './pages/QRCodePage'
import CollaboratorPage from './pages/CollaboratorPage'
import FacilitatorPanel from './pages/FacilitatorPanel'
import BrainstormWall from './pages/BrainstormWall'
import IshikawaPage from './pages/IshikawaPage'
import FiveWhysPage from './pages/FiveWhysPage'
import VotingPage from './pages/VotingPage'
import PrioritizationPage from './pages/PrioritizationPage'
import ParetoPage from './pages/ParetoPage'
import ActionPlanPage from './pages/ActionPlanPage'
import SessionDashboard from './pages/SessionDashboard'
import HistoryPage from './pages/HistoryPage'
import ReportPage from './pages/ReportPage'
import AISettingsPage from './pages/AISettingsPage'
import ToastStack from './components/ui/ToastStack'

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/nova-sessao" element={<NewSession />} />
        <Route path="/sessao/:id/qrcode" element={<QRCodePage />} />
        <Route path="/colaborador/:sessionId" element={<CollaboratorPage />} />
        <Route path="/historico" element={<HistoryPage />} />

        <Route element={<FacilitatorLayout />}>
          <Route path="/sessao/:id/painel" element={<FacilitatorPanel />} />
          <Route path="/sessao/:id/parede" element={<BrainstormWall />} />
          <Route path="/sessao/:id/ishikawa" element={<IshikawaPage />} />
          <Route path="/sessao/:id/5porques" element={<FiveWhysPage />} />
          <Route path="/sessao/:id/votacao" element={<VotingPage />} />
          <Route path="/sessao/:id/priorizacao" element={<PrioritizationPage />} />
          <Route path="/sessao/:id/pareto" element={<ParetoPage />} />
          <Route path="/sessao/:id/plano-de-acao" element={<ActionPlanPage />} />
          <Route path="/sessao/:id/dashboard" element={<SessionDashboard />} />
          <Route path="/sessao/:id/relatorio" element={<ReportPage />} />
          <Route path="/configuracoes-ia" element={<AISettingsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastStack />
    </>
  )
}
