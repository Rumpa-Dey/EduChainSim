import React, { useState, useEffect } from 'react';

const CodeEditor = ({ code, onChange, onCompile }) => {
  const [internalCode, setInternalCode] = useState(code || '');

  // 🔁 Sync with parent whenever `code` prop changes (like from guided lesson)
  useEffect(() => {
    setInternalCode(code);
  }, [code]);

  // 📤 Notify parent when user edits the code manually
  const handleChange = (e) => {
    setInternalCode(e.target.value);
    onChange?.(e.target.value);
  };

  return (
    <div>
      <textarea
        value={internalCode}
        onChange={handleChange}
        rows={15}
        cols={60}
        style={{ fontFamily: 'monospace', fontSize: '14px' }}
      />
      <br />
      <button onClick={() => onCompile(internalCode)}>Compile</button>
    </div>
  );
};

export default CodeEditor;
