import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <motion.div 
        className="sm:mx-auto sm:w-full sm:max-w-md text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-center text-6xl font-extrabold text-gray-900">404</h2>
        <p className="mt-2 text-center text-3xl font-bold text-gray-900">Page not found</p>
        <p className="mt-2 text-center text-sm text-gray-600">
          Sorry, we couldn't find the page you're looking for.
        </p>
      </motion.div>
      
      <motion.div 
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="text-center">
          <Link
            to="/"
            className="btn btn-primary inline-flex items-center"
          >
            <span>Go back home</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}