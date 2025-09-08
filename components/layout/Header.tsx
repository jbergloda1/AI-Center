import React from 'react';
import { NavLink } from 'react-router-dom';
import { CVIcon } from '../icons/CVIcon';
import { TranslateIcon } from '../icons/TranslateIcon';
import { WriterIcon } from '../icons/WriterIcon';
import { EditorIcon } from '../icons/EditorIcon';
import { SparklesIcon } from '../icons/SparklesIcon';

const navLinks = [
  { to: '/cv-builder', text: 'Trình tạo CV AI', icon: <CVIcon className="w-5 h-5" /> },
  { to: '/translator', text: 'Trình dịch AI', icon: <TranslateIcon className="w-5 h-5" /> },
  { to: '/writer', text: 'Trình viết AI', icon: <WriterIcon className="w-5 h-5" /> },
  { to: '/editor', text: 'Trình sửa AI', icon: <EditorIcon className="w-5 h-5" /> },
];

const Header: React.FC = () => {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-2">
            <SparklesIcon className="w-8 h-8 text-primary-500" />
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">Trung tâm Năng suất AI</h1>
          </div>
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-500 text-white'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`
                }
              >
                {link.icon}
                <span>{link.text}</span>
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center space-x-4">
             <button className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary-500">
               Đăng nhập
             </button>
             <button className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
               Đăng ký
             </button>
           </div>
        </div>
      </div>
    </header>
  );
};

export default Header;