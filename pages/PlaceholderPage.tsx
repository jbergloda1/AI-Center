import React from 'react';

interface PlaceholderPageProps {
  title: string;
}

const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12">
      <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">{title}</h2>
      <p className="text-lg text-gray-600 dark:text-gray-300">Tính năng này sẽ sớm ra mắt!</p>
      <div className="mt-8">
        <img src="https://picsum.photos/400/300" alt="Sắp ra mắt" className="rounded-lg shadow-md" />
      </div>
    </div>
  );
};

export default PlaceholderPage;