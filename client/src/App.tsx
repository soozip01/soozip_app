import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import StylingRequest from "./pages/StylingRequest";
import AIStyling from "./pages/AIStyling";
import ProductList from "./pages/ProductList";
import ProductDetail from "./pages/ProductDetail";
import BrandEntry from "./pages/BrandEntry";
import MyPage from "./pages/MyPage";
import CartPage from "./pages/CartPage";
import SearchPage from "./pages/SearchPage";
import InquiryPage from "./pages/InquiryPage";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/styling-request" component={StylingRequest} />
      <Route path="/ai-styling" component={AIStyling} />
      <Route path="/products" component={ProductList} />
      <Route path="/products/:id" component={ProductDetail} />
      <Route path="/brand-entry" component={BrandEntry} />
      <Route path="/mypage" component={MyPage} />
      <Route path="/cart" component={CartPage} />
      <Route path="/search" component={SearchPage} />
      <Route path="/inquiry" component={InquiryPage} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
