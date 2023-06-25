import React from 'react';
import Tab from './Tab';

interface SidebarProps {
  activeTab: string;
  handleTabChange: (tabId: string) => void;
  handleComposeMail: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  handleTabChange,
  handleComposeMail,
}) => {
  const tabs = [
    { id: 'inbox', title: 'Inbox' },
    { id: 'sent', title: 'Sent' },
    { id: 'drafts', title: 'Drafts' },
    { id: 'trash', title: 'Trash' },
  ];

  return (
    <div className="bg-gray-200 w-64">
      <div className="p-4">
        <h1 className="text-2xl font-bold">Email Dashboard</h1>
      </div>
      <button
        className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded m-4"
        onClick={handleComposeMail}
      >
        Compose Mail
      </button>
      <nav className="p-4">
        <ul className="space-y-2">
          {tabs.map((tab) => (
            <Tab
              key={tab.id}
              title={tab.title}
              active={activeTab === tab.id}
              onClick={() => handleTabChange(tab.id)}
            />
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
