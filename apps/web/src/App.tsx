import { lazy, Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { Layout } from '@/components/layout';
import { Seo } from '@/components/seo';


const Home = lazy(() => import('@/pages/home'));
const Catalog = lazy(() => import('@/pages/catalog'));
const ProductDetail = lazy(() => import('@/pages/product-detail'));
const Quote = lazy(() => import('@/pages/quote'));
const Checkout = lazy(() => import('@/pages/checkout'));
const AdminPortal = lazy(() => import('@/pages/admin'));
const Process = lazy(() => import('@/pages/process'));
const Gallery = lazy(() => import('@/pages/gallery'));
const NotFound = lazy(() => import('@/pages/not-found'));
import { DoubleLoopShutterScrollbar } from '@/components/double-loop-shutter-scrollbar.tsx';

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Suspense fallback={<div className="min-h-[60vh]" aria-label="Loading page" />}>
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
      </Suspense>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Seo />
          <DoubleLoopShutterScrollbar />
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
