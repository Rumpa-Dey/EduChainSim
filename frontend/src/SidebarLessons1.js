import React, { useState } from 'react';

const lessons = [
  {
    title: 'Simple Store/Retrieve',
    description: 'Store and retrieve a single value.',
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract StoreRetrieve {
    uint public value;

    function setValue(uint _value) public {
        value = _value;
    }

    function getValue() public view returns (uint) {
        return value;
    }
}`
  },
  {
    title: 'Greet with Name',
    description: 'Takes a name and returns a greeting.',
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Greeter {
    function greet(string memory name) public pure returns (string memory) {
        return string(abi.encodePacked("Hello, ", name, "!"));
    }
}`
  },
  {
    title: 'Add Student Struct',
    description: 'Adds a student using struct and stores it in an array.',
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract StudentRegistry {
    struct Student {
        uint id;
        string name;
    }
    Student[] public students;

    function addStudent(uint _id, string memory _name) public {
        students.push(Student(_id, _name));
    }
}`
  },
];

const SidebarLessons = ({ onSelectLesson }) => {
  const [current, setCurrent] = useState(0);

  const handleNext = () => {
    const nextIndex = (current + 1) % lessons.length;
    setCurrent(nextIndex);
    onSelectLesson(lessons[nextIndex].code);
  };

  const handlePrev = () => {
    const prevIndex = (current - 1 + lessons.length) % lessons.length;
    setCurrent(prevIndex);
    onSelectLesson(lessons[prevIndex].code);
  };

  return (
    <div style={{ width: '250px', backgroundColor: '#f4f4f4', padding: '10px', borderRight: '1px solid #ccc' }}>
      <h3>📘 Guided Lessons</h3>
      <h4>{lessons[current].title}</h4>
      <p style={{ fontSize: '0.9em' }}>{lessons[current].description}</p>

      <div style={{ marginTop: '10px' }}>
        <button onClick={handlePrev} disabled={lessons.length <= 1}>⬅️ Previous</button>
        <button onClick={handleNext} style={{ marginLeft: '10px' }} disabled={lessons.length <= 1}>Next ➡️</button>
      </div>
    </div>
  );
};

export default SidebarLessons;
