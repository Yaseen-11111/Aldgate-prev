import { useRef, useState } from 'react';
import { ImagePlus, Loader2, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export interface MediaDropzoneProps {
    onFilesSelected: (files: File[]) => void | Promise<void>;
    accept?: string;
    multiple?: boolean;
    maxSizeBytes?: number; // Defaults to 25 MB
    isUploading?: boolean;
    title?: string;
    description?: string;
    buttonText?: string;
    className?: string;
    icon?: React.ReactNode;
}

export function MediaDropzone({
                                  onFilesSelected,
                                  accept = 'image/*,video/*',
                                  multiple = true,
                                  maxSizeBytes = 25 * 1024 * 1024,
                                  isUploading = false,
                                  title = 'Add gallery cards',
                                  description = 'Drop images or videos here, or click to browse.',
                                  buttonText = 'Choose media',
                                  className = '',
                                  icon,
                              }: MediaDropzoneProps) {
    const { toast } = useToast();
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDraggingOver, setIsDraggingOver] = useState(false);

    const processFiles = (fileList: FileList | File[]) => {
        const files = Array.from(fileList);
        if (files.length === 0) return;

        // Filter files matching the general accept types (images & videos)
        const validTypes = files.filter((file) => {
            if (accept.includes('image/*') && file.type.startsWith('image/')) return true;
            if (accept.includes('video/*') && file.type.startsWith('video/')) return true;
            return false;
        });

        if (validTypes.length === 0) {
            toast({ title: 'Invalid file type', description: 'Please select valid media files.', variant: 'destructive' });
            return;
        }

        if (validTypes.some((file) => file.size > maxSizeBytes)) {
            const sizeMb = Math.round(maxSizeBytes / (1024 * 1024));
            toast({ title: 'File too large', description: `Please select files smaller than ${sizeMb} MB.`, variant: 'destructive' });
            return;
        }

        void onFilesSelected(validTypes);
    };

    return (
        <div
            className={`border-2 border-dashed p-8 md:p-12 text-center transition-colors ${
                isDraggingOver ? 'border-accent bg-accent/5' : 'border-border bg-white'
            } ${className}`}
            onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingOver(true);
            }}
            onDragLeave={() => setIsDraggingOver(false)}
            onDrop={(e) => {
                e.preventDefault();
                setIsDraggingOver(false);
                processFiles(e.dataTransfer.files);
            }}
        >
            {icon ?? <ImagePlus className="w-7 h-7 mx-auto mb-3 text-accent" />}
            {title && <h2 className="text-xl font-medium mb-2">{title}</h2>}
            {description && <p className="text-sm text-muted-foreground mb-5">{description}</p>}

            <input
                ref={inputRef}
                type="file"
                accept={accept}
                multiple={multiple}
                className="hidden"
                onChange={(e) => {
                    if (e.target.files) processFiles(e.target.files);
                    e.target.value = '';
                }}
            />

            <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={isUploading}
                className="inline-flex h-11 px-5 items-center gap-2 bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-60"
            >
                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {isUploading ? 'Uploading…' : buttonText}
            </button>
        </div>
    );
}