'use client'
import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import MailDetails from '@/components/MailDetails';
import MailList from '@/components/MailList';
import ComposeMailForm from '@/components/ComposeMailForm';

export interface Mail {
  id: number;
  subject: string;
  from: string;
  time: string;
  tab: string;
}

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('inbox');
  const [selectedMail, setSelectedMail] = useState<Mail | null>(null);
  const [isComposeOpen, setIsComposeOpen] = useState(false);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setSelectedMail(null);
  };

  const handleComposeMail = () => {
    setIsComposeOpen(true);
  };

  const handleMailClick = (mail: Mail) => {
    setSelectedMail(mail);
  };

  const handleBackToMails = () => {
    setSelectedMail(null);
  };

  // Sample mail data
  const mailList: Mail[] = [
    { id: 1, subject: 'Subject 1', from: 'example@example.com', time: '10:00 AM', tab: 'inbox' },
    { id: 2, subject: 'Subject 2', from: 'example@example.com', time: '11:00 AM', tab: 'inbox' },
    { id: 3, subject: 'Subject 3', from: 'example@example.com', time: '12:00 PM', tab: 'sent' },
    { id: 4, subject: 'Subject 4', from: 'example@example.com', time: '1:00 PM', tab: 'drafts' },
    { id: 5, subject: 'Subject 5', from: 'example@example.com', time: '2:00 PM', tab: 'trash' },
  ];

  const filteredMailList = mailList.filter((mail) => mail.tab === activeTab);

  return (
    <div className="h-screen flex">
      <Sidebar
        activeTab={activeTab}
        handleTabChange={handleTabChange}
        handleComposeMail={handleComposeMail}
      />

      {/* Main Content */}
      <div className="flex-1 bg-white">
        <header className="bg-gray-200 p-4">
          <h2 className="text-xl font-bold">Email Dashboard</h2>
        </header>
        <main className="p-4">
          {selectedMail ? (
            <MailDetails selectedMail={selectedMail} handleBackToMails={handleBackToMails} />
          ) : (
            <MailList mailList={filteredMailList} handleMailClick={handleMailClick} />
          )}
        </main>
      </div>

      {/* Compose Mail Form */}
      {isComposeOpen && <ComposeMailForm onClose={() => setIsComposeOpen(false)} />}
    </div>
  );
};

export default function Page() {
  return <Dashboard />;
}
