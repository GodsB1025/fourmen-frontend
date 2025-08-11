import react from 'react'
import './App.css'  
import { RouterProvider } from 'react-router-dom'
import { router } from './routers/router'

function App() {
  return (
    <div>
      <RouterProvider router={router}/>
    </div>
  )
}

export default App
