import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import theme from './theme'
import { ThemeProvider } from '@mui/material/styles'
import Header from './components/Header'
import Elections from './components/Elections'
import Login from './components/Login'
import AddElection from './components/ElectionForm/AddElection'
import Election from './components/Election/Election'
import DuplicateElection from './components/ElectionForm/DuplicateElection'
import Sandbox from './components/Sandbox'
import DebugPage from './components/DebugPage'
import LandingPage from './components/LandingPage'
import { Alert, Box, CssBaseline, Snackbar } from '@mui/material'
import { useAuthSession } from './hooks/useAuthSession'
import { Isnack, SnackbarContext } from './components/SnackbarContext'
import Footer from './components/Footer'
const App = () => {
  const authSession = useAuthSession()
  const [snack, setSnack] = useState({
    message: '',
    severity: "info",
    open: false,
    autoHideDuration: null,
  } as Isnack)
  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnack({ ...snack, open: false })
  }
  return (
    <Router>
      <ThemeProvider theme={theme}>
        <SnackbarContext.Provider value={{ snack, setSnack }}>
          <Snackbar open={snack.open} autoHideDuration={snack.autoHideDuration} onClose={handleClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
            <Alert severity={snack.severity} onClose={handleClose}>
              {snack.message}
            </Alert>
          </Snackbar>
          <CssBaseline />
          <Box display='flex' flexDirection='column' minHeight={'100vh'} >
            <Header authSession={authSession} />
            <Box
              sx={{
                width: '100%',
              }}>
              <Routes>
                <Route path='/' element={<LandingPage authSession={authSession} />} />
                <Route path='/Elections' element={<Elections authSession={authSession} />} />
                <Route path='/Login' element={<Login />} />
                <Route path='/Debug' element={<DebugPage authSession={authSession} />} />
                <Route path='/CreateElection' element={<AddElection authSession={authSession} />} />
                <Route path='/Election/:id/*' element={<Election authSession={authSession} />} />
                <Route path='/DuplicateElection/:id' element={<DuplicateElection authSession={authSession} />} />
                <Route path='/Sandbox' element={<Sandbox />} />
              </Routes>
            </Box>
            <Footer />
          </Box>
        </SnackbarContext.Provider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
