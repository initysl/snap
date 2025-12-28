import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MinusSquare, PlusSquare, Send, Loader2 } from 'lucide-react';
import { useIngest } from '@/hooks/useIngest';
import { IngestRequest } from '@/types';

export default function Textarea() {
  const [activeTab, setActiveTab] = useState<'text' | 'metadata'>('text');
  const [text, setText] = useState('');
  const [metadata, setMetadata] = useState<{ key: string; value: string }[]>([
    { key: '', value: '' },
  ]);

  const { mutateAsync: ingest, isPending, isSuccess, isError } = useIngest();

  const addMetadata = () => {
    setMetadata((prev) => [...prev, { key: '', value: '' }]);
  };

  const updateMetadata = (
    index: number,
    field: 'key' | 'value',
    value: string
  ) => {
    setMetadata((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const removeMetadata = (index: number) => {
    setMetadata((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!text.trim()) {
      alert('Please enter some content');
      return;
    }

    // Convert metadata array to object
    const metadataObject: Record<string, any> = {};
    metadata.forEach((item) => {
      if (item.key.trim() && item.value.trim()) {
        metadataObject[item.key.trim()] = item.value.trim();
      }
    });

    // Prepare payload
    const payload: IngestRequest = {
      text: text.trim(),
      metadata:
        Object.keys(metadataObject).length > 0 ? metadataObject : undefined,
    };

    try {
      const response = await ingest(payload);
      console.log('Ingest successful:', response);

      // Reset form
      setText('');
      setMetadata([{ key: '', value: '' }]);
      alert('Document ingested successfully!');
    } catch (error) {
      console.error('Ingest failed:', error);
      alert('Failed to ingest document. Please try again.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className='text-center'
    >
      <div className='border-3 border-dashed rounded-2xl p-6 w-full'>
        {/* Tabs */}
        <div className='flex justify-start gap-2 mb-6'>
          <button
            onClick={() => setActiveTab('text')}
            className={`px-4 py-2 text-sm rounded-xl transition
              ${
                activeTab === 'text'
                  ? 'bg-white text-blue-600 shadow'
                  : 'bg-white text-gray-800 border'
              }
            `}
          >
            Textarea
          </button>

          <button
            onClick={() => setActiveTab('metadata')}
            className={`px-4 py-2 text-sm rounded-xl transition
              ${
                activeTab === 'metadata'
                  ? 'bg-white text-blue-600 shadow'
                  : 'bg-white text-gray-800 border'
              }
            `}
          >
            Metadata
          </button>
        </div>

        {/* Content */}
        <AnimatePresence mode='wait'>
          {activeTab === 'text' && (
            <motion.div
              key='text'
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder='Enter your content text here...'
                className='w-full h-40 p-4 text-sm rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none'
              />
            </motion.div>
          )}

          {activeTab === 'metadata' && (
            <motion.div
              key='metadata'
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className='text-left space-y-4'
            >
              {metadata.map((item, index) => (
                <div key={index} className='flex gap-2 items-center'>
                  {/* Key */}
                  <input
                    type='text'
                    placeholder='key'
                    value={item.key}
                    onChange={(e) =>
                      updateMetadata(index, 'key', e.target.value)
                    }
                    className='w-1/2 p-3 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400'
                  />

                  {/* Value */}
                  <input
                    type='text'
                    placeholder='value'
                    value={item.value}
                    onChange={(e) =>
                      updateMetadata(index, 'value', e.target.value)
                    }
                    className='w-1/2 p-3 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400'
                  />

                  {/* Remove */}
                  <button
                    onClick={() => removeMetadata(index)}
                    className='text-gray-400 hover:text-red-500 transition'
                    aria-label='Remove metadata'
                    disabled={metadata.length === 1}
                  >
                    <MinusSquare />
                  </button>
                </div>
              ))}

              {/* Add new metadata */}
              <button
                onClick={addMetadata}
                className='flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium'
              >
                <PlusSquare size={20} />
                Add metadata field
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit Button */}
        <div className='mt-6 flex items-center justify-between'>
          {/* Status Messages */}
          <div className='text-sm'>
            {isSuccess && (
              <span className='text-green-600 font-medium'>
                Uploaded successfully!
              </span>
            )}
            {isError && (
              <span className='text-red-600 font-medium'>Failed to upload</span>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={isPending || !text.trim()}
            className='px-6 py-3 bg-linear-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
          >
            {isPending ? (
              <>
                <Loader2 className='w-4 h-4 animate-spin' />
                Uploading...
              </>
            ) : (
              <>
                <Send className='w-4 h-4' />
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
