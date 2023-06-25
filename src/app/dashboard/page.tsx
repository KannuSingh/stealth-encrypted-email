'use client'
import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import MailDetails from '@/components/MailDetails';
import MailList from '@/components/MailList';
import ComposeMailForm from '@/components/ComposeMailForm';
import { ethers } from 'ethers';
import useAccount from '@/hooks/useAccount';
import { Announcement, AnnouncementForUser, isAnnouncementForUser } from '@/utils/StealthEmailUtils';

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
  const [announcementsForUser, setAnnouncementsForUser] = useState<AnnouncementForUser[]>([]);
  const stealthMailContractAddress = '0x45d1A5afdf1fBa11CC4e5E2Ca37Aa0BF7149B82A';
  const { signer,provider } = useAccount();
  const stealthMailABI = [
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "receiver",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "bytes32",
            "name": "pkx",
            "type": "bytes32"
          },
          {
            "indexed": false,
            "internalType": "bytes32",
            "name": "ciphertext",
            "type": "bytes32"
          },
          {
            "indexed": false,
            "internalType": "bytes32",
            "name": "cid",
            "type": "bytes32"
          }
        ],
        "name": "Announcement",
        "type": "event"
      },
      {
        "inputs": [
          {
            "internalType": "address payable",
            "name": "_receiver",
            "type": "address"
          },
          {
            "internalType": "bytes32",
            "name": "_pkx",
            "type": "bytes32"
          },
          {
            "internalType": "bytes32",
            "name": "_ciphertext",
            "type": "bytes32"
          },
          {
            "internalType": "bytes32",
            "name": "_cid",
            "type": "bytes32"
          }
        ],
        "name": "sendEmail",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
      }
    ];
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
            <MailList announcementsForUser={announcementsForUser} mailList={filteredMailList} handleMailClick={handleMailClick} />
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
