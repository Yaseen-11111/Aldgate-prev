import { Link } from 'wouter';

/** Shown when the user reaches checkout with nothing in their shortlist. */
export function EmptyShortlist() {
  return (
    <div className="container mx-auto px-4 py-24 text-center">
      <h1 className="text-3xl font-serif mb-4">Your shortlist is empty</h1>
      <Link href="/catalog" className="text-primary underline">Return to collection</Link>
    </div>
  );
}
