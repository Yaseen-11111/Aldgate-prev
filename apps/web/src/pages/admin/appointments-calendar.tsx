import { useListQuoteRequests } from '@workspace/api-client-react';

const timeWindows = ['Morning (9am - 12pm)', 'Afternoon (12pm - 4pm)', 'Evening (4pm - 7pm)'];

/** A compact operational calendar for appointment slots requested by customers. */
export function AppointmentsCalendar() {
  const { data: requests = [], isLoading } = useListQuoteRequests();
  const activeRequests = requests.filter((request) => request.status !== 'completed');
  const byDate = new Map<string, typeof activeRequests>();

  for (const request of activeRequests) {
    const date = request.preferredDate.slice(0, 10);
    byDate.set(date, [...(byDate.get(date) ?? []), request]);
  }

  const days = [...byDate.entries()].sort(([left], [right]) => left.localeCompare(right));

  return (
    <section>
      <div className="mb-6">
        <h2 className="text-2xl font-serif">Appointment calendar</h2>
        <p className="text-sm text-muted-foreground mt-1">Active customer appointments grouped by requested date and time. Completed requests are excluded.</p>
      </div>
      {isLoading ? <div className="h-52 bg-muted animate-pulse" /> : days.length === 0 ? (
        <div className="border border-border bg-white p-12 text-center text-muted-foreground">No active appointments scheduled.</div>
      ) : (
        <div className="space-y-5">
          {days.map(([date, dayRequests]) => (
            <div key={date} className="border border-border bg-white overflow-hidden">
              <div className="px-5 py-4 border-b border-border flex justify-between gap-4">
                <h3 className="font-medium">{new Date(`${date}T12:00:00`).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</h3>
                <span className="text-sm text-muted-foreground">{dayRequests.length} appointment{dayRequests.length === 1 ? '' : 's'}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
                {timeWindows.map((timeWindow) => {
                  const slots = dayRequests.filter((request) => request.preferredTimeWindow === timeWindow);
                  return <div key={timeWindow} className="p-5 min-h-32"><p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">{timeWindow}</p>{slots.length > 0 ? <div className="space-y-2">{slots.map((request) => <div key={request.id} className="bg-muted px-3 py-2 text-sm"><p className="font-medium">{request.name}</p><p className="text-muted-foreground text-xs">{request.postcode} · {request.status}</p></div>)}</div> : <p className="text-sm text-muted-foreground">Available</p>}</div>;
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
