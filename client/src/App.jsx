import { Routes, Route } from 'react-router-dom';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';

// Pages
import LandingPage from './pages/LandingPage';
import DashboardHelper from './pages/Dashboard';
import InterviewPage from './pages/InterviewPage';

// Layouts
import MainLayout from './layouts/MainLayout';

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <>
            <SignedIn>
              <MainLayout>
                <DashboardHelper />
              </MainLayout>
            </SignedIn>
            <SignedOut>
              <RedirectToSignIn />
            </SignedOut>
          </>
        }
      />

      <Route
        path="/interview"
        element={
          <>
            <SignedIn>
              <MainLayout>
                <InterviewPage />
              </MainLayout>
            </SignedIn>
            <SignedOut>
              <RedirectToSignIn />
            </SignedOut>
          </>
        }
      />
    </Routes>
  );
}

export default App;
