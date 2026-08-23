import { useGetQuoteRequestSummary } from '@workspace/api-client-react';
import { LineChart } from 'lucide-react';

/** Sidebar summary card showing consultation-request KPIs. */
export function DashboardStats() {
  const { data, isLoading } = useGetQuoteRequestSummary();

  if (isLoading) return <div className="h-64 bg-muted animate-pulse"></div>;

  return (
    <div className="bg-primary text-primary-foreground p-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 opacity-10">
        <LineChart className="w-32 h-32" />
      </div>
      <h2 className="text-xl font-serif mb-8 relative z-10">Consultation Requests</h2>

      <div className="space-y-6 relative z-10">
        <div>
          <p className="text-primary-foreground/70 text-sm font-light uppercase tracking-wider mb-1">Pending Follow-ups</p>
          <p className="text-5xl font-light">{data?.totalPending || 0}</p>
        </div>
        <div>
          <p className="text-primary-foreground/70 text-sm font-light uppercase tracking-wider mb-1">Requests This Week</p>
          <p className="text-3xl font-light">{data?.totalThisWeek || 0}</p>
        </div>
        <div>
          <p className="text-primary-foreground/70 text-sm font-light uppercase tracking-wider mb-1">Total Items Requested</p>
          <p className="text-2xl font-light">{data?.totalItemsRequested || 0}</p>
        </div>
      </div>
    </div>
  );
}
