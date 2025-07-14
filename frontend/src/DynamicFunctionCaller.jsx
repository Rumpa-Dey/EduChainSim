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

  const handleChange = (funcName, index, value, type) => {
  setInputs(prev => ({
    ...prev,
    [funcName]: {
      ...prev[funcName],
      [index]: value
    }
  }));

  // Real-time validation: try parsing the value
  try {
    parseTypedValue(value, type); // This will throw error if invalid
    // ✅ Valid input, clear error
    setValidationErrors(prev => {
      const updated = { ...(prev[funcName] || {}) };
      delete updated[index];
      return {
        ...prev,
        [funcName]: updated
      };
    });
  } catch (err) {
   const message = value.trim() === ""
    ? "This field cannot be empty."
    : err.message;
    


     setValidationErrors(prev => ({
      ...prev,
      [funcName]: {
        ...(prev[funcName] || {}),
        [index]: err.message
      }
    }));
  }
};


const handleReset = (funcName) => {
  setInputs(prev => ({ ...prev, [funcName]: {} }));
  setValidationErrors(prev => ({ ...prev, [funcName]: undefined }));
  setResult('');
};
 

// Reset all input states, errors, results, and gas history
const handleResetAll = () => {
  setInputs({});
  setValidationErrors({});
  setResult('');
  setGasHistory([]);
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
          `✅ Example: [[1, "Alice"], [2, "Bob"]]` 
          
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
        `✅ Example: [1, "Alice"]`
        
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
    const inputArray = [];
    const newErrors = {};

    // 🧠 Validate and parse inputs one by one
    for (let i = 0; i < (func.inputs || []).length; i++) {
      const input = func.inputs[i];
      try {
        const parsed = parseTypedValue(rawInputs[i] ?? "", input.type);
        inputArray.push(parsed);
      } catch (err) {
        newErrors[i] = err.message;
      }
    }

    // 🔁 Save all input-level validation errors
    setValidationErrors({ [func.name]: newErrors });

    // 🚫 Abort if any validation errors exist
    if (Object.keys(newErrors).length > 0) {
      setResult(`❌ Please fix the input errors before calling ${func.name}.`);
      return;
    }

    // ⚙️ Prepare value override for payable functions
    const overrides = {};
    if (func.stateMutability === 'payable' && rawInputs['value']) {
      overrides.value = ethers.parseEther(rawInputs['value']);
    }

    // 📘 Handle view/pure calls
    if (func.stateMutability === 'view' || func.stateMutability === 'pure') {
      const output = await contract[func.name](...inputArray);
      setResult(`📘 Output from ${func.name}: ${formatOutput(output)}`);
    
    } else {
      // 🔁 Send transaction for state-changing functions
      const tx = await contract[func.name](...inputArray, overrides);
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed?.toString?.() || 'unknown';

      // ✅ Transaction success and gas usage
      setResult(`✅ Transaction successful:\nGas Used: ${gasUsed}`);

      // 📊 Update leaderboard
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
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
  <h3 style={{ margin: 0 }}>🔧 Interact with Contract</h3>
  <button onClick={handleResetAll} style={{
    backgroundColor: '#f44336',
    color: 'white',
    padding: '8px 16px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9em'
  }}>
    🔄 Reset All
  </button>
</div>






    {abi
      .filter(item => item.type === 'function')
      .map((func, index) => (
        <div key={index} style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc' }}>
          <h4>{func.name}</h4>

          {func.inputs.map((input, i) => (
            <div key={i}>

              <input
                placeholder={`${input.name || 'param'} (${input.type})`}
                value={inputs[func.name]?.[i] || ''}                
onChange={(e) => handleChange(func.name, i, e.target.value, input.type)}
                style={{ marginRight: '10px', width: '300px' }}
              />


            {input.type.endsWith("[]") && !input.type.startsWith("tuple") && (
             <div style={{ fontSize: '1em', color: 'blue' }}>
             ⚠️ Enter comma-separated values, e.g., <code>1,2,3</code>
             </div>
             )} 

        
             {input.type.startsWith("tuple") && (
                <div style={{ fontSize: '1em', color: 'blue' }}>
                  ⚠️ Enter data as: [[1, "Alice"], [2, "Bob"]] 
                                 
                 </div>
              )}
             



 
             {validationErrors[func.name]?.[i] && (
                <div style={{ color: 'red', fontSize: '1.2em', marginTop: '5px', backgroundColor: '#fff0f0', padding: '5px',
                    border: '0.5px solid #ffcccc', whiteSpace: 'pre-wrap',  }}>
                   {validationErrors[func.name][i]}
                 </div>
               )}


            </div>
          ))}




{/* ETH input for payable functions */}
          {func.stateMutability === 'payable' && (
            <input
              placeholder="value in ETH"
             value={inputs[func.name]?.['value'] || ''} 
             onChange={(e) => handleChange(func.name, 'value', e.target.value)}
              style={{ marginTop: '5px', marginBottom: '5px', width: '200px' }}
            />
           
             

          )}

          <br />
         <div style={{ marginTop: '10px' }}>
          <button onClick={() => callFunction(func)}>Call</button>
        

        <button
    onClick={() => {
      setInputs(prev => ({ ...prev, [func.name]: {} }));
      setValidationErrors(prev => ({ ...prev, [func.name]: {} }));
      setResult('');
    }}
    style={{ marginLeft: '10px', backgroundColor: '#f5f5f5', border: '1px solid #ccc', padding: '4px 10px' }}
  >
    🔄 Reset
  </button>

</div>


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
