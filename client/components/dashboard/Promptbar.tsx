'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { UploadCloud, X, Sparkles } from 'lucide-react';
import { TbHexagonLetterV } from 'react-icons/tb';
import { motion, AnimatePresence } from 'framer-motion';

export default function Promptbar() {
  const [query, setQuery] = useState('');
  const pathname = usePathname();

  const clearSearch = () => setQuery('');

  const getPlaceholders = () => {
    if (pathname.includes('upload')) return ['upload a document to store…'];
    if (pathname.includes('documents')) return ['Ask about your documents…'];

    return [
      'upload a document or ask about your documents…',
      'use / to navigate to documents or settings page',
    ];
  };

  return (
    <nav className='fixed bottom-5 left-0 right-0 z-50 px-4 exo'>
      <div className='mx-auto max-w-3xl'>
        <div
          className='relative flex items-center gap-2 rounded-full bg-white px-4 py-3
          shadow-lg border border-gray-200 transition-all
          focus-within:border-blue-500 focus-within:shadow-blue-100'
        >
          {/* AI / Brand indicator */}
          <TbHexagonLetterV size={30} className='text-gray-400 shrink-0' />

          {/* Input + Animated Placeholder */}
          <div className='relative flex-1'>
            <AnimatedPlaceholder
              placeholders={getPlaceholders()}
              hidden={query.length > 0}
            />

            <input
              type='text'
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='' // intentionally empty
              className='relative z-10 w-full bg-transparent text-sm text-gray-900
              placeholder:text-gray-400 outline-none'
            />
          </div>

          {/* Clear */}
          {query && (
            <button
              onClick={clearSearch}
              className='p-1 text-gray-400 hover:text-gray-600 transition'
              aria-label='Clear input'
            >
              <X size={20} />
            </button>
          )}

          {/* Attach / Link */}
          <button
            className='p-2 rounded-full text-gray-400 hover:text-gray-600
            hover:bg-gray-100 transition'
            aria-label='Attach link'
          >
            <UploadCloud size={20} />
          </button>

          {/* Submit / AI hint */}
          <button
            className='p-2 rounded-full bg-blue-600 text-white
            hover:bg-blue-700 transition shadow-sm'
            aria-label='Run command'
          >
            <Sparkles size={20} />
          </button>
        </div>

        {/* Subtle hint */}
        <p className='mt-2 text-center text-xs text-gray-400'>
          “retrieve your docs.....”
        </p>
      </div>
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/* Animated Placeholder (isolated, no layout impact)                    */
/* ------------------------------------------------------------------ */

function AnimatedPlaceholder({
  placeholders,
  hidden,
}: {
  placeholders: string[];
  hidden: boolean;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (hidden || placeholders.length <= 1) return;

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % placeholders.length);
    }, 3500);

    return () => clearInterval(interval);
  }, [hidden, placeholders]);

  if (hidden) return null;

  return (
    <div className='pointer-events-none absolute left-0 top-1/2 -translate-y-1/2'>
      <AnimatePresence mode='wait'>
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.35 }}
          className='text-sm text-gray-400'
        >
          {placeholders[index]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
