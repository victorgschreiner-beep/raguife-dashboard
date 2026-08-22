import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

// HashRouter (em vez de BrowserRouter) propositalmente: GitHub Pages não
// tem rewrite de servidor para SPA, então navegar direto para uma rota como
// /sessao/:id/parede daria 404. Com hash (#/sessao/:id/parede) o roteamento
// acontece inteiramente no cliente e funciona em qualquer host estático,
// inclusive dentro de um subcaminho de projeto (usuario.github.io/repo/).
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>,
)
