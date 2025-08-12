import { StrictMode } from 'react'
import './index.css'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'

const Root = () => {
  return <App/>
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root/>
  </StrictMode>,
)
