import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import { useState, useCallback } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import SplashScreen from "./components/SplashScreen";
import Home from "./pages/Home";
import ProductList from "./pages/ProductList";
import ProductDetail from "./pages/ProductDetail";
import BrandEntry from "./pages/BrandEntry";
import MyPage from "./pages/MyPage";
import CartPage from "./pages/CartPage";
import SearchPage from "./pages/SearchPage";
import InquiryPage from "./pages/InquiryPage";
import StylingRequest from "./pages/StylingRequest";
import AIStyling from "./pages/AIStyling";
import StylingShop from "./pages/StylingShop";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import OAuthCallback from "./pages/OAuthCallback";
import SocialConsent from "./pages/SocialConsent";
import SocialProfile from "./pages/SocialProfile";
import EmailSignup from "./pages/EmailSignup";
import EmailLogin from "./pages/EmailLogin";
function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/products" component={ProductList} />
      <Route path="/products/:id" component={ProductDetail} />
      <Route path="/brand-entry" component={BrandEntry} />
      <Route path="/mypage" component={MyPage} />
      <Route path="/cart" component={CartPage} />
      <Route path="/search" component={SearchPage} />
      <Route path="/inquiry" component={InquiryPage} />
      <Route path="/styling-request" component={StylingRequest} />
      <Route path="/ai-styling" component={AIStyling} />
      <Route path="/styling-shop" component={StylingShop} />
      <Route path="/styling-shop/:id" component={StylingShop} />
      <Route path="/login" component={LoginPage} />
      <Route path="/signup" component={SignupPage} />
      <Route path="/auth/callback" component={OAuthCallback} />
      <Route path="/auth/social-consent" component={SocialConsent} />
      <Route path="/auth/social-profile" component={SocialProfile} />
      <Route path="/auth/email-signup" component={EmailSignup} />
      <Route path="/auth/email-login" component={EmailLogin} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [splashDone, setSplashDone] = useState(false);
  const handleSplashFinish = useCallback(() => setSplashDone(true), []);

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          {!splashDone && <SplashScreen onFinish={handleSplashFinish} />}
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
