'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  UploadCloud,
  X,
  Sparkles,
  FileText,
  Upload,
  Settings,
} from 'lucide-react';
import { TbHexagonLetterV } from 'react-icons/tb';
import { motion, AnimatePresence } from 'framer-motion';
import { ROUTES } from '@/lib/routes';

const COMMANDS = [
  {
    label: 'Go to Documents',
    value: '/documents',
    href: ROUTES.dashboard.documents,
    icon: FileText,
  },
  {
    label: 'Settings',
    value: '/settings',
    href: ROUTES.dashboard.settings,
    icon: Settings,
  },
];

export default function Promptbar() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const pathname = usePathname();

  const clearSearch = () => {
    setQuery('');
    setOpen(false);
  };

  const router = useRouter();

  const filteredCommands = COMMANDS.filter(
    (cmd) =>
      cmd.label.toLowerCase().includes(query.toLowerCase()) ||
      cmd.value.includes(query)
  );

  const executeCommand = () => {
    alert('Niceeeeeeee');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      executeCommand();
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) =>
        prev < filteredCommands.length - 1 ? prev + 1 : prev
      );
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : prev));
    }
  };

  useEffect(() => {
    if (query.length > 0) setOpen(true);
    else setOpen(false);
  }, [query]);

  const getPlaceholders = () => {
    if (pathname.includes('upload')) return ['upload a document to store…'];
    if (pathname.includes('documents')) return ['Ask about your documents…'];

    return [
      'upload a document/ask about your documents',
      'use / to navigate pages...',
    ];
  };

  return (
    <nav className='z-50 px-4 exo'>
      <div className='fixed bottom-5 left-0 right-0 mx-auto max-w-xl'>
        <div className='relative flex items-center gap-2 rounded-full bg-white px-4 py-3 shadow-lg border border-gray-200 transition-all focus-within:border-blue-500 focus-within:shadow-blue-100 '>
          {' '}
          {open && filteredCommands.length > 0 && (
            <div className='absolute bottom-full mb-3 w-full bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden'>
              {filteredCommands.map((cmd, idx) => {
                const Icon = cmd.icon;
                const active = idx === activeIndex;

                return (
                  <div
                    key={cmd.value}
                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                      active ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                    }`}
                    onMouseEnter={() => setActiveIndex(idx)}
                    // onClick={() => router.push(cmd.href)}
                    onClick={() => {
                      router.push(cmd.href);
                      clearSearch();
                    }}
                  >
                    <Icon size={18} />
                    <span className='text-sm font-medium'>{cmd.label}</span>
                  </div>
                );
              })}
            </div>
          )}
          {/* Logo*/}
          <TbHexagonLetterV size={30} className='text-gray-400 shrink-0' />
          {/* Input */}
          <div className='relative flex-1'>
            <AnimatedPlaceholder
              placeholders={getPlaceholders()}
              hidden={query.length > 0}
            />

            <input
              type='text'
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className='relative shrink-0 z-10 w-full bg-transparent text-sm text-gray-900 placeholder:text-gray-400 outline-none text-clip'
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
            className='p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition'
            aria-label='Attach link'
          >
            <UploadCloud size={20} />
          </button>
          {/* Submit / AI hint */}
          <button
            type='button'
            onClick={executeCommand}
            disabled={!query.trim()}
            className={`p-2 rounded-full transition shadow-sm ${
              query.trim()
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
            aria-label='Execute command or search'
          >
            <Sparkles size={20} />
          </button>
        </div>

        {/* Subtle hint */}
        <p className='mt-2 text-center text-md text-gray-400'>
          “retrieve your docs.....”
        </p>
      </div>
    </nav>
  );
}

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
          transition={{ duration: 0.55 }}
          className='text-sm text-gray-400'
        >
          {placeholders[index]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
