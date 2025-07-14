// backend/server.js
const express = require('express');
const solc = require('solc');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/compile', (req, res) => {
  const sourceCode = req.body.code;

  const input = {
    language: 'Solidity',
    sources: {
      'Contract.sol': {
        content: sourceCode,
      },
    },
    settings: {
      outputSelection: {
        '*': {
          '*': ['abi', 'evm.bytecode'],
        },
      },
    },
  };

  try {
    const output = JSON.parse(solc.compile(JSON.stringify(input)));
    res.json(output);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(4000, () => {
  console.log('Compiler backend running at http://localhost:4000');
});
