import React from 'react';
import type { Book } from '../../types';

interface BookCardProps {
  book: Book;
  isSelected: boolean;
  onSelect: (book: Book) => void;
}

export const BookCard: React.FC<BookCardProps> = ({ book, isSelected, onSelect }) => {
  return (
    <div
      onClick={() => onSelect(book)}
      className={`relative overflow-hidden rounded-2xl border p-6 transition-all duration-300 cursor-pointer text-right flex flex-col justify-between h-full group ${
        isSelected
          ? 'border-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500'
          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xl hover:shadow-slate-100/50 dark:hover:shadow-none hover:-translate-y-1'
      }`}
    >
      {/* Category Tag */}
      <div className="book-card-wrapper-2">
        <span className="text-[10px] font-semibold tracking-wide px-2.5 py-1 rounded-full uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-950/30 group-hover:text-emerald-800 dark:group-hover:text-emerald-300 transition-colors duration-300">
          {book.category.split(' (')[0]}
        </span>
        <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
          الوفاة: {book.AuthorDeath} هـ
        </span>
      </div>

      {/* Book Title */}
      <h3 className="book-card-title-5">
        {book.Title}
      </h3>

      {/* Author Name */}
      <p className="book-card-text-6">
        {book.AuthorName}
      </p>

      {/* Short Summary */}
      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 mb-6 leading-relaxed flex-grow font-sans">
        {book.Summary.replace(/<[^>]*>/g, '').trim()}
      </p>

      {/* Footer/Action */}
      <div className="book-card-element-8">
        <div className="flex-1" /> {/* Spacer */}
        <span className="book-card-text-10">
          تصفح الكتاب 
          <svg className="book-card-element-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </div>
  );
};
