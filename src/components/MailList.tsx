import React from 'react';
import { Mail } from '@/app/dashboard/page';
import { AnnouncementForUser } from '@/utils/StealthEmailUtils';
import { formatDistanceToNow } from 'date-fns';

interface MailListProps {
  announcementsForUser:AnnouncementForUser[]
  handleMailClick: (announcementForUser: AnnouncementForUser) => void;
}

const MailList: React.FC<MailListProps> = ({ announcementsForUser, handleMailClick }) => {
  if(announcementsForUser.length === 0){
    return <h3>No mails for user</h3>
  }
  
  return (
    <ul className="space-y-4">
      
       {announcementsForUser.map((announcementForUser,index) => (
        <li key={index}>
          <div
            className="bg-gray-100 p-4 rounded-lg cursor-pointer"
            onClick={() => {handleMailClick(announcementForUser)}}
          >
            <h3 className="font-bold">{'New Mail'}</h3>
            <p>From: {announcementForUser.announcement.from}</p>
            <p>Time: {formatDistanceToNow(parseInt(announcementForUser.announcement.timestamp)*1000)}</p>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default MailList;
