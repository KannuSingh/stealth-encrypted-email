import { Mail } from "@/app/dashboard/page";

import React from 'react';

interface MailDetailsProps {
  selectedMail: Mail | null;
  handleBackToMails: () => void;
}

const MailDetails: React.FC<MailDetailsProps> = ({
  selectedMail,
  handleBackToMails,
}) => {
  if (!selectedMail) {
    return null;
  }

  return (
    <div>
      <button
        className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded mb-4"
        onClick={handleBackToMails}
      >
        Back
      </button>
      <div className="bg-gray-100 p-4 rounded-lg">
        <h3 className="font-bold">{selectedMail.subject}</h3>
        <p>From: {selectedMail.from}</p>
        <p>Time: {selectedMail.time}</p>
        {/* Render the mail content here */}
      </div>
    </div>
  );
};

export default MailDetails;
