'use client'
import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import MailDetails from '@/components/MailDetails';
import MailList from '@/components/MailList';
import ComposeMailForm from '@/components/ComposeMailForm';
import { ethers } from 'ethers';
import useAccount from '@/hooks/useAccount';
import { Announcement, AnnouncementForUser, isAnnouncementForUser } from '@/utils/StealthEmailUtils';
import { stealthMailABI, stealthMailContractAddress } from '@/utils/e3Stealth-js/classes/StealthEmail';

export interface Mail {
  id: string;
  subject: string;
  from: string;
  time: string;
  tab: string;
  message:string;
}

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('inbox');
  const [selectedMail, setSelectedMail] = useState<AnnouncementForUser | null>(null);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [announcementsForUser, setAnnouncementsForUser] = useState<AnnouncementForUser[]>([]);
  const { signer,provider } = useAccount();
  
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const contract = new ethers.Contract(stealthMailContractAddress, stealthMailABI, signer!);

        const filter = contract.filters.Announcement();
        const events = await contract.queryFilter(filter);
        console.log(events)
        const parsedAnnouncements:Announcement[] = await Promise.all(
          events.map(async (event) => {
            const transaction = await provider!.getTransaction(event.transactionHash);
            const emittingAccount = transaction.from;
            const block = await provider!.getBlock(transaction.blockHash!);
            const timestamp = block.timestamp;
            return {
              from: emittingAccount,
              timestamp:timestamp.toString(),
              receiver: event.args.receiver,
              pkx: event.args.pkx,
              ciphertext: event.args.ciphertext,
              cid: event.args.cid,
            };
          })
        );
        console.log(parsedAnnouncements)
        const mailAnnouncementForUser =  processedAnnouncements(parsedAnnouncements)
        setAnnouncementsForUser(mailAnnouncementForUser);
      } catch (error) {
        console.error('Error fetching announcements:', error);
      }
    };

    fetchAnnouncements();
  }, []);

  const processedAnnouncements = (parsedAnnouncements: Announcement[]) =>{
    const stealthKeysSet = JSON.parse(localStorage.getItem('StealthKeysSet')!)
    console.log(stealthKeysSet)
    const mailForUser:AnnouncementForUser[] = []
    parsedAnnouncements.forEach((announcement:Announcement) =>{
      console.log(announcement)

      const result:AnnouncementForUser = isAnnouncementForUser(stealthKeysSet.spendingKeyPair.publicKeyHex,stealthKeysSet.viewingKeyPair.privateKeyHex,announcement)
      if(result.isForUser){
        mailForUser.push(result)
      }
    })
    return mailForUser;
  }

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setSelectedMail(null);
  };

  const handleComposeMail = () => {
    setIsComposeOpen(true);
  };

  const handleMailClick = (announcementForUser: AnnouncementForUser) => {
    setSelectedMail(announcementForUser);
  };

  const handleBackToMails = () => {
    setSelectedMail(null);
  };

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
            <MailList announcementsForUser={announcementsForUser} handleMailClick={handleMailClick} />
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
