import { useState } from "react";
import { MdClose, MdMinimize } from "react-icons/md";
import * as IPFS from "ipfs-http-client";
import * as LitJsSdk from "@lit-protocol/lit-node-client";
import useAccount from "@/hooks/useAccount";
import { Web3Storage } from "web3.storage";

interface ComposeMailFormProps {
  onClose: () => void;
}

const ComposeMailForm: React.FC<ComposeMailFormProps> = ({ onClose }) => {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [minimized, setMinimized] = useState(false);

  const {  accounts,signer,provider,handleConnect } = useAccount();
  function makeFileObjects (formData:string) {
    // You can create File objects from a Blob of binary data
    // see: https://developer.mozilla.org/en-US/docs/Web/API/Blob
    // Here we're just storing a JSON object, but you can store images,
    // audio, or whatever you want!
    const blob = new Blob([formData], { type: 'application/json' })
  
    const files = [
      new File(['contents-of-file-1'], 'plain-utf8.txt'),
      new File([blob], 'email.json')
    ]
    return files
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(signer){
        
    }
    
    // Convert form data to a JSON object
    const formData = {
      to,
      subject,
      message,
    };
  

    try {
      const client = new Web3Storage({ token: process.env.NEXT_PUBLIC_WEB3_STORAGE_API_KEY! })

      console.log(client)
      const emailFile = makeFileObjects(JSON.stringify(formData))
      const cid = await client.put(emailFile);
      console.log(cid)
      setTo("");
      setSubject("");
      setMessage("");
  
      // Close the form
      onClose();
    } catch (error) {
      console.error("Error adding data to IPFS:", error);
    }
  };
  

  const handleToggleMinimize = () => {
    setMinimized((prevMinimized) => !prevMinimized);
  };

  if (minimized) {
    return (
      <div className="fixed bottom-0 right-0 bg-white p-4 shadow w-1/6">
        <div className="flex justify-between items-center">
          <button
            className="text-gray-600 hover:text-gray-800"
            onClick={handleToggleMinimize}
          >
            Open Compose Mail
          </button>
          <button className="text-gray-600 hover:text-gray-800" onClick={onClose}>
            <MdClose />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 right-0 bg-white p-4 shadow w-1/2">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold">Compose Mail</h3>
          <div>
            <button
              type="button"
              className="text-gray-600 hover:text-gray-800 mr-4"
              onClick={handleToggleMinimize}
            >
              <MdMinimize />
            </button>
            <button className="text-gray-600 hover:text-gray-800" onClick={onClose}>
              <MdClose />
            </button>
          </div>
        </div>
        <div>
          <label htmlFor="to" className="font-bold">
            To:
          </label>
          <input
            type="email"
            id="to"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="border border-gray-300 p-2 rounded w-full"
            required
          />
        </div>
        <div>
          <label htmlFor="subject" className="font-bold">
            Subject:
          </label>
          <input
            type="text"
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="border border-gray-300 p-2 rounded w-full"
            required
          />
        </div>
        <div>
          <label htmlFor="message" className="font-bold">
            Message:
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="border border-gray-300 p-2 rounded w-full"
            rows={4}
            required
          ></textarea>
        </div>
        <div className="flex justify-end">
          <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded">
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default ComposeMailForm;
