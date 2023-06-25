import { Mail } from "@/app/dashboard/page";
import { AnnouncementForUser } from "@/utils/StealthEmailUtils";
import { formatDistanceToNow } from "date-fns";
import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import { Web3Storage } from "web3.storage";

interface MailDetailsProps {
  selectedMail: AnnouncementForUser | null;
  handleBackToMails: () => void;
}

const MailDetails: React.FC<MailDetailsProps> = ({
  selectedMail,
  handleBackToMails,
}) => {
  const [mail, setMail] = useState<Mail | null>(null);

  useEffect(() => {
    const fetchMailFromStorage = async () => {
      try {
        if (selectedMail) {
          const bytes = ethers.utils.arrayify(selectedMail.announcement.cid);
          // Convert the bytes back to the original string
          const originalCid = ethers.utils.toUtf8String(bytes);

          const client = new Web3Storage({
            token: process.env.NEXT_PUBLIC_WEB3_STORAGE_API_KEY!,
          });
          const res = await client.get(originalCid);
          if (res != null) {
            console.log(`Got a response! [${res.status}] ${res.statusText}`);
            if (!res.ok) {
              throw new Error(
                `failed to get ${originalCid} - [${res.status}] ${res.statusText}`
              );
            }

            // unpack File objects from the response
            const files = await res.files();
            for (const file of files) {
              const data = await file.text();
              if (isJSONString(data)) {
                const _mail: Mail = {
                  from: selectedMail.announcement.from,
                  time: selectedMail.announcement.timestamp,
                  subject: JSON.parse(data).subject,
                  id: selectedMail.announcement.cid,
                  tab: "inbox",
                  message: JSON.parse(data).message,
                };
                setMail(_mail);
                console.log(`${_mail}`);
              }
            }
          }
        }
      } catch (error) {
        console.error("Error fetching cid:", error);
      }
    };

    fetchMailFromStorage();
  }, []);

  function isJSONString(str: string) {
    try {
      JSON.parse(str);
      return true;
    } catch (error) {
      return false;
    }
  }

  if (selectedMail === null) {
    return <></>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex justify-between items-center bg-blue-600 px-4 py-2">
        <h1 className="text-white font-semibold">Mailbox</h1>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded"
          onClick={handleBackToMails}
        >
          Back
        </button>
      </div>
      <div className="flex-1 bg-gray-100 flex">
       
        <div className="flex-1 p-6 overflow-y-auto">
          {mail ? (
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-center mb-4">
                <p className="text-lg font-semibold">from:{mail.from}</p>
                <button className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded">
                  Reply
                </button>
              </div>
              <div className="flex justify-between items-center mb-4">
                <p className="text-lg font-semibold">to:{'You'}</p>
                
              </div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">subject: {mail.subject}</h2>
                <p className="text-sm text-gray-500">
                  {formatDistanceToNow(parseInt(mail.time) * 1000)}
                </p>
              </div>
              
              <p className="text-gray-700 leading-relaxed">{mail.message}</p>
            </div>
          ) : (
            <p>Loading mail details...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MailDetails;
