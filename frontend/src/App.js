import React, { useState } from 'react';
import SidebarLessons from './SidebarLessons';
import CodeEditor from './CodeEditor';
import DynamicFunctionCaller from './DynamicFunctionCaller';

import { ethers } from 'ethers';

function App() {
  const [compiledContract, setCompiledContract] = useState(null);
  const [deployedAddress, setDeployedAddress] = useState(null);
  const [editorCode, setEditorCode] = useState('');

  
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
        return;
      }

      //const contractFile = output.contracts['Contract.sol'];
      const contractFileName = Object.keys(output.contracts)[0];
      const contractFile = output.contracts[contractFileName];
      const contractName = Object.keys(contractFile)[0];
      const abi = contractFile[contractName].abi;
      const bytecode = contractFile[contractName].evm.bytecode.object;

     setCompiledContract({ abi, bytecode });  //newly added
  

      alert(`✅ Contract compiled!\n\nName: ${contractName}`);
      setCompiledContract({ abi, bytecode });
    } catch (err) {
      console.error("Compilation failed:", err);
      alert('❌ Compilation failed. Check console for details.');
    }
  };

  const handleDeploy = async () => {
    if (!compiledContract) {
      alert("Please compile a contract first.");
      return;
    }

    try {
      // Connect to local Hardhat node
      const provider = new ethers.JsonRpcProvider("http://localhost:8545");

      // Get the first account from local Hardhat node
      const signer = await provider.getSigner(0);

      // Create contract factory and deploy
      const factory = new ethers.ContractFactory(compiledContract.abi, compiledContract.bytecode, signer);
      const contract = await factory.deploy();

      alert(`🚀 Contract deployed at: ${contract.target}`);
      setDeployedAddress(contract.target);
      console.log("Deployed contract:", contract);
    } catch (err) {
      console.error("Deployment failed:", err);
      alert("❌ Deployment failed. Check console for details.");
    }
  };

  
return (
  <div style={{ display: 'flex' }}>
    {/* 🧠 Sidebar for lessons */}
    <SidebarLessons
    onSelectLesson={(code) => {
    setEditorCode(code);           // Load the new lesson into editor
    setCompiledContract(null);     // Clear old compiled contract
    setDeployedAddress(null);      // Clear old deployed address
    
  }}
/>


    {/* 🎯 Main content area */}
    <div style={{ flex: 1, padding: '20px' }}>
      <h1>EduChainSim: Solidity Playground</h1>

      {/* 🧑‍💻 Code Editor */}
     <CodeEditor
  code={editorCode}
  onChange={setEditorCode}
  onCompile={handleCompile}
/>

    
      <button
        onClick={handleDeploy}
        disabled={!compiledContract}
        style={{ marginTop: '10px' }}
      >
        Deploy
      </button>

      {/* 📟 Deployed contract interaction */}
      {compiledContract && deployedAddress && (
        <DynamicFunctionCaller
          abi={compiledContract.abi}
          contractAddress={deployedAddress}
        />
      )}
    </div>
  </div>
);


}

export default App;
