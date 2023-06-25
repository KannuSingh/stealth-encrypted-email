import React from 'react';

interface TabProps {
  title: string;
  active: boolean;
  onClick: () => void;
}

const Tab: React.FC<TabProps> = ({ title, active, onClick }) => {
  return (
    <li className={`text-gray-800 cursor-pointer ${active ? 'font-bold' : ''}`} onClick={onClick}>
      {title}
    </li>
  );
};

export default Tab;
