import React, { useState } from 'react';

const lessons = [
  {
    title: 'Simple Add Function',
    description: 'This contract returns the sum of two integers passed to it.',
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Adder {
    function add(uint a, uint b) public pure returns (uint) {
        return a + b;
    }
}`
  },
  {
    title: 'Simple If-Else',
    description: 'This contract returns "Pass" or "Fail" based on input marks.',
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Grade {
    function check(uint marks) public pure returns (string memory) {
        if (marks >= 40) {
            return "Pass";
        } else {
            return "Fail";
        }
    }
}`
  },
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
    description: 'Takes a name and returns a greeting message by combining "Hello, " with the given name',
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Greeter {
    function greet(string memory name) public pure returns (string memory) {
        return string(abi.encodePacked("Hello, ", name, "!"));
    }
}`
  },
  {
    title: 'Loop-based Sum',
    description: 'This program returns the sum of all elements in an array.',
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract LoopSum {
    function sum(uint[] memory nums) public pure returns (uint total) {
        for (uint i = 0; i < nums.length; i++) {
            total += nums[i];
        }
    }
}`
  },
  {
    title: 'Struct Example',
    description: 'This contract stores student records, each with an ID and name.',
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
  {
    title: 'Student Mapping',
    description: 'Store student names mapped by ID.',
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract StudentRegistry {
    mapping(uint => string) public studentNames;

    function setStudent(uint id, string memory name) public {
        studentNames[id] = name;
    }
}`
  }
];

const SidebarLessons = ({ onSelectLesson }) => {
  const [current, setCurrent] = useState(0);
  const [completedLessons, setCompletedLessons] = useState([]);

  const handleSelectLesson = (index) => {
    if (index <= completedLessons.length) {
      setCurrent(index);
      onSelectLesson(lessons[index].code);
    }
  };

  const handleComplete = () => {
    if (!completedLessons.includes(current)) {
      setCompletedLessons([...completedLessons, current]);
    }
  };

  const handleReset = () => {
    setCompletedLessons([]);
    setCurrent(0);
    onSelectLesson(lessons[0].code);
  };

  const isLocked = (index) => index > completedLessons.length;

  return (
    <div style={{ width: '250px', backgroundColor: '#f4f4f4', padding: '10px', borderRight: '1px solid #ccc' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>📘 Guided Lessons</h3>
        <button onClick={handleReset} style={{ fontSize: '0.8em', background: '#eee', border: '1px solid #aaa', padding: '4px 6px' }}>
          🔄 Reset
        </button>
      </div>

      <p>Lesson {current + 1} of {lessons.length}</p>
      <h4>{lessons[current].title}</h4>
      <p style={{ fontSize: '0.9em' }}>{lessons[current].description}</p>

      <button onClick={handleComplete} style={{ marginBottom: '10px' }}>
        ✅ Mark as Completed
      </button>

      <hr />
      <h4>Lesson List</h4>
      <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
        {lessons.map((lesson, index) => (
          <li key={index} style={{ marginBottom: '8px' }}>
            <button
              onClick={() => handleSelectLesson(index)}
              disabled={isLocked(index)}
              style={{
                width: '100%',
                textAlign: 'left',
                backgroundColor: current === index ? '#d0f0ff' : '#fff',
                border: '1px solid #ccc',
                padding: '6px',
                opacity: isLocked(index) ? 0.5 : 1
              }}
            >
              {lesson.title} {completedLessons.includes(index) ? '✅' : ''}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SidebarLessons;
