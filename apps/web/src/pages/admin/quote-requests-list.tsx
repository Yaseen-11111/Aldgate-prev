import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import {
  QuoteRequest,
  QuoteRequestStatus,
  useUpdateQuoteRequest,
  useDeleteQuoteRequest,
  getListQuoteRequestsQueryKey,
} from '@workspace/api-client-react';
import { Download, Loader2, Pencil, Save, Trash2, X, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { requestEditSchema, type RequestEditFormValues } from './schemas';
import { useAdminQuoteRequests } from '@/hooks/use-admin-quote-requests';
import { useSearch } from '@/hooks/use-search';
import { SearchBar } from '@/pages/process/search-bar';

/** Admin list of consultation (quote) requests with inline edit, delete, and search. */
export function QuoteRequestsList() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: requests, isLoading, error, refetch } = useAdminQuoteRequests();
  const updateRequest = useUpdateQuoteRequest();
  const deleteRequest = useDeleteQuoteRequest();
  const [editingId, setEditingId] = useState<number | null>(null);

  // Search hook filtering across customer name, email, phone, postcode, and status
  const { searchQuery, setSearchQuery, filteredItems: filteredRequests } = useSearch(
      requests,
      ['name', 'email', 'phone', 'postcode', 'status']
  );

  const form = useForm<RequestEditFormValues>({
    resolver: zodResolver(requestEditSchema),
  });

  const invalidateRequests = () =>
      queryClient.invalidateQueries({ queryKey: getListQuoteRequestsQueryKey() });

  const startEdit = (request: QuoteRequest) => {
    setEditingId(request.id);
    form.reset({
      name: request.name,
      phone: request.phone,
      email: request.email,
      postcode: request.postcode,
      preferredDate: request.preferredDate,
      preferredTimeWindow: request.preferredTimeWindow,
      status: request.status,
      adminNotes: request.adminNotes,
    });
  };

  const cancelEdit = () => setEditingId(null);

  const onSaveEdit = (data: RequestEditFormValues) => {
    if (!editingId) return;
    updateRequest.mutate({ id: editingId, data }, {
      onSuccess: () => {
        toast({ title: 'Consultation request updated' });
        setEditingId(null);
        invalidateRequests();
      },
    });
  };

  const handleDelete = (id: number) => {
    if (confirm('Delete this consultation request? This cannot be undone.')) {
      deleteRequest.mutate({ id }, {
        onSuccess: () => {
          toast({ title: 'Consultation request deleted' });
          invalidateRequests();
        },
      });
    }
  };

  if (isLoading) {
    return (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-muted animate-pulse"></div>)}
        </div>
    );
  }

  if (error) {
    return <div className="border border-destructive/30 bg-destructive/5 p-6 text-destructive">Unable to load consultation requests. <button type="button" onClick={() => void refetch()} className="underline font-medium">Try again</button></div>;
  }

  return (
      <div>
        {/* Header and Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-2xl font-serif">Consultation Requests</h2>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-2xl font-serif">Catalog Inventory</h2>

              <SearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search by name, email, postcode..."
              />
            </div>
            <a href="/api/admin/quote-requests.csv"
               className="inline-flex h-10 items-center justify-center gap-2 border border-border bg-white px-4 text-sm font-medium hover:bg-muted shrink-0">
              <Download className="w-4 h-4"/> Export CSV
            </a>
          </div>
        </div>

        {/* Empty States */}
        {requests?.length === 0 ? (
            <div className="p-12 text-center bg-white border border-border">
              <p className="text-muted-foreground">No consultation requests have been submitted yet.</p>
            </div>
        ) : filteredRequests.length === 0 ? (
            <div className="p-12 text-center bg-white border border-border">
              <p className="text-muted-foreground">No requests found matching "{searchQuery}".</p>
            </div>
        ) : (
            /* Results List */
            <div className="space-y-6">
              {filteredRequests.map((request) => (
                  <div key={request.id} className="bg-white border border-border p-6 shadow-sm">
                    {editingId === request.id ? (
                        <Form {...form}>
                          <form onSubmit={form.handleSubmit(onSaveEdit)} className="space-y-6 mb-6 pb-6 border-b border-border">
                            <div className="flex items-center justify-between">
                              <h3 className="text-lg font-medium flex items-center gap-2"><Pencil className="w-4 h-4 text-blue-500" /> Edit Request</h3>
                              <button type="button" onClick={cancelEdit} className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm">
                                <X className="w-4 h-4" /> Cancel
                              </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <FormField control={form.control} name="name" render={({ field }) => (
                                  <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                              )} />
                              <FormField control={form.control} name="phone" render={({ field }) => (
                                  <FormItem><FormLabel>Phone</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                              )} />
                              <FormField control={form.control} name="email" render={({ field }) => (
                                  <FormItem><FormLabel>Email</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                              )} />
                              <FormField control={form.control} name="postcode" render={({ field }) => (
                                  <FormItem><FormLabel>Postcode</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                              )} />
                              <FormField control={form.control} name="preferredDate" render={({ field }) => (
                                  <FormItem><FormLabel>Preferred Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                              )} />
                              <FormField control={form.control} name="preferredTimeWindow" render={({ field }) => (
                                  <FormItem><FormLabel>Preferred Time Window</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                              )} />
                              <FormField control={form.control} name="status" render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Status</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                      <SelectContent>
                                        <SelectItem value={QuoteRequestStatus.pending}>Pending</SelectItem>
                                        <SelectItem value={QuoteRequestStatus.contacted}>Contacted</SelectItem>
                                        <SelectItem value={QuoteRequestStatus.confirmed}>Confirmed</SelectItem>
                                        <SelectItem value={QuoteRequestStatus.measured}>Measured</SelectItem>
                                        <SelectItem value={QuoteRequestStatus.completed}>Completed</SelectItem>
                                        <SelectItem value={QuoteRequestStatus.cancelled}>Cancelled</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                              )} />
                              <FormField control={form.control} name="adminNotes" render={({ field }) => (
                                  <FormItem className="md:col-span-2"><FormLabel>Private Admin Notes</FormLabel><FormControl><Textarea {...field} rows={4} placeholder="Visible only to admin users…" /></FormControl><FormMessage /></FormItem>
                              )} />
                            </div>
                            <button type="submit" disabled={updateRequest.isPending} className="h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center gap-2 transition-colors">
                              {updateRequest.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                              Save Changes
                            </button>
                          </form>
                        </Form>
                    ) : (
                        <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-6 pb-6 border-b border-border">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-medium">{request.name}</h3>
                              <span className="px-2.5 py-0.5 bg-secondary text-secondary-foreground text-xs font-medium uppercase tracking-wider">
                        {request.status}
                      </span>
                            </div>
                            <div className="text-sm text-foreground/70 font-light space-y-1">
                              <p>{request.email} • {request.phone}</p>
                              <p>Postcode: {request.postcode}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-left md:text-right bg-muted/50 p-4 rounded-sm">
                              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Preferred Time</p>
                              <p className="text-sm font-medium">{new Date(request.preferredDate).toLocaleDateString()} - {request.preferredTimeWindow}</p>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                  onClick={() => startEdit(request)}
                                  className="p-2 text-muted-foreground hover:text-blue-500 transition-colors"
                                  aria-label="Edit request"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                  onClick={() => handleDelete(request.id)}
                                  disabled={deleteRequest.isPending}
                                  className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                                  aria-label="Delete request"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <h4 className="text-sm font-medium tracking-wide uppercase mb-4">Requested Items ({request.items.length})</h4>
                        <ul className="space-y-3">
                          {request.items.map((item, idx) => (
                              <li key={idx} className="flex justify-between items-center text-sm p-3 bg-muted/30">
                                <span className="font-medium">{item.productName}</span>
                                <span className="text-xs uppercase text-muted-foreground">{item.category}</span>
                              </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium tracking-wide uppercase mb-4">Customer message</h4>
                        <p className="p-4 bg-muted/30 text-sm text-foreground/75 whitespace-pre-wrap">{request.customerMessage || 'No message supplied.'}</p>
                      </div>
                    </div>
                  </div>
              ))}
            </div>
        )}
      </div>
  );
}