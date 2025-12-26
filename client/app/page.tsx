'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Notebook,
  BookOpenText,
  Lightbulb,
  CookingPot,
  Search,
  FileText,
  Check,
} from 'lucide-react';

const features = [
  {
    id: 1,
    icon: (
      <div className='bg-white rounded-2xl p-4 shadow-md hover:shadow-lg transition-shadow flex flex-col items-center justify-center'>
        <FileText className='text-green-500' size={22} strokeWidth={2} />
      </div>
    ),
    title: 'Welcome to Vectorsnap',
    description:
      'VectorSnap is a powerful semantic search engine that turns your documents into searchable knowledge using AI embeddings.',
  },
  {
    id: 2,
    icons: [
      <div
        key='search'
        className='bg-white rounded-2xl p-4 shadow-md hover:shadow-lg transition-shadow flex flex-col items-center justify-center'
      >
        <Search className='text-blue-600' size={22} strokeWidth={2} />
      </div>,
      <div
        key='doc'
        className='bg-white rounded-2xl p-4 shadow-md hover:shadow-lg transition-shadow flex flex-col items-center justify-center'
      >
        <FileText className='text-purple-600' size={22} strokeWidth={2} />
      </div>,
    ],
    title: 'Smart Document Search',
    description:
      'Find documents by meaning, not just keywords. Ask natural questions and get relevant results instantly.',
  },
  {
    id: 3,
    list: [
      {
        icon: <Notebook className='text-blue-600' size={22} />,
        name: 'Notes',
      },
      {
        icon: <BookOpenText className='text-green-600' size={22} />,
        name: 'Articles',
      },
      {
        icon: <Lightbulb className='text-yellow-600' size={22} />,
        name: 'Research',
      },
      {
        icon: <CookingPot className='text-orange-600' size={22} />,
        name: 'Recipes',
      },
    ],
    title: 'Organize Everything',
    description:
      'Store notes, articles, recipes, and research. VectorSnap organizes your knowledge base automatically.',
  },
  {
    id: 4,
    icon: (
      <div className='bg-white rounded-2xl p-4 shadow-md hover:shadow-lg transition-shadow flex flex-col items-center justify-center'>
        <Check className='text-orange-500' strokeWidth={3} size={22} />
      </div>
    ),
    title: 'Fast & Accurate',
    description:
      'Powered by state-of-the-art AI embeddings, VectorSnap delivers lightning-fast semantic search results.',
  },
];

export default function LandingPage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const isLast = currentSlide === features.length - 1;
  const feature = features[currentSlide];

  const nextSlide = () => {
    if (!isLast) setCurrentSlide((s) => s + 1);
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center px-6'>
      <div className='w-full max-w-4xl flex flex-col gap-12'>
        {/* FEATURE AREA */}
        <AnimatePresence mode='wait'>
          <motion.div
            key={feature.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className='w-full '
          >
            {/* Visual */}
            <div className='flex mb-10'>
              {feature.icon && feature.icon}
              {feature.icons && (
                <div className='flex items-center gap-6'>
                  {feature.icons.map((icon, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08, duration: 0.35 }}
                    >
                      {icon}
                    </motion.div>
                  ))}
                </div>
              )}
              {feature.list && (
                <div className='grid grid-cols-4 gap-4'>
                  {feature.list.map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.08 }}
                      className='bg-white rounded-2xl p-4 shadow-md hover:shadow-lg transition-shadow flex flex-col items-center'
                    >
                      <div>{item.icon}</div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Text */}
            <div className=''>
              <motion.h2
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className='text-3xl sm:text-4xl font-bold text-zinc-900 mb-4'
              >
                {feature.title}
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08, duration: 0.4 }}
                className='text-zinc-600 text-lg leading-relaxed max-w-xl'
              >
                {feature.description}
              </motion.p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* FIXED ACTIONS */}
        <div className='flex flex-col gap-6 mt-10'>
          {/* Button (never animated) */}
          <button
            onClick={nextSlide}
            className='w-52 px-10 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-zinc-600 text-white font-semibold hover:from-zinc-600 hover:to-blue-600 transition-all shadow-lg hover:shadow-xl'
          >
            {isLast ? 'Get Started' : 'Continue'}
          </button>

          {/* Progress Dots (static) */}
          <div className='flex gap-2'>
            {features.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`h-2 rounded-full transition-all ${
                  i === currentSlide
                    ? 'w-8 bg-gradient-to-r from-blue-600 to-zinc-600'
                    : 'w-2 bg-zinc-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
