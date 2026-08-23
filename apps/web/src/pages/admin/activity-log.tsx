import { useQuery } from '@tanstack/react-query';

type AuditEvent = {
  id: number;
  actorEmail: string;
  action: string;
  targetType: string;
  targetId: number | null;
  createdAt: string;
};

/** Last 100 privileged changes recorded against the verified Cloudflare Access identity. */
export function ActivityLog() {
  const { data: events = [], isLoading, error } = useQuery({
    queryKey: ['admin-audit-events'],
    queryFn: async () => {
      const response = await fetch('/api/admin/audit-events', { credentials: 'same-origin' });
      if (!response.ok) throw new Error('Unable to load activity history. Run the latest D1 migration, then try again.');
      return response.json() as Promise<AuditEvent[]>;
    },
  });

  return (
    <section>
      <div className="mb-6"><h2 className="text-2xl font-serif">Admin activity</h2><p className="text-sm text-muted-foreground mt-1">Last 100 privileged changes made by authenticated administrators.</p></div>
      {isLoading ? <div className="h-52 bg-muted animate-pulse" /> : error ? <div className="border border-destructive/30 bg-destructive/5 p-5 text-destructive">{error.message}</div> : events.length === 0 ? <div className="border border-border bg-white p-12 text-center text-muted-foreground">No administrative changes have been recorded yet.</div> : (
        <div className="border border-border bg-white divide-y divide-border">
          {events.map((event) => <div key={event.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2"><p><span className="font-medium">{event.actorEmail}</span> <span className="text-muted-foreground">{event.action} {event.targetType}{event.targetId ? ` #${event.targetId}` : ''}</span></p><time className="text-xs text-muted-foreground">{new Date(event.createdAt).toLocaleString()}</time></div>)}
        </div>
      )}
    </section>
  );
}
