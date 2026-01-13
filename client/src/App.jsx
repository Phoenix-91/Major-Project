import { Routes, Route } from 'react-router-dom';
import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';

// Pages (to be created)
import LandingPage from './pages/LandingPage';
import DashboardHelper from './pages/Dashboard';
import InterviewPage from './pages/InterviewPage';

// Layouts
import MainLayout from './layouts/MainLayout';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

function App() {
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
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
    </ClerkProvider>
  );
}

export default App;
