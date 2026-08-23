import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { Layout } from '@/components/layout';

import Home from '@/pages/home';
import Catalog from '@/pages/catalog';
import ProductDetail from '@/pages/product-detail';
import Quote from '@/pages/quote';
import Checkout from '@/pages/checkout';
import AdminPortal from '@/pages/admin';
import Process from '@/pages/process';
import Gallery from '@/pages/gallery';

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/catalog" component={Catalog} />
        <Route path="/catalog/:id" component={ProductDetail} />
        <Route path="/quote" component={Quote} />
        <Route path="/checkout" component={Checkout} />
        <Route path="/admin" component={AdminPortal} />
        <Route path="/about" component={Process} />
        <Route path="/gallery" component={Gallery} />
        
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
