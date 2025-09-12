'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, type User } from 'firebase/auth';
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  listAll,
  deleteObject,
  getBlob,
  uploadBytes,
  type StorageReference,
  getMetadata,
} from 'firebase/storage';
import { auth, storage } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  UploadCloud,
  File as FileIcon,
  MoreHorizontal,
  Download,
  Pencil,
  Trash2,
  Loader2,
  Folder,
  Globe,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


type UploadedFile = {
  ref: StorageReference;
  name: string;
  size: number;
};

export default function FileManagerPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(true);
  const [editingFile, setEditingFile] = useState<UploadedFile | null>(null);
  const [deletingFile, setDeletingFile] = useState<UploadedFile | null>(null);
  const [newFileName, setNewFileName] = useState('');
  const [webUrl, setWebUrl] = useState('');
  const [webUploadError, setWebUploadError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchFiles(currentUser.uid);
      } else {
        router.push('/');
      }
      setIsAuthenticating(false);
    });
    return () => unsubscribe();
  }, [router]);

  const fetchFiles = async (userId: string) => {
    setIsLoadingFiles(true);
    const filesRef = ref(storage, `uploads/${userId}`);
    try {
      const res = await listAll(filesRef);
      const filesData = await Promise.all(
        res.items.map(async (itemRef) => {
          const metadata = await getMetadata(itemRef);
          return {
            ref: itemRef,
            name: metadata.name,
            size: metadata.size,
          };
        })
      );
      setFiles(filesData);
    } catch (error) {
      console.error('Error fetching files:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load files.',
      });
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    uploadFile(file, file.name);
  };
  
  const validateURL = (urlString: string) => {
    try {
      const url = new URL(urlString);
      const validProtocols = ['http:', 'https:'];
      const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.txt', '.csv'];
      
      if (!validProtocols.includes(url.protocol)) {
        return { valid: false, error: 'Only HTTP and HTTPS URLs are allowed.' };
      }
      
      const hasValidExtension = validExtensions.some(ext => 
        url.pathname.toLowerCase().endsWith(ext)
      );
      
      if (!hasValidExtension) {
        return { valid: false, error: 'File must be an image, PDF, or text file.' };
      }
      
      return { valid: true, error: null };
    } catch (e) {
      return { valid: false, error: 'Invalid URL format.' };
    }
  };

  const getWebUploadErrorMessage = (error: any) => {
    if (error.message.includes('CORS')) {
      return 'The file cannot be accessed due to CORS restrictions. Try downloading and uploading directly.';
    }
    if (error.message.includes('Network') || error.message.includes('fetch')) {
      return 'Network error. Please check your internet connection and the URL and try again.';
    }
    if (error.message.includes('timeout')) {
      return 'Upload timed out. The file might be too large or the server too slow.';
    }
    return error.message || 'An unexpected error occurred. Please try again.';
  };

  const handleWebUpload = async () => {
    if (!webUrl.trim() || !user) return;
    
    setUploading(true);
    setWebUploadError(null);
    setUploadProgress(10);
    
    try {
      const validation = validateURL(webUrl);
      if (!validation.valid) {
        throw new Error(validation.error as string);
      }
      setUploadProgress(20);

      // We skip HEAD request due to likely CORS issues in browser, and go straight to fetch
      console.log('📥 Downloading file from URL...');
      const response = await fetch(webUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
      }
      setUploadProgress(60);

      const blob = await response.blob();
       if (blob.size === 0) {
        throw new Error('Downloaded file is empty.');
      }
      console.log('📁 File downloaded:', blob.size, 'bytes, type:', blob.type);
      setUploadProgress(80);

      const filename = webUrl.split('/').pop()?.split('?')[0] || 'downloaded-file';
      const file = new File([blob], filename, { type: blob.type });

      await uploadFile(file, filename, true); // Pass a flag to indicate web upload
      setUploadProgress(100);

      toast({
        title: "Upload Successful",
        description: `File "${filename}" has been uploaded from the web.`,
        className: 'bg-success text-success-foreground',
      });
      setWebUrl('');

    } catch (error: any) {
      console.error('❌ URL upload failed:', error);
      setWebUploadError(getWebUploadErrorMessage(error));
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 2000);
    }
  };


  const uploadFile = (file: Blob, fileName: string, isWebUpload = false) => {
     return new Promise<void>((resolve, reject) => {
      if (!user) {
        const err = new Error("User not authenticated.");
        console.error(err);
        if (isWebUpload) return reject(err);
        
        toast({
          variant: 'destructive',
          title: 'Authentication Error',
          description: "You must be signed in to upload files.",
        });
        return reject(err);
      }

      const storageRef = ref(storage, `uploads/${user.uid}/${fileName}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      if(!isWebUpload) setUploading(true);
      
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if(!isWebUpload) setUploadProgress(progress);
        },
        (error) => {
          console.error('Upload error:', error);
          const toastError = {
            variant: 'destructive',
            title: 'Upload Failed',
            description: 'There was an error uploading your file. Check storage rules.',
          };
          if (isWebUpload) return reject(error);
          toast(toastError as any);
          setUploading(false);
          reject(error);
        },
        () => {
          if(!isWebUpload) {
            toast({
              title: 'Upload Successful',
              description: `File "${fileName}" has been uploaded.`,
              className: 'bg-success text-success-foreground',
            });
            setUploading(false);
            setUploadProgress(0);
          }
          fetchFiles(user.uid);
          resolve();
        }
      );
    });
  };


  const handleDownload = async (file: UploadedFile) => {
    try {
      const url = await getDownloadURL(file.ref);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Download Failed',
        description: 'Could not get download link.',
      });
    }
  };

  const handleDelete = async () => {
    if (!deletingFile || !user) return;
    try {
      await deleteObject(deletingFile.ref);
      toast({
        title: 'File Deleted',
        description: `File "${deletingFile.name}" has been deleted.`,
        className: 'bg-success text-success-foreground',
      });
      setDeletingFile(null);
      fetchFiles(user.uid);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Delete Failed',
        description: 'Could not delete the file.',
      });
    }
  };

  const handleRename = async () => {
    if (!editingFile || !newFileName.trim() || !user) return;
    
    const originalName = editingFile.name;
    const fileExtension = originalName.includes('.') ? '.' + originalName.split('.').pop() : '';
    const finalNewName = newFileName.endsWith(fileExtension || '') ? newFileName : newFileName + fileExtension;
  
    if (finalNewName === originalName) {
      setEditingFile(null);
      return;
    }
  
    const newFileRef = ref(storage, `uploads/${user.uid}/${finalNewName}`);
  
    try {
      const blob = await getBlob(editingFile.ref);
      
      await uploadBytes(newFileRef, blob);
      await deleteObject(editingFile.ref);
      
      toast({
        title: "File Renamed",
        description: `"${originalName}" was renamed to "${finalNewName}".`,
        className: 'bg-success text-success-foreground',
      });

      fetchFiles(user.uid);
      setEditingFile(null);

    } catch (error) {
      console.error("Rename error:", error);
      toast({
        variant: "destructive",
        title: "Rename Failed",
        description: "Could not rename the file. Please try again.",
      });
    }
  };
  

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  if (isAuthenticating) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-secondary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <header className="text-white p-8 rounded-xl mb-8 text-center animate-fade-in shadow-lg bg-gradient-to-r from-primary to-secondary relative">
        <div className="absolute top-4 left-4">
            <Button asChild variant="secondary">
                <Link href="/">
                    Back to Home
                </Link>
            </Button>
        </div>
        <h1 className="text-4xl font-bold font-headline flex items-center justify-center gap-3">
          <Folder className="w-10 h-10 glowing-icon" />
          File Manager
        </h1>
        <p className="mt-2 text-lg opacity-90">
          Upload and manage your files securely.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-8">
        <Card className="shadow-lg border-none bg-card animate-slide-in-left">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline text-primary">
              <UploadCloud className="glowing-icon" />
              Upload New File
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="computer" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="computer">From Computer</TabsTrigger>
                <TabsTrigger value="web">From Web</TabsTrigger>
              </TabsList>
              <TabsContent value="computer" className="mt-4">
                <Input
                  type="file"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="file:text-secondary-foreground file:bg-secondary file:border-none file:font-semibold"
                />
                 {uploading && !webUrl && (
                  <div className="mt-4 space-y-2">
                    <p>Uploading from computer...</p>
                    <Progress value={uploadProgress} className="w-full" />
                  </div>
                )}
              </TabsContent>
              <TabsContent value="web" className="mt-4 space-y-3">
                 <div className="flex gap-2">
                    <Input
                      type="url"
                      placeholder="https://example.com/image.png"
                      value={webUrl}
                      onChange={(e) => setWebUrl(e.target.value)}
                      disabled={uploading}
                    />
                    <Button onClick={handleWebUpload} disabled={uploading || !webUrl.trim()}>
                      {uploading ? <Loader2 className="animate-spin" /> : <Globe />}
                      Upload
                    </Button>
                 </div>
                {uploading && uploadProgress > 0 && (
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Uploading from URL...</span>
                        <span>{Math.round(uploadProgress)}%</span>
                    </div>
                    <Progress value={uploadProgress} className="w-full" />
                  </div>
                )}
                {webUploadError && (
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertTitle>Upload Failed</AlertTitle>
                    <AlertDescription>{webUploadError}</AlertDescription>
                  </Alert>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-none bg-card animate-slide-in-right">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline text-primary">
              <FileIcon className="glowing-icon" />
              Your Files
            </CardTitle>
            <CardDescription>
              Browse, download, and manage your uploaded files.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden sm:table-cell">Size</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingFiles ? (
                    <TableRow>
                      <TableCell colSpan={3} className="h-24 text-center">
                        <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                      </TableCell>
                    </TableRow>
                  ) : files.length > 0 ? (
                    files.map((file) => (
                      <TableRow key={file.ref.fullPath}>
                        <TableCell className="font-medium max-w-[150px] sm:max-w-xs truncate">{file.name}</TableCell>
                        <TableCell className="hidden sm:table-cell">{formatBytes(file.size)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleDownload(file)}>
                                <Download className="mr-2 h-4 w-4" /> Download
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditingFile(file);
                                  setNewFileName(file.name.includes('.') ? file.name.split('.').slice(0, -1).join('.') : file.name);
                                }}
                              >
                                <Pencil className="mr-2 h-4 w-4" /> Rename
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setDeletingFile(file)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="h-24 text-center">
                        No files uploaded yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rename File Dialog */}
      <AlertDialog open={!!editingFile} onOpenChange={(v) => !v && setEditingFile(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rename File</AlertDialogTitle>
            <AlertDialogDescription>
              Enter a new name for the file "{editingFile?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRename()}
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRename}>Save</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete File Dialog */}
      <AlertDialog open={!!deletingFile} onOpenChange={(v) => !v && setDeletingFile(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the file "{deletingFile?.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
