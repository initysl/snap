'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
import { MdOutlineDriveFolderUpload } from 'react-icons/md';
import { useIngest } from '@/hooks/useIngest';
import { IngestRequest } from '@/types';
import Navtab from '@/components/dashboard/Navtab';
import Textarea from '@/components/dashboard/Textarea';

interface FileWithProgress {
  file: File;
  id: string;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
}

export default function UploadPage() {
  const [files, setFiles] = useState<FileWithProgress[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const { mutateAsync: ingest, isPending } = useIngest();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const droppedFiles = Array.from(e.dataTransfer.files).filter(
        (file) =>
          file.type === 'application/pdf' ||
          file.type === 'text/plain' ||
          file.name.endsWith('.txt') ||
          file.name.endsWith('.md')
      );

      if (droppedFiles.length === 0) {
        alert('Please upload PDF or text files only');
        return;
      }

      const newFiles: FileWithProgress[] = droppedFiles.map((file) => ({
        file,
        id: Math.random().toString(36).substr(2, 9),
        progress: 0,
        status: 'uploading',
      }));

      setFiles((prev) => [...prev, ...newFiles]);

      // Process each file
      for (const fileItem of newFiles) {
        try {
          // Simulate progress
          const progressInterval = setInterval(() => {
            setFiles((prev) =>
              prev.map((f) =>
                f.id === fileItem.id && f.progress < 90
                  ? { ...f, progress: f.progress + 10 }
                  : f
              )
            );
          }, 200);

          // Read file content
          const content = await readFileContent(fileItem.file);

          // Prepare payload
          const payload: IngestRequest = {
            text: content,
            metadata: {
              filename: fileItem.file.name,
              size: fileItem.file.size,
              type: fileItem.file.type,
              uploadedAt: new Date().toISOString(),
            },
          };

          // Call ingest API
          const response = await ingest(payload);

          clearInterval(progressInterval);

          // Update status to success
          setFiles((prev) =>
            prev.map((f) =>
              f.id === fileItem.id
                ? { ...f, progress: 100, status: 'success' }
                : f
            )
          );

          console.log('Document ingested:', response);
        } catch (error) {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === fileItem.id
                ? {
                    ...f,
                    status: 'error',
                    error: 'Upload failed. Please try again.',
                  }
                : f
            )
          );
        }
      }
    },
    [ingest]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = e.target.files;
      if (selectedFiles) {
        handleDrop({
          dataTransfer: { files: selectedFiles },
          preventDefault: () => {},
        } as any);
      }
    },
    [handleDrop]
  );

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const hasFiles = files.length > 0;

  return (
    <div className='flex flex-col items-center justify-center exo'>
      <div className='max-w-2xl w-full space-y-10'>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className='text-center'
        >
          <Navtab />
        </motion.div>
        <Textarea />

        {/* Upload Area */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <label
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative block w-full rounded-3xl border-3 border-dashed transition-all cursor-pointer ${
              isDragging
                ? 'border-blue-500 bg-blue-50 scale-105'
                : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50/50'
            }`}
          >
            <input
              type='file'
              multiple
              accept='.pdf,.txt,.md'
              onChange={handleFileSelect}
              className='hidden'
            />

            <div className='p-10 flex flex-col items-center justify-center'>
              <motion.div
                animate={{
                  y: isDragging ? -10 : 0,
                  scale: isDragging ? 1.1 : 1,
                }}
                transition={{ duration: 0.2 }}
                className='w-24 h-24 rounded-3xl border border-dashed flex items-center justify-center mb-6 '
              >
                <MdOutlineDriveFolderUpload className='w-16 h-16 text-blue-600' />
              </motion.div>
              <div className='flex flex-col items-center'>
                <p className='text-sm font-normal text-gray-500 mb-2'>
                  Drop your file(s) here, or{' '}
                  <span className='text-blue-600'>Browse</span>
                </p>
                <p className='text-xs text-gray-500'>
                  pdf, txt, doc • Max file size 80MB
                </p>
              </div>
            </div>
          </label>
        </motion.div>

        {/* File List */}
        <AnimatePresence>
          {hasFiles && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className='mt-6 space-y-3'
            >
              {files.map((fileItem) => (
                <motion.div
                  key={fileItem.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className='bg-white rounded-2xl p-4 shadow-md border border-gray-100'
                >
                  <div className='flex items-center gap-3'>
                    {/* Icon */}
                    <div className='w-12 h-12 bg-teal-600 rounded-xl flex items-center justify-center shrink-0'>
                      <FileText className='w-6 h-6 text-white' />
                    </div>

                    {/* File Info */}
                    <div className='flex-1 min-w-0'>
                      <p className='font-semibold text-gray-900 truncate'>
                        {fileItem.file.name}
                      </p>
                      <p className='text-xs text-gray-500'>
                        {(fileItem.file.size / 1024).toFixed(2)} KB
                      </p>

                      {/* Progress Bar */}
                      {fileItem.status === 'uploading' && (
                        <div className='mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden'>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${fileItem.progress}%` }}
                            className='h-full bg-blue-600'
                          />
                        </div>
                      )}

                      {/* Error Message */}
                      {fileItem.status === 'error' && (
                        <p className='text-xs text-red-600 mt-1 flex items-center gap-1'>
                          <AlertCircle size={12} />
                          {fileItem.error}
                        </p>
                      )}
                    </div>

                    {/* Status */}
                    <div className='flex items-center gap-2'>
                      {fileItem.status === 'uploading' && (
                        <span className='text-sm font-semibold text-blue-600'>
                          {fileItem.progress}%
                        </span>
                      )}

                      {fileItem.status === 'success' && (
                        <CheckCircle2 className='w-5 h-5 text-green-600' />
                      )}

                      {fileItem.status === 'error' && (
                        <AlertCircle className='w-5 h-5 text-red-600' />
                      )}

                      {/* Remove Button */}
                      <button
                        onClick={() => removeFile(fileItem.id)}
                        className='p-1 hover:bg-gray-100 rounded-lg transition-colors'
                      >
                        <X size={18} className='text-gray-400' />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit Button (if needed for batch confirmation) */}
        {hasFiles && files.every((f) => f.status === 'success') && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className='w-full mt-6 py-4 bg-linear-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-2xl hover:shadow-lg transition-all'
            onClick={() => {
              alert('All files uploaded successfully!');
              setFiles([]);
            }}
          >
            Done - View My Documents
          </motion.button>
        )}
      </div>
    </div>
  );
}
