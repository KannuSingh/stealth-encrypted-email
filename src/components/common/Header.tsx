import useAccount from "@/hooks/useAccount";

const menuItems = [
  {
    label: 'Home',
    url: '/'
  }
]

const Header = () => {
  // Sample menu options
  // const menuOptions = ['Home', 'About', 'Services', 'Contact'];
  const menuOptions : string[] = [];
  const {accounts,handleConnect,handleDisconnect} = useAccount()
  // Sample chain options
  const chainOptions : string[] = ['Ethereum', 'Binance Smart Chain', 'Polygon'];

  return (
    <header className="bg-gray-800 py-4 px-8 text-white flex items-center justify-between border-b-2 border-white-500 border-solid ">
      <div className="flex items-center">
        {/* <Image src="/logo.png" alt="E3 Wallet" className="h-8 w-auto mr-2" /> */}
        <h1 className="text-2xl font-semibold">{`Stealth Encrypted Email`}</h1>
      </div>

      <nav className="space-x-4">
        {menuOptions.map((option, index) => (
          <a key={index} href="/" className="text-gray-300 hover:text-white">{option}</a>
        ))}
      </nav>
      {accounts.length == 0 ?
        <div className="flex items-center ">
          <label htmlFor="chain" className="text-gray-300 mr-2">Select Chain:</label>
          <select id="chain" className="bg-gray-900 text-white  mr-2 px-2 py-1 rounded">
            {chainOptions.map((option, index) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </select>
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg text-sm"
            onClick={handleConnect}
          >
            Connect
          </button>
        </div>
      :
      <div className="flex items-center ">
        <button
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg text-sm"
            onClick={handleDisconnect}
          >
            Disconnect
          </button>
      </div>
      }
      
    </header>
  );
}

export default Header
