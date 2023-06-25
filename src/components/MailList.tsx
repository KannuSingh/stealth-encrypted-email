import React from 'react';
import { Mail } from '@/app/dashboard/page';

interface MailListProps {
  mailList: Mail[];
  handleMailClick: (mail: Mail) => void;
}

const MailList: React.FC<MailListProps> = ({ mailList, handleMailClick }) => {
  return (
    <ul className="space-y-4">
      {mailList.map((mail) => (
        <li key={mail.id}>
          <div
            className="bg-gray-100 p-4 rounded-lg cursor-pointer"
            onClick={() => handleMailClick(mail)}
          >
            <h3 className="font-bold">{mail.subject}</h3>
            <p>From: {mail.from}</p>
            <p>Time: {mail.time}</p>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default MailList;
