'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export default function ProfileCard() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{
        rotateY: 5,
        rotateX: -5,
        transition: { duration: 0.3 },
      }}
      style={{
        transformStyle: 'preserve-3d',
        perspective: 1000,
      }}
      className='flex items-center gap-4 bg-white rounded-2xl p-2 mt-2 shadow-md hover:shadow-lg transition-shadow w-fit'
    >
      {/* Avatar */}
      <motion.div
        whileHover={{
          scale: 1.1,
          rotate: 5,
          transition: { duration: 0.3 },
        }}
        className='relative'
      >
        <div className='w-10 h-10 bg-linear-to-br from-teal-300 to-teal-400 rounded-3xl flex items-center justify-center shadow-md'>
          <img
            src='https://api.dicebear.com/7.x/avataaars/svg?seed=Helen'
            alt='Helen Joe'
          />
        </div>
      </motion.div>

      {/* User Info */}
      <div className='flex flex-col'>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className='text-xl font-normal text-gray-900'
        >
          Helen Joe
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className='text-gray-500 text-sm'
        >
          @helenjoe
        </motion.p>
      </div>
    </motion.div>
  );
}
