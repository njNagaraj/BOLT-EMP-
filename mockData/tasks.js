const tasks = [
  {
    id: "1",
    title: "Implement user authentication",
    description: "Create login and registration functionality with JWT",
    status: "completed",
    priority: "high",
    assignedTo: "2",
    createdAt: "2023-10-01T09:00:00Z",
    dueDate: "2023-10-05T17:00:00Z"
  },
  {
    id: "2",
    title: "Design dashboard UI",
    description: "Create wireframes and mockups for the admin and employee dashboards",
    status: "in-progress",
    priority: "medium",
    assignedTo: "3",
    createdAt: "2023-10-02T10:30:00Z",
    dueDate: "2023-10-08T17:00:00Z"
  },
  {
    id: "3",
    title: "Fix login page responsiveness",
    description: "Ensure the login page works well on mobile devices",
    status: "pending",
    priority: "low",
    assignedTo: "3",
    createdAt: "2023-10-03T11:15:00Z",
    dueDate: "2023-10-07T17:00:00Z"
  },
  {
    id: "4",
    title: "Implement unit tests for API",
    description: "Write comprehensive tests for all API endpoints",
    status: "pending",
    priority: "medium",
    assignedTo: "4",
    createdAt: "2023-10-03T14:00:00Z",
    dueDate: "2023-10-10T17:00:00Z"
  },
  {
    id: "5",
    title: "Update documentation",
    description: "Update the API documentation with new endpoints",
    status: "pending",
    priority: "low",
    assignedTo: "2",
    createdAt: "2023-10-04T09:30:00Z",
    dueDate: "2023-10-12T17:00:00Z"
  },
  {
    id: "6",
    title: "Setup CI/CD pipeline",
    description: "Configure GitHub Actions for automated testing and deployment",
    status: "in-progress",
    priority: "high",
    assignedTo: "2",
    createdAt: "2023-10-05T10:00:00Z",
    dueDate: "2023-10-15T17:00:00Z"
  },
  {
    id: "7",
    title: "Create user onboarding flow",
    description: "Design and implement the onboarding experience for new users",
    status: "pending",
    priority: "medium",
    assignedTo: "3",
    createdAt: "2023-10-06T11:30:00Z",
    dueDate: "2023-10-20T17:00:00Z"
  },
  {
    id: "8",
    title: "Resolve customer reported bugs",
    description: "Fix issues reported by users in the support ticket system",
    status: "in-progress",
    priority: "high",
    assignedTo: "5",
    createdAt: "2023-10-07T09:15:00Z",
    dueDate: "2023-10-09T17:00:00Z"
  }
];

module.exports = tasks;