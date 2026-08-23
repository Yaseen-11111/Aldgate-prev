import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import {
  ProductCategory,
  Product,
  useListProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  getListProductsQueryKey,
} from '@workspace/api-client-react';
import { Loader2, PackagePlus, Trash2, Plus, Pencil, Save, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ImagesField } from '@/components/admin/images-field';
import { productSchema, type ProductFormValues } from './schemas';

const EMPTY_PRODUCT: ProductFormValues = {
  name: '',
  category: ProductCategory.roller,
  materials: '',
  fabricOptions: '',
  description: '',
  images: [],
};

/** Admin catalog manager: create, edit, and delete products with a drag-and-drop image list. */
export function ProductManager() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: products, isLoading } = useListProducts();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const [editingId, setEditingId] = useState<number | null>(null);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: EMPTY_PRODUCT,
  });

  const invalidateProducts = () =>
    queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });

  const onSubmit = (data: ProductFormValues) => {
    const payload = {
      ...data,
      fabricOptions: data.fabricOptions.split(',').map((s) => s.trim()).filter(Boolean),
    };

    if (editingId) {
      updateProduct.mutate({ id: editingId, data: payload }, {
        onSuccess: () => {
          toast({ title: 'Product updated successfully' });
          form.reset(EMPTY_PRODUCT);
          setEditingId(null);
          invalidateProducts();
        },
      });
    } else {
      createProduct.mutate({ data: payload }, {
        onSuccess: () => {
          toast({ title: 'Product created successfully' });
          form.reset(EMPTY_PRODUCT);
          invalidateProducts();
        },
      });
    }
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    form.reset({
      name: product.name,
      category: product.category as ProductCategory,
      materials: product.materials,
      fabricOptions: product.fabricOptions.join(', '),
      description: product.description,
      images: product.images,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    form.reset(EMPTY_PRODUCT);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this product?')) {
      deleteProduct.mutate({ id }, {
        onSuccess: () => {
          toast({ title: 'Product deleted' });
          invalidateProducts();
        },
      });
    }
  };

  const isPending = createProduct.isPending || updateProduct.isPending;

  return (
    <div className="space-y-12">
      <div className="bg-white border border-border p-8 shadow-sm transition-all duration-300">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <PackagePlus className={`w-5 h-5 ${editingId ? 'text-blue-500' : 'text-accent'}`} />
            <h2 className="text-xl font-medium">{editingId ? 'Edit Product' : 'Add New Product'}</h2>
          </div>
          {editingId && (
            <button onClick={cancelEdit} className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm">
              <X className="w-4 h-4" /> Cancel Edit
            </button>
          )}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Product Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />

              <FormField control={form.control} name="category" render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value={ProductCategory.roller}>Roller Blinds</SelectItem>
                      <SelectItem value={ProductCategory.venetian}>Venetian Blinds</SelectItem>
                      <SelectItem value={ProductCategory.roman}>Roman Blinds</SelectItem>
                      <SelectItem value={ProductCategory.shutter}>Plantation Shutters</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="materials" render={({ field }) => (
                <FormItem><FormLabel>Materials summary</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />

              <FormField control={form.control} name="fabricOptions" render={({ field }) => (
                <FormItem><FormLabel>Fabric Options (comma separated)</FormLabel><FormControl><Input {...field} placeholder="Linen, Cotton, Blackout..." /></FormControl><FormMessage /></FormItem>
              )} />
            </div>

            <FormField control={form.control} name="images" render={({ field }) => (
              <FormItem>
                <FormLabel>Product Photos</FormLabel>
                <FormControl>
                  <ImagesField value={field.value} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea className="resize-none" rows={4} {...field} /></FormControl><FormMessage /></FormItem>
            )} />

            <button type="submit" disabled={isPending} className={`h-12 px-8 font-medium flex items-center gap-2 transition-colors text-white ${editingId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-primary hover:bg-primary/90'}`}>
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : editingId ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {editingId ? 'Save Changes' : 'Create Product'}
            </button>
          </form>
        </Form>
      </div>

      <div>
        <h2 className="text-2xl font-serif mb-6">Catalog Inventory</h2>
        {isLoading ? (
          <div className="h-32 bg-muted animate-pulse"></div>
        ) : (
          <div className="bg-white border border-border divide-y divide-border">
            {products?.map((product) => (
              <div key={product.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-muted overflow-hidden shrink-0">
                    <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{product.name}</p>
                    <p className="text-xs text-muted-foreground uppercase mt-0.5">{product.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="p-2 text-muted-foreground hover:text-blue-500 transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    disabled={deleteProduct.isPending}
                    className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {products?.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">No products in catalog.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
