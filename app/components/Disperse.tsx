"use client"

import React, { useState, useEffect } from 'react';
import { RiErrorWarningLine } from 'react-icons/ri';

interface DisperseProps {
  initialValue?: string;
}

const Disperse: React.FC<DisperseProps> = ({ initialValue = '' }) => {
  const [inputValue, setInputValue] = useState(initialValue);
  const [lineCount, setLineCount] = useState(1); // Initial line count
  const [errors, setErrors] = useState<{ line: number; message: string }[]>([]);
  const [duplicateAddresses, setDuplicateAddresses] = useState<{ address: string; lines: number[] }[]>([]);
  const [showOptions, setShowOptions] = useState(false); // To control the display of options

  useEffect(() => {
    // Update line count and errors whenever the input value changes
    const lines = inputValue.split('\n');
    setLineCount(lines.length);
    setErrors([]);
    // findDuplicateAddresses(lines);
  }, [inputValue]);

  const findDuplicateAddresses = (lines: string[]) => {
    const addressMap: { [address: string]: number[] } = {};

    lines.forEach((line, index) => {
      // Split the line into address and amount
      const [address] = line.split(/=|,| /);

      if (address) {
        if (addressMap[address]) {
          addressMap[address].push(index + 1);
        } else {
          addressMap[address] = [index + 1];
        }
      }
    });

    const duplicates = Object.entries(addressMap)
      .filter(([_, lines]) => lines.length > 1)
      .map(([address, lines]) => ({ address, lines }));

    setDuplicateAddresses(duplicates);
  };


  const handleDuplicateAddresses = () => {
    const lines = inputValue.split('\n');
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

  const handleCombineBalances = () => {
    const lines = inputValue.split('\n');
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

  const validateInput = () => {
    const lines = inputValue.split('\n');
    const newErrors: { line: number; message: string }[] = [];

    lines.forEach((line, index) => {
      // Split the line into address and amount
      const [address, amount] = line.split(/=|,| /);

      // Initialize variables to track errors
      let hasAddressError = false;
      let hasAmountError = false;

      // Check if address is valid (42 characters starting with '0x')
      if (!address || address.length !== 42 || !address.startsWith('0x')) {
        hasAddressError = true;
      }

      // Check if amount is valid (numeric)
      if (!amount || !/^\d+(\.\d+)?$/.test(amount)) {
        hasAmountError = true;
      }

      // Build the error message
      let errorMessage = '';
      if (hasAddressError && hasAmountError) {
        errorMessage = 'Invalid ethereum address and wrong amount';
      } else if (hasAddressError) {
        errorMessage = 'Invalid ethereum address';
      } else if (hasAmountError) {
        errorMessage = 'Wrong amount';
      }

      // Add the error message to the errors array if there is an error
      if (errorMessage) {
        newErrors.push({ line: index + 1, message: errorMessage });
      }
    });



    setErrors(newErrors);
    console.log("new errors", newErrors)

    if (newErrors.length === 0) {
      // No errors, show options for duplicate handling
      setShowOptions(true);
      findDuplicateAddresses(lines)
    }
  };

  return (
    <div className="w-full flex flex-col justify-center align-center">
      <div className="pb-8 w-full flex justify-between">
        <p>Address with Amounts</p>
        <p>Upload File</p>
      </div>
      <div className="w-full flex bg-black p-5">
        <div className="flex flex-col">
          {Array.from({ length: lineCount }, (_, index) => (
            <span key={index}>{index + 1}</span>
          ))}
        </div>
        <div className="height-full divider"></div>
        <textarea
          className="textarea bg-black w-full h-5/6 focus:outline-none"
          rows={10}
          cols={40}
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setErrors([]);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              setLineCount(lineCount + 1);
              setErrors([...errors, { line: lineCount + 1, message: '' }]);
            }
          }}
        />
      </div>
      <div className=' flex flex-col'>
        <div className="pt-8 w-full flex justify-between">
          <p>Separated by ',' or '' or '='</p>
          <p className="text-neutral-400">Show Example</p>
        </div>
        <div className={`errors text-red-700 flex  ${errors.length > 0 ? 'show-errors border-2 border-red-500 p-2 mt-5' : ''}`}>
          {errors.length > 0 ? <span className='mr-4 text-red-700'><RiErrorWarningLine /></span> : <></>}
          <div>
            {errors.map((error, index) => (
              <div key={index} className="error">
                Line {error.line}: {error.message}
              </div>
            ))}
          </div>
        </div>
        {showOptions && duplicateAddresses.length > 0 && (
          <div className="duplicate-options">
            <div className='mt-10 flex justify-between'>
              <p>Duplicate addresses found:</p>
              <div className=" flex justify-between w-3/6">
                <button className="text-red-700" onClick={() => handleDuplicateAddresses()}>Keep the first one</button>
                <button className="text-red-700" onClick={() => handleCombineBalances()}>Combine balances</button>
              </div>
            </div>
            <div className='flex border-2 rounded-md border-red-500 w-full p-3 mt-5'>
              <span className='mr-4 text-red-700'><RiErrorWarningLine /></span>
              <div>
                {duplicateAddresses.map((duplicate, index) => (
                  <p className='text-red-700' key={index}>Line {duplicate.lines.join(', ')} are duplicates</p>
                ))}
              </div>
            </div>
          </div>
        )}
        <button className="submitButton w-full rounded-full bg-violet-700 mt-12 h-12" onClick={validateInput}>
          Next
        </button>
      </div>
    </div>
  );
};

export default Disperse;








