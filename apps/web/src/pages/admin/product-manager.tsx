import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useSearch } from '@/hooks/use-search';
import { SearchBar } from '@/pages/process/search-bar';

import {
    ProductCategory,
    Product,
    useListProducts,
    useCreateProduct,
    useUpdateProduct,
    useDeleteProduct,
    getListProductsQueryKey,
} from '@workspace/api-client-react';
import { uploadGalleryMedia } from '@/lib/gallery-api';
import { Loader2, PackagePlus, Trash2, Plus, Pencil, Save, X, ImagePlus, GripVertical, Star } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { productSchema, type ProductFormValues } from './schemas';
import { MediaDropzone } from './MediaDropzone';

const EMPTY_PRODUCT: ProductFormValues = {
    name: '',
    category: ProductCategory.roller,
    materials: '',
    fabricOptions: '',
    description: '',
    images: [],
};

interface ProductImagesFieldProps {
    value: string[];
    onChange: (images: string[]) => void;
}

function ProductImagesField({ value = [], onChange }: ProductImagesFieldProps) {
    const { toast } = useToast();
    const [isUploading, setIsUploading] = useState(false);
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

    // Map to unique stable IDs so dnd-kit never breaks on duplicate URLs
    const items = value.map((url, index) => ({ id: `${url}-${index}`, url }));

    const handleUpload = async (files: File[]) => {
        setIsUploading(true);
        try {
            const uploadedMedia = await Promise.all(files.map((file) => uploadGalleryMedia(file)));
            const newUrls = uploadedMedia.map((m) => m.src);
            onChange([...value, ...newUrls]);
            toast({ title: `${files.length} image${files.length === 1 ? '' : 's'} added` });
        } catch (error) {
            toast({
                title: 'Upload failed',
                description: error instanceof Error ? error.message : 'Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsUploading(false);
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        if (oldIndex !== -1 && newIndex !== -1) {
            onChange(arrayMove(value, oldIndex, newIndex));
        }
    };

    const setAsCover = (index: number) => {
        if (index === 0) return;
        const reordered = [value[index], ...value.filter((_, i) => i !== index)];
        onChange(reordered);
        toast({ title: 'Set as cover photo' });
    };

    const removeImage = (indexToRemove: number) => {
        onChange(value.filter((_, idx) => idx !== indexToRemove));
    };

    return (
        <div className="space-y-4">
            <MediaDropzone
                onFilesSelected={handleUpload}
                accept="image/*"
                isUploading={isUploading}
                title="Drag & drop product images here, or click to browse"
                description="PNG, JPG, WEBP up to 25MB"
                buttonText="Select Images"
                className="p-6"
                icon={<ImagePlus className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />}
            />

            {items.length > 0 && (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={items.map((i) => i.id)} strategy={rectSortingStrategy}>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {items.map((item, index) => (
                                <SortableImageTile
                                    key={item.id}
                                    id={item.id}
                                    url={item.url}
                                    index={index}
                                    onMakeCover={() => setAsCover(index)}
                                    onRemove={() => removeImage(index)}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            )}
        </div>
    );
}

function SortableImageTile({
                               id,
                               url,
                               index,
                               onMakeCover,
                               onRemove,
                           }: {
    id: string;
    url: string;
    index: number;
    onMakeCover: () => void;
    onRemove: () => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
    const style = { transform: CSS.Transform.toString(transform), transition };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`relative group aspect-square border border-border bg-white overflow-hidden select-none ${
                isDragging ? 'opacity-50 z-20 scale-105 shadow-md' : ''
            }`}
        >
            <img src={url} alt={`Product thumbnail ${index + 1}`} className="w-full h-full object-cover pointer-events-none" />

            {/* Drag handle covering the tile image */}
            <div
                {...attributes}
                {...listeners}
                className="absolute inset-0 cursor-grab active:cursor-grabbing bg-black/0 hover:bg-black/10 transition-colors"
            />

            {/* Top overlay controls */}
            <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
        <span className="w-7 h-7 bg-white/95 text-foreground flex items-center justify-center rounded shadow-xs pointer-events-auto cursor-grab active:cursor-grabbing">
          <GripVertical className="w-3.5 h-3.5" />
        </span>

                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove();
                    }}
                    className="w-7 h-7 bg-white/95 hover:bg-destructive hover:text-white text-destructive flex items-center justify-center rounded shadow-xs pointer-events-auto transition-colors"
                    aria-label="Remove image"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            </div>

            {/* Cover photo status and 1-click 'Set as Cover' action */}
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                {index === 0 ? (
                    <span className="bg-primary text-primary-foreground text-[10px] px-2 py-1 rounded font-medium shadow-xs flex items-center gap-1">
            <Star className="w-3 h-3 fill-current" /> Cover Photo
          </span>
                ) : (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onMakeCover();
                        }}
                        className="bg-white/95 hover:bg-primary hover:text-white text-foreground text-[10px] px-2 py-1 rounded font-medium shadow-xs transition-colors pointer-events-auto opacity-0 group-hover:opacity-100"
                    >
                        Set as Cover
                    </button>
                )}
            </div>
        </div>
    );
}

export function ProductManager() {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const { data: products, isLoading } = useListProducts();
    const createProduct = useCreateProduct();
    const updateProduct = useUpdateProduct();
    const deleteProduct = useDeleteProduct();

    const { searchQuery, setSearchQuery, filteredItems: filteredProducts } = useSearch(products, ['name', 'category']);
    const [editingId, setEditingId] = useState<number | null>(null);

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema),
        defaultValues: EMPTY_PRODUCT,
    });

    const invalidateProducts = () => queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });

    const onSubmit = (data: ProductFormValues) => {
        const payload = {
            ...data,
            fabricOptions: data.fabricOptions.split(',').map((s) => s.trim()).filter(Boolean),
        };

        if (editingId) {
            updateProduct.mutate(
                { id: editingId, data: payload },
                {
                    onSuccess: () => {
                        toast({ title: 'Product updated successfully' });
                        form.reset(EMPTY_PRODUCT);
                        setEditingId(null);
                        invalidateProducts();
                    },
                }
            );
        } else {
            createProduct.mutate(
                { data: payload },
                {
                    onSuccess: () => {
                        toast({ title: 'Product created successfully' });
                        form.reset(EMPTY_PRODUCT);
                        invalidateProducts();
                    },
                }
            );
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
            deleteProduct.mutate(
                { id },
                {
                    onSuccess: () => {
                        toast({ title: 'Product deleted' });
                        invalidateProducts();
                    },
                }
            );
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
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Product Name</FormLabel>
                                        <FormControl><Input {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
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
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="materials"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Materials summary</FormLabel>
                                        <FormControl><Input {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="fabricOptions"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Fabric Options (comma separated)</FormLabel>
                                        <FormControl><Input {...field} placeholder="Linen, Cotton, Blackout..." /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="images"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Product Photos</FormLabel>
                                    <FormControl>
                                        <ProductImagesField value={field.value} onChange={field.onChange} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl><Textarea className="resize-none" rows={4} {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <button
                            type="submit"
                            disabled={isPending}
                            className={`h-12 px-8 font-medium flex items-center gap-2 transition-colors text-white ${
                                editingId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-primary hover:bg-primary/90'
                            }`}
                        >
                            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : editingId ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                            {editingId ? 'Save Changes' : 'Create Product'}
                        </button>
                    </form>
                </Form>
            </div>

            <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <h2 className="text-2xl font-serif">Catalog Inventory</h2>
                    <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search products..." />
                </div>

                {isLoading ? (
                    <div className="h-32 bg-muted animate-pulse" />
                ) : (
                    <div className="bg-white border border-border divide-y divide-border">
                        {filteredProducts.map((product) => (
                            <div key={product.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-muted overflow-hidden shrink-0">
                                        {product.images?.[0] ? (
                                            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-muted flex items-center justify-center text-xs text-muted-foreground">No image</div>
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">{product.name}</p>
                                        <p className="text-xs text-muted-foreground uppercase mt-0.5">{product.category}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => handleEdit(product)} className="p-2 text-muted-foreground hover:text-blue-500 transition-colors">
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDelete(product.id)} disabled={deleteProduct.isPending} className="p-2 text-muted-foreground hover:text-destructive transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}

                        {products?.length === 0 && <div className="p-8 text-center text-muted-foreground">No products in catalog.</div>}
                        {products?.length !== 0 && filteredProducts.length === 0 && (
                            <div className="p-8 text-center text-muted-foreground">No results found for "{searchQuery}".</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}