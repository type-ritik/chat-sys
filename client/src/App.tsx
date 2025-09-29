import { Route, Routes } from 'react-router-dom'
import './App.css'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import IndexPage from './pages/IndexPage'

function App() {

  return (
    <>
    <Routes>
      <Route path='/login' element={<LoginPage />} />
      <Route path='/' element={<IndexPage />}/>
      <Route path='/signup' element={<SignupPage />}/>
    </Routes>
    </>
  )
}

export default App
