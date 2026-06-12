// 

'use client';

import React, { useEffect, useState } from 'react';

interface DatabaseCardProps {
  name: string;
  icon: React.ReactNode;
  description: string;
  isSelected: boolean;
  onClick: (name: string) => void;
}

const DatabaseCard: React.FC<DatabaseCardProps> = ({ name, icon, description, isSelected, onClick }) => {
  const [screenSize, setScreenSize] = useState('');

  // Handle window resize and set screen size
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      
      if (width < 768) setScreenSize('sm');
      else if (width < 1024) setScreenSize('md');
      else if (width < 1280) setScreenSize('lg');
      else setScreenSize('xl');
    };

    // Set initial size
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Function to determine responsive classes based on screen size
  const getResponsiveClasses = () => {
    // Base padding classes that scale with screen size
    const paddingClasses = {
      sm: 'p-3',
      md: 'p-3 md:p-4',
      lg: 'p-3 md:p-4 lg:p-4',
      xl: 'p-3 md:p-4 lg:p-4 xl:p-5'
    };
    
    // Icon size classes
    const iconClasses = {
      sm: 'text-xl mr-2',
      md: 'text-xl md:text-2xl mr-2 md:mr-3',
      lg: 'text-xl md:text-2xl lg:text-2xl mr-2 md:mr-3',
      xl: 'text-xl md:text-2xl lg:text-2xl xl:text-3xl mr-2 md:mr-3 lg:mr-4'
    };
    
    // Text size classes
    const titleClasses = {
      sm: 'text-sm',
      md: 'text-sm md:text-base',
      lg: 'text-sm md:text-base lg:text-lg',
      xl: 'text-sm md:text-base lg:text-lg xl:text-lg'
    };
    
    const descriptionClasses = {
      sm: 'text-xs',
      md: 'text-xs md:text-sm',
      lg: 'text-xs md:text-sm',
      xl: 'text-xs md:text-sm'
    };
    
    return {
      padding: paddingClasses[screenSize as keyof typeof paddingClasses] || paddingClasses.md,
      icon: iconClasses[screenSize as keyof typeof iconClasses] || iconClasses.md,
      title: titleClasses[screenSize as keyof typeof titleClasses] || titleClasses.md,
      description: descriptionClasses[screenSize as keyof typeof descriptionClasses] || descriptionClasses.md
    };
  };
  
  const classes = getResponsiveClasses();

  return (
    <div 
      className={`${classes.padding} rounded-lg cursor-pointer mb-2 md:mb-3 flex items-center border transition-colors duration-200 ${
        isSelected ? 'bg-teal-50 border-teal-500 shadow-sm' : 'bg-white border-gray-200 hover:bg-gray-50'
      }`}
      onClick={() => onClick(name)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(name);
        }
      }}
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
    >
      <div className={`${classes.icon} flex-shrink-0 flex items-center justify-center`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className={`${classes.title} font-medium text-gray-900 truncate`}>{name}</h3>
        <p className={`${classes.description} text-gray-500 line-clamp-2`}>{description}</p>
      </div>
      {isSelected && (
        <div className="ml-2 w-2 h-2 bg-teal-500 rounded-full flex-shrink-0"></div>
      )}
    </div>
  );
};

export default DatabaseCard;