import { Route, Routes } from 'react-router-dom'
import './App.css'
import LoginPage from './pages/LoginPage'

function App() {

  return (
    <>
    <Routes>
      <Route path='/login' element={<LoginPage />} />
      <Route path='/home' element={"Hello"}/>
    </Routes>
    </>
  )
}

export default App
