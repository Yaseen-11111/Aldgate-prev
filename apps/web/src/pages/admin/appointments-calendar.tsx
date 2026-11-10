import { useState, type PointerEvent } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useQueryClient } from "@tanstack/react-query";
import {
  useUpdateQuoteRequest,
  getListQuoteRequestsQueryKey,
  type QuoteRequest,
} from "@workspace/api-client-react";
import { Maximize2, Minimize2, Minus, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAdminQuoteRequests } from "@/hooks/use-admin-quote-requests";
import { Textarea } from "@/components/ui/textarea";

const timeWindows = [
  "Morning (9am - 12pm)",
  "Afternoon (12pm - 4pm)",
  "Evening (4pm - 7pm)",
];
type Position = { x: number; y: number };

/** Operational calendar with draggable, resizable client detail windows. */
export function AppointmentsCalendar() {
  const {
    data: requests = [],
    isLoading,
    error,
    refetch,
  } = useAdminQuoteRequests();
  const [selected, setSelected] = useState<QuoteRequest | null>(null);
  const [notes, setNotes] = useState("");
  const [minimized, setMinimized] = useState(false);
  const [maximized, setMaximized] = useState(false);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const queryClient = useQueryClient();
  const updateRequest = useUpdateQuoteRequest();
  const { toast } = useToast();
  const activeRequests = requests.filter(
    (request) => request.status !== "completed",
  );
  const byDate = new Map<string, typeof activeRequests>();

  for (const request of activeRequests) {
    const date = request.preferredDate.slice(0, 10);
    byDate.set(date, [...(byDate.get(date) ?? []), request]);
  }

  const openRequest = (request: QuoteRequest) => {
    setSelected(request);
    setNotes(request.adminNotes ?? "");
    setPosition({ x: 0, y: 0 });
    setMinimized(false);
    setMaximized(false);
  };

  const saveNotes = () => {
    if (!selected) return;
    updateRequest.mutate(
      { id: selected.id, data: { adminNotes: notes } },
      {
        onSuccess: (saved) => {
          setSelected((current) =>
            current?.id === saved.id ? saved : current,
          );
          queryClient.setQueryData(
            getListQuoteRequestsQueryKey(),
            (current: QuoteRequest[] | undefined) =>
              current?.map((request) =>
                request.id === saved.id ? saved : request,
              ),
          );
          toast({ title: "Client notes saved" });
        },
        onError: () =>
          toast({
            title: "Could not save notes",
            description: "Please try again.",
            variant: "destructive",
          }),
      },
    );
  };

  const startDrag = (event: PointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("button")) return;
    const origin = { x: event.clientX, y: event.clientY };
    const initial = { ...position };
    const move = (moveEvent: globalThis.PointerEvent) =>
      setPosition({
        x: initial.x + moveEvent.clientX - origin.x,
        y: initial.y + moveEvent.clientY - origin.y,
      });
    const stop = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", stop);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", stop, { once: true });
  };

  const close = () => {
    setSelected(null);
    setMinimized(false);
    setMaximized(false);
  };

  return (
    <section>
      <div className="mb-6">
        <h2 className="text-2xl font-serif">Appointment calendar</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Active customer appointments grouped by requested date and time.
          Select a card to view client details and notes.
        </p>
      </div>
      {isLoading ? (
        <div className="h-52 animate-pulse bg-muted" />
      ) : error ? (
        <div className="border border-destructive/30 bg-destructive/5 p-6 text-destructive">
          Unable to load appointments.{" "}
          <button
            type="button"
            onClick={() => void refetch()}
            className="underline"
          >
            Try again
          </button>
        </div>
      ) : byDate.size === 0 ? (
        <div className="border border-border bg-white p-12 text-center text-muted-foreground">
          No active appointments scheduled.
        </div>
      ) : (
        <div className="space-y-5">
          {[...byDate.entries()]
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, dayRequests]) => (
              <div
                key={date}
                className="overflow-hidden border border-border bg-white"
              >
                <div className="flex justify-between gap-4 border-b border-border px-5 py-4">
                  <h3 className="font-medium">
                    {new Date(`${date}T12:00:00`).toLocaleDateString(
                      undefined,
                      {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      },
                    )}
                  </h3>
                  <span className="text-sm text-muted-foreground">
                    {dayRequests.length} appointment
                    {dayRequests.length === 1 ? "" : "s"}
                  </span>
                </div>
                <div className="grid grid-cols-1 divide-y divide-border md:grid-cols-3 md:divide-x md:divide-y-0">
                  {timeWindows.map((timeWindow) => {
                    const slots = dayRequests.filter(
                      (request) => request.preferredTimeWindow === timeWindow,
                    );
                    return (
                      <div key={timeWindow} className="min-h-32 p-5">
                        <p className="mb-3 text-xs uppercase tracking-wider text-muted-foreground">
                          {timeWindow}
                        </p>
                        {slots.length ? (
                          <div className="space-y-2">
                            {slots.map((request) => (
                              <button
                                key={request.id}
                                type="button"
                                onClick={() => openRequest(request)}
                                className="w-full bg-muted px-3 py-2 text-left text-sm transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                              >
                                <p className="font-medium">{request.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {request.postcode} · {request.status}
                                </p>
                                <span className="sr-only">
                                  Open consultation details
                                </span>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            Available
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
        </div>
      )}

      <DialogPrimitive.Root
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) close();
        }}
      >
        {selected && (
          <DialogPrimitive.Portal>
            <DialogPrimitive.Overlay className="fixed inset-0 z-[70] bg-black/35" />
            <DialogPrimitive.Content
              className={`fixed z-[71] flex flex-col overflow-hidden border border-border bg-background shadow-2xl ${maximized ? "inset-3" : `left-1/2 top-1/2 h-[min(680px,90vh)] w-[min(760px,94vw)] -translate-x-1/2 -translate-y-1/2 ${minimized ? "h-auto w-[min(420px,94vw)] resize-none" : "resize"}`}`}
              style={
                !maximized
                  ? {
                      transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`,
                      minWidth: 320,
                      minHeight: minimized ? undefined : 300,
                    }
                  : undefined
              }
            >
              <div
                onPointerDown={startDrag}
                className="flex shrink-0 cursor-move items-center gap-2 border-b border-border bg-secondary/70 px-4 py-3 select-none"
              >
                <div className="flex gap-2" aria-label="Window controls">
                  <button
                    type="button"
                    onClick={close}
                    aria-label="Close window"
                    className="h-3 w-3 rounded-full bg-[#ed6a5e] ring-1 ring-black/10"
                  />
                  <button
                    type="button"
                    onClick={() => setMinimized(!minimized)}
                    aria-label={
                      minimized ? "Restore window" : "Minimize window"
                    }
                    className="flex h-3 w-3 items-center justify-center rounded-full bg-[#f4bf4f] ring-1 ring-black/10"
                  >
                    <Minus className="h-2 w-2 text-black/60" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setMaximized(!maximized)}
                    aria-label={
                      maximized ? "Restore window size" : "Maximize window"
                    }
                    className="flex h-3 w-3 items-center justify-center rounded-full bg-[#61c554] ring-1 ring-black/10"
                  >
                    {maximized ? (
                      <Minimize2 className="h-2 w-2 text-black/60" />
                    ) : (
                      <Maximize2 className="h-2 w-2 text-black/60" />
                    )}
                  </button>
                </div>
                <DialogPrimitive.Title className="ml-2 flex-1 truncate text-sm font-medium">
                  {selected.name} · consultation
                </DialogPrimitive.Title>
                <DialogPrimitive.Description className="sr-only">
                  Client details, appointment information, selected products and
                  private admin notes.
                </DialogPrimitive.Description>
                <span className="hidden text-xs text-muted-foreground sm:inline">
                  Drag to move · resize from corner
                </span>
              </div>
              {!minimized && (
                <div className="min-h-0 flex-1 overflow-y-auto p-5 md:p-7">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-3">
                      <h3 className="font-serif text-2xl">Client details</h3>
                      <p>
                        <span className="text-muted-foreground">Email</span>
                        <br />
                        <a
                          className="underline decoration-border underline-offset-4"
                          href={`mailto:${selected.email}`}
                        >
                          {selected.email}
                        </a>
                      </p>
                      <p>
                        <span className="text-muted-foreground">Phone</span>
                        <br />
                        <a
                          className="underline decoration-border underline-offset-4"
                          href={`tel:${selected.phone}`}
                        >
                          {selected.phone}
                        </a>
                      </p>
                      <p>
                        <span className="text-muted-foreground">Postcode</span>
                        <br />
                        {selected.postcode}
                      </p>
                    </div>
                    <div className="space-y-3">
                      <h3 className="font-serif text-2xl">
                        Requested appointment
                      </h3>
                      <p>
                        {new Date(selected.preferredDate).toLocaleDateString(
                          undefined,
                          {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          },
                        )}
                        <br />
                        {selected.preferredTimeWindow}
                      </p>
                      <p className="capitalize">Status: {selected.status}</p>
                    </div>
                  </div>
                  <div className="mt-7 border-t border-border pt-6">
                    <h3 className="mb-3 font-serif text-2xl">
                      Private client notes
                    </h3>
                    <p className="mb-3 text-sm text-muted-foreground">
                      Visible to administrators only; saved to this consultation
                      record.
                    </p>
                    <Textarea
                      value={notes}
                      onChange={(event) => setNotes(event.target.value)}
                      maxLength={5000}
                      rows={8}
                      placeholder="Add measurements, preferences, follow-up details…"
                      aria-label="Private client notes"
                    />
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <span className="text-xs text-muted-foreground">
                        {notes.length}/5000
                      </span>
                      <button
                        type="button"
                        onClick={saveNotes}
                        disabled={
                          updateRequest.isPending ||
                          notes === (selected.adminNotes ?? "")
                        }
                        className="inline-flex h-10 items-center gap-2 bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                      >
                        <Save className="h-4 w-4" />
                        {updateRequest.isPending ? "Saving…" : "Save notes"}
                      </button>
                    </div>
                  </div>
                  {selected.items.length > 0 && (
                    <div className="mt-7 border-t border-border pt-6">
                      <h3 className="mb-3 font-serif text-xl">
                        Selected products
                      </h3>
                      <ul className="flex flex-wrap gap-2">
                        {selected.items.map((item, index) => (
                          <li
                            key={`${item.productId}-${index}`}
                            className="border border-border bg-white px-3 py-2 text-sm"
                          >
                            {item.productName}
                            <span className="ml-2 text-xs text-muted-foreground">
                              {item.category}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {selected.customerMessage && (
                    <div className="mt-7 border-t border-border pt-6">
                      <h3 className="mb-3 font-serif text-xl">
                        Customer message
                      </h3>
                      <p className="whitespace-pre-wrap text-sm text-foreground/80">
                        {selected.customerMessage}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        )}
      </DialogPrimitive.Root>
    </section>
  );
}
