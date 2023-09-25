"use client"

import React, { useState, useEffect } from 'react';

interface DisperseProps {
  initialValue?: string;
}

const Disperse: React.FC<DisperseProps> = ({ initialValue = '' }) => {
  const [inputValue, setInputValue] = useState(initialValue);
  const [lineCount, setLineCount] = useState(1); // Initial line count
  const [errors, setErrors] = useState<{ line: number; message: string }[]>([]);
  const [duplicateAddresses, setDuplicateAddresses] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<'keepFirst' | 'combineBalances' | ''>('');

  useEffect(() => {
    // Update line count and errors whenever the input value changes
    const lines = inputValue.split('\n');
    setLineCount(lines.length);
    setErrors([]);
    findDuplicateAddresses(lines);
  }, [inputValue]);

  const findDuplicateAddresses = (lines: string[]) => {
    const addresses: string[] = [];
    const duplicates: string[] = [];

    lines.forEach((line, index) => {
      // Split the line into address and amount
      const [address] = line.split(/=|,| /);

      if (address) {
        if (addresses.includes(address)) {
          if (!duplicates.includes(address)) {
            duplicates.push(address);
          }
        } else {
          addresses.push(address);
        }
      }
    });

    setDuplicateAddresses(duplicates);
  };

  const handleOptionChange = (option: 'keepFirst' | 'combineBalances' | '') => {
    setSelectedOption(option);
  };

  const validateInput = () => {
    const lines = inputValue.split('\n');
    const newErrors: { line: number; message: string }[] = [];

    lines.forEach((line, index) => {
      // Split the line into address and amount
      const [address, amount] = line.split(/=|,| /);

      // Check if address is valid (42 characters starting with '0x')
      if (!address || address.length !== 42 || !address.startsWith('0x')) {
        newErrors.push({ line: index + 1, message: `Invalid address` });
      }

      // Check if amount is valid (numeric)
      if (!amount || isNaN(parseFloat(amount))) {
        newErrors.push({ line: index + 1, message: `Invalid amount` });
      }
    });

    setErrors(newErrors);

    if (newErrors.length === 0) {
      // No errors, handle duplicates based on the selected option
      if (selectedOption === 'keepFirst') {
        handleDuplicateAddresses(lines);
      } else if (selectedOption === 'combineBalances') {
        handleCombineBalances(lines);
      }
    }
  };

  const handleDuplicateAddresses = (lines: string[]) => {
    const uniqueLines: string[] = [];
    const addresses: string[] = [];

    lines.forEach((line) => {
      const [address] = line.split(/=|,| /);
      if (!addresses.includes(address)) {
        uniqueLines.push(line);
        addresses.push(address);
      }
    });

    setInputValue(uniqueLines.join('\n'));
  };

  const handleCombineBalances = (lines: string[]) => {
    const addressToBalanceMap: { [key: string]: number } = {};

    lines.forEach((line) => {
      const [address, amount] = line.split(/=|,| /);
      if (address && amount) {
        const balance = parseFloat(amount);
        if (!isNaN(balance)) {
          if (addressToBalanceMap[address]) {
            addressToBalanceMap[address] += balance;
          } else {
            addressToBalanceMap[address] = balance;
          }
        }
      }
    });

    const combinedLines = Object.entries(addressToBalanceMap).map(([address, balance]) => `${address}=${balance}`);
    setInputValue(combinedLines.join('\n'));
  };

  return (
    <div className='w-full flex flex-col justify-center align-center' >
      <div className='pb-8 w-full flex justify-between'><p>Address with Amounts</p> <p>Upload File</p></div>
      <div className='w-full flex bg-black p-5 '>
        <div className="flex flex-col">
          {Array.from({ length: lineCount }, (_, index) => (
            <span key={index}>{index + 1}</span>
          ))}
        </div>
        <div className='height-full divider	'></div>
        <textarea
          className='textarea bg-black w-full h-5/6 focus:outline-none 	'
          rows={10} // Adjust the number of rows as needed
          cols={40}
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setErrors([]);
          }}
          onKeyDown={(e) => {
            // Increase line count when "Enter" key is pressed
            if (e.key === 'Enter') {
              setLineCount(lineCount + 1);
              setErrors([...errors, { line: lineCount + 1, message: '' }]);
            }
          }}
        />
      </div>
      <div>
        <div className='pt-8 w-full flex justify-between'><p>Seperated by ',' or '' or '='</p> <p className='text-neutral-400	'>Show Example</p></div>
        <div className={`errors text-red-700	 ${errors.length > 0 ? 'show-errors border-2 border-red-500 p-2 mt-5' : ''}`}>
          {errors.map((error, index) => (
            <div key={index} className="error">
              Line {error.line}: {error.message}
            </div>
          ))}
        </div>
        {duplicateAddresses.length > 0 && (
          <div className="duplicate-options">
            <p>
              Duplicate addresses found: {duplicateAddresses.map((address, index) => (
                <span key={index}>
                  {index > 0 && ', '}
                  {address}
                </span>
              ))}
            </p>
            <div className='mt-10 flex justify-between w-3/12 self-end'>
              <button className='text-red-700' onClick={() => handleOptionChange('keepFirst')}>Keep the first one</button>
              <button className='text-red-700' onClick={() => handleOptionChange('combineBalances')}>Combine balances</button>
            </div>
          </div>
        )}
        <button className=' submitButton w-full rounded-full bg-violet-700 mt-24 h-12 	' onClick={validateInput}>Next</button>
      </div>
    </div>
  );
};

export default Disperse;







