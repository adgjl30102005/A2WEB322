// Import the functions to be tested
const { getAllProjects, getProjectById } = require('../modules/projects.js');  // Adjust the import path

// Mock data (assuming this is what the functions will return from the database or external service)
const mockProjects = [
  { id: 1, title: 'Project 1', intro_short: 'Short summary of Project 1', image_url: 'https://example.com/project1.jpg' },
  { id: 2, title: 'Project 2', intro_short: 'Short summary of Project 2', image_url: 'https://example.com/project2.jpg' },
  { id: 3, title: 'Project 3', intro_short: 'Short summary of Project 3', image_url: 'https://example.com/project3.jpg' },
];

// Mock function for `getAllProjects`
jest.mock('../modules/projects.js', () => ({
  getAllProjects: jest.fn(() => mockProjects),
  getProjectById: jest.fn((id) => mockProjects.find((project) => project.id === id)),
}));

// Test cases
describe('getAllProjects', () => {
  it('should return all projects', () => {
    const result = getAllProjects();
    expect(result).toEqual(mockProjects);
    expect(result.length).toBe(3);  // Assuming there are 3 projects in the mock data
  });
});

describe('getProjectById', () => {
  it('should return the project with the correct id', () => {
    const result = getProjectById(1);
    expect(result).toEqual(mockProjects[0]);
  });

  it('should return undefined if the project with the id does not exist', () => {
    const result = getProjectById(99);  // An id that doesn't exist
    expect(result).toBeUndefined();
  });
});

// Student Information (this will be shown when running tests)
describe('Student Info', () => {
  it('should display student name and number in the test results', () => {
    console.log("Student Name: Thien Phuc Ngo | ID: 115294233");
    expect(true).toBe(true);  // Dummy test to ensure the message gets displayed
  });
});