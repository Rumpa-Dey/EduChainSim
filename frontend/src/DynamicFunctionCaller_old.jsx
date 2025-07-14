import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

function DynamicFunctionCaller({ abi, contractAddress }) {
  const [result, setResult] = useState('');
  const [inputs, setInputs] = useState({});
  const [contract, setContract] = useState(null);
  const [gasHistory, setGasHistory] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});


  useEffect(() => {
    const setup = async () => {
      if (!window.ethereum) {
        alert('⚠️ Please install MetaMask.');
        return;
      }

      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const instance = new ethers.Contract(contractAddress, abi, signer);
        setContract(instance);
      } catch (err) {
        console.error("Wallet connection error:", err);
        alert('❌ Wallet connection failed.');
      }
    };

    setup();
  }, [contractAddress, abi]);

  const handleChange = (funcName, index, value) => {
    setInputs(prev => ({
      ...prev,
      [funcName]: {
        ...prev[funcName],
        [index]: value
      }
    }));

// Example: String input validation
  if (value.trim() === "") {
    setValidationErrors(prev => ({
      ...prev,
      [funcName]: {
        ...prev[funcName],
        [index]: "This field cannot be empty."
      }
    }));
  } else {
    setValidationErrors(prev => {
      const updatedFuncErrors = { ...(prev[funcName] || {}) };
      delete updatedFuncErrors[index];

      return {
        ...prev,
        [funcName]: updatedFuncErrors
      };
    });
  }
};

 



const parseTypedValue = (value, type) => {
  if (type.endsWith("[]")) {
    const baseType = type.slice(0, -2);

    // Handle struct arrays
    if (baseType.includes("tuple")) {
      try {
        return JSON.parse(value);
      } catch {
        throw new Error(
          `❌ Invalid input for array of structs:\n"${value}"\n\n` +
          `✅ Example: [[1, "Alice"], [2, "Bob"]]\n` +
          `ℹ️ Use proper JSON format with square brackets and double quotes.`
        );
      }
    }

    // Primitive array types
    try {
      return value.split(',').map(v => parseTypedValue(v.trim(), baseType));
    } catch {
      throw new Error(
        `❌ Invalid input for array of ${baseType}:\n"${value}"\n\n` +
        `✅ Example: 1,2,3 for uint[], true,false for bool[], etc.`
      );
    }
  }

  if (type.startsWith('uint') || type.startsWith('int')) {
    if (!/^[-+]?\d+$/.test(value)) {
      throw new Error(
        `❌ Invalid number for type ${type}:\n"${value}"\n\n` +
        `✅ Example: 42 or -17`
      );
    }
    return BigInt(value);
  }

  if (type === 'bool') {
    if (value !== 'true' && value !== 'false') {
      throw new Error(
        `❌ Invalid boolean value:\n"${value}"\n\n` +
        `✅ Use either 'true' or 'false'`
      );
    }
    return value === 'true';
  }

  if (type === 'address') {
    if (!ethers.isAddress(value)) {
      throw new Error(
        `❌ Invalid Ethereum address:\n"${value}"\n\n` +
        `✅ Example: 0x1234...abcd`
      );
    }
    return value;
  }

 if (type === 'string') {
        return value;
      }

 if (type.startsWith('bytes')) {
    return value;
  }

  if (type === 'tuple') {
    try {
      return JSON.parse(value);
    } catch {
      throw new Error(
        `❌ Invalid tuple input:\n"${value}"\n\n` +
        `✅ Example: [1, "Alice"]\n` +
        `ℹ️ Use JSON format with square brackets and double quotes.`
      );
    }
  }

  throw new Error(`❌ Unsupported input type: ${type}`);
};






  

  const formatOutput = (output) => {
    if (Array.isArray(output)) return `[${output.map(formatOutput).join(', ')}]`;
    if (typeof output === 'bigint') return output.toString();
    if (output && typeof output === 'object') {
      try {
        return JSON.stringify(output, (_, v) => typeof v === 'bigint' ? v.toString() : v, 2);
      } catch {
        return output.toString();
      }
    }
    return output;
  };




  const callFunction = async (func) => {
    if (!contract) {
      setResult("❌ Contract not ready.");
      return;
    }

    try {
      const rawInputs = inputs[func.name] || {};
      const newErrors = {};
      const inputArray = (func.inputs || []).map((input, i) =>
      {
    try {
      return parseTypedValue(rawInputs[i] ?? "", input.type);
    } catch (err) {
      newErrors[i] = err.message;
      throw err;
    }
  });
     
     setValidationErrors({ [func.name]: newErrors });

      const overrides = {};
      if (func.stateMutability === 'payable' && rawInputs['value']) {
        overrides.value = ethers.parseEther(rawInputs['value']);
      }


// For view and pure functions
    if (func.stateMutability === 'view' || func.stateMutability === 'pure') {
      const output = await contract[func.name](...inputArray);
      setResult(`📘 Output from ${func.name}: ${formatOutput(output)}`);
      
    }else {

    // For transactions (nonpayable or payable)
    const tx = await contract[func.name](...inputArray, overrides);
    const receipt = await tx.wait();
    // ✅ Extract gas used
      const gasUsed = receipt.gasUsed?.toString?.() || 'unknown';
      setResult(`✅ Transaction successful:\nGas Used: ${gasUsed}`);

     // ⬇️ Add this to update leaderboard
      setGasHistory(prev => [
      ...prev,
     {
    name: func.name,
    gas: gasUsed,
    hash: receipt.transactionHash
  }
]);

    }  
    } catch (err) {
      console.error(err);
      setResult(`❌ Error calling ${func.name}: ${err.message}`);
    }
  };


return (
  <div>
    <h3>🔧 Interact with Contract</h3>

    {abi
      .filter(item => item.type === 'function')
      .map((func, index) => (
        <div key={index} style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc' }}>
          <h4>{func.name}</h4>

          {func.inputs.map((input, i) => (
            <div key={i}>

              <input
                placeholder={`${input.name || 'param'} (${input.type})`}
                onChange={(e) => handleChange(func.name, i, e.target.value)}
                style={{ marginRight: '10px', width: '300px' }}
              />

              {validationErrors[func.name]?.[i] && (
                <div style={{ color: 'red', fontSize: '0.8em' }}>
                  ⚠️ {validationErrors[func.name][i]}
                 </div>
               )}




              {input.type.startsWith("tuple") && (
                <div style={{ fontSize: '0.8em', color: '#666' }}>
                  ⚠️ Enter as JSON (object or array): [[1, "Alice"], [2, "Bob"]] or [1,2]
                    (Use square brackets, double quotes for strings)                
                     </div>
              )}
              
             {validationErrors[func.name]?.[i] && (
                <div style={{ color: 'red', fontSize: '0.8em' }}>
                  ⚠️ {validationErrors[func.name][i]}
                 </div>
               )}


            </div>
          ))}




{/* ETH input for payable functions */}
          {func.stateMutability === 'payable' && (
            <input
              placeholder="value in ETH"
              onChange={(e) => handleChange(func.name, 'value', e.target.value)}
              style={{ marginTop: '5px', marginBottom: '5px', width: '200px' }}
            />
           
             

          )}

          <br />
          <button onClick={() => callFunction(func)}>Call</button>
        </div>
      ))}

    {result && (
      <div style={{ whiteSpace: 'pre-wrap', marginTop: '20px', backgroundColor: '#f5f5f5', padding: '10px' }}>
        <strong>{result}</strong>
      </div>
    )}

    {gasHistory.length > 0 && (
      <div>
        <h3>⛽ Gas Usage Leaderboard</h3>
        <table border="1" cellPadding="6">
          <thead>
            <tr>
              <th>Function</th>
              <th>Gas Used</th>
             
            </tr>
          </thead>
          <tbody>

            {[...gasHistory]
             .sort((a, b) => a.gas - b.gas)
             .map((entry, i) => (
              <tr key={i}>
                <td>{entry.name ?? 'Unknown'}</td>
                <td>{entry.gas ?? 'N/A'}</td>
               
                               
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

  






}

export default DynamicFunctionCaller;
