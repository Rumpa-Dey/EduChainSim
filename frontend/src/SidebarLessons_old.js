import React from 'react';

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
    title: 'Store and Retrieve',
    description: 'This contract allows users to store a number using setValue and retrieve it using getValue',
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
    title: 'Greet User',
    description: 'This contract returns a personalized greeting message by combining "Hello, " with the given name',
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
     description: 'This contract storing student records, each with an ID and name',

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
    title: 'Mapping Usage',
     description: 'This contract stores and retrieves student names using their ID with a mapping',

    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract StudentRegistry {
    // Mapping from student ID to student name
    mapping(uint => string) public studentNames;

    // Set student name by ID
    function setStudent(uint id, string memory name) public {
        studentNames[id] = name;
    }
   
}`
  },
{
    title: 'Struct and Mapping',
    description: 'This contract stores a struct in a mapping and retrieves it.',
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract StudentRegistry {
    struct Student {
        uint id;
        string name;
    }

    mapping(uint => Student) public students;

    function addStudent(uint id, string memory name) public {
        students[id] = Student(id, name);
    }
}`
  }



];

const SidebarLessons = ({ onSelectLesson }) => {
  return (
    <div style={{ width: '250px', backgroundColor: '#f4f4f4', padding: '10px', borderRight: '1px solid #ccc' }}>
      <h3>📘 Guided Lessons</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {lessons.map((lesson, index) => (
          <li key={index} style={{ marginBottom: '10px' }}>
            <button
              onClick={() => onSelectLesson(lesson.code)}
              style={{ width: '100%', padding: '5px', cursor: 'pointer' }}
            >
           <strong>{lesson.title}</strong>
           <p style={{ fontSize: '0.85em', color: '#555' }}>{lesson.description}</p>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SidebarLessons;
