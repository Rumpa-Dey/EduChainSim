import React from 'react';
import CodeEditor from './CodeEditor';

function App() {
  const handleCompile = async (sourceCode) => {
    try {
      const response = await fetch('http://localhost:4000/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: sourceCode }),
      });

      const output = await response.json();

      if (output.errors) {
        console.error("Compiler errors/warnings:", output.errors);
        alert("Compilation completed with errors or warnings. Check console.");
      }

      const contractFile = output.contracts['Contract.sol'];
      const contractName = Object.keys(contractFile)[0];
      const abi = contractFile[contractName].abi;
      const bytecode = contractFile[contractName].evm.bytecode.object;

      alert(`✅ Contract compiled!\n\nName: ${contractName}`);
      //console.log("ABI:", abi);
      //console.log("Bytecode:", bytecode);
    } catch (err) {
      console.error("Compilation failed:", err);
   if (err.response?.data?.errors) {
        alert('❌ Compilation error:\n' + err.response.data.errors.map(e => e.formattedMessage).join('\n'));
      } else {
        alert('❌ Unexpected error: ' + err.message);
      }
      
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>EduChainSim: Solidity Playground</h1>
      <CodeEditor onCompile={handleCompile} />
    </div>
  );
}

export default App;
