import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import { useState, useCallback } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { SoozipAuthProvider } from "./contexts/AuthContext";
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
import StylingMain from "./pages/StylingMain";
import StylingTypes from "./pages/StylingTypes";
import StylingTypeFurniture from "./pages/StylingTypeFurniture";
import StylingTypeFullOnline from "./pages/StylingTypeFullOnline";
import StylingTypeFullOffline from "./pages/StylingTypeFullOffline";
import StylingFAQ from "./pages/StylingFAQ";
import AIStyling from "./pages/AIStyling";
import StylingShop from "./pages/StylingShop";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import OAuthCallback from "./pages/OAuthCallback";
import SocialComplete from "./pages/SocialComplete";
import SocialConsent from "./pages/SocialConsent";
import SocialProfile from "./pages/SocialProfile";
import EmailSignup from "./pages/EmailSignup";
import EmailLogin from "./pages/EmailLogin";
import SettingsPage from "./pages/SettingsPage";
import DesignerList from "./pages/DesignerList";
import DesignerProfile from "./pages/DesignerProfile";
import DesignerApply from "./pages/DesignerApply";
import BookingCalendar from "./pages/BookingCalendar";
import BookingComplete from "./pages/BookingComplete";
import StylingRequestForm from "./pages/StylingRequestForm";
import StylingRequestList from "./pages/StylingRequestList";
import StylingRequestEmbed from "./pages/StylingRequestEmbed";
import FurnitureInfoForm from "./pages/FurnitureInfoForm";
import StylingStep1 from "./pages/StylingStep1";
import StylingStep2 from "./pages/StylingStep2";
import StylingStep3 from "./pages/StylingStep3";
import StylingStep4 from "./pages/StylingStep4";
import StylingStep5 from "./pages/StylingStep5";
import StylingStep6 from "./pages/StylingStep6";
import StylingStep7 from "./pages/StylingStep7";
import FinalStylingDelivery from "./pages/FinalStylingDelivery";
import ProfileEdit from "./pages/ProfileEdit";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/products" component={ProductList} />
      <Route path="/products/:id" component={ProductDetail} />
      <Route path="/brand-entry" component={BrandEntry} />
      <Route path="/mypage" component={MyPage} />
      <Route path="/my" component={MyPage} />
      <Route path="/cart" component={CartPage} />
      <Route path="/search" component={SearchPage} />
      <Route path="/inquiry" component={InquiryPage} />
      <Route path="/styling-request" component={StylingRequest} />
      <Route path="/styling" component={StylingMain} />
      <Route path="/styling/types" component={StylingTypes} />
      <Route path="/styling/types/furniture" component={StylingTypeFurniture} />
      <Route path="/styling/types/full-online" component={StylingTypeFullOnline} />
      <Route path="/styling/types/full-offline" component={StylingTypeFullOffline} />
      <Route path="/styling/faq" component={StylingFAQ} />
      <Route path="/ai-styling" component={AIStyling} />
      <Route path="/styling-shop" component={StylingShop} />
      <Route path="/styling-shop/:id" component={StylingShop} />
      <Route path="/login" component={LoginPage} />
      <Route path="/signup" component={SignupPage} />
      <Route path="/auth/callback" component={OAuthCallback} />
      <Route path="/auth/callback/kakao" component={OAuthCallback} />
      <Route path="/auth/callback/naver" component={OAuthCallback} />
      <Route path="/auth/social-complete" component={SocialComplete} />
      <Route path="/auth/social-consent" component={SocialConsent} />
      <Route path="/auth/social-profile" component={SocialProfile} />
      <Route path="/auth/email-signup" component={EmailSignup} />
      <Route path="/auth/email-login" component={EmailLogin} />
      <Route path="/settings" component={SettingsPage} />
      <Route path="/designers" component={DesignerList} />
      <Route path="/designers/apply" component={DesignerApply} />
      <Route path="/designers/:id" component={DesignerProfile} />
      <Route path="/booking" component={BookingCalendar} />
      <Route path="/booking/complete" component={BookingComplete} />
      <Route path="/styling-request-form" component={StylingRequestForm} />
      <Route path="/styling/request" component={StylingRequestForm} />
      <Route path="/styling-request-embed" component={StylingRequestEmbed} />
      <Route path="/styling-requests" component={StylingRequestList} />
      <Route path="/styling/furniture-info" component={FurnitureInfoForm} />
      <Route path="/styling/step1" component={StylingStep1} />
      <Route path="/styling/step2" component={StylingStep2} />
      <Route path="/styling/step3" component={StylingStep3} />
      <Route path="/styling/step4" component={StylingStep4} />
      <Route path="/styling/step5" component={StylingStep5} />
      <Route path="/styling/step6" component={StylingStep6} />
      <Route path="/styling/step7" component={StylingStep7} />
      <Route path="/styling/final-delivery" component={FinalStylingDelivery} />
      <Route path="/profile/edit" component={ProfileEdit} />
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
        <SoozipAuthProvider>
          <TooltipProvider>
            <Toaster />
            {!splashDone && <SplashScreen onFinish={handleSplashFinish} />}
            <Router />
          </TooltipProvider>
        </SoozipAuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
