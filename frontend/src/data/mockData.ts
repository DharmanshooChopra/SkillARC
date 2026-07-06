export const classes = [
  {
    id: "c1",
    name: "CS101 - Intro to Programming",
    section: "Section A",
    studentsCount: 30,
    color: "bg-indigo-600",
    lightColor: "bg-indigo-50",
    textColor: "text-indigo-600",
  },
  {
    id: "c2",
    name: "CS201 - Data Structures",
    section: "Section B",
    studentsCount: 28,
    color: "bg-teal-600",
    lightColor: "bg-teal-50",
    textColor: "text-teal-600",
  },
  {
    id: "c3",
    name: "CS301 - Algorithms",
    section: "Section A",
    studentsCount: 25,
    color: "bg-rose-600",
    lightColor: "bg-rose-50",
    textColor: "text-rose-600",
  },
];

export type QuizQuestion = { q: string; options: string[]; answer: number };
export type TestCase = { input: string; output: string };

export const assignments = [
  {
    id: "a1",
    classId: "c1",
    title: "Assignment 1: Variables and Types",
    dueDate: "2026-10-15",
    type: "Assignment" as const,
    status: "Active",
    description:
      "1. What is the difference between let, const, and var in JavaScript?\n2. Write a program to swap two variables without using a third variable.\n3. Explain type coercion with three real-world examples.",
    maxScore: 100,
  },
  {
    id: "a2",
    classId: "c1",
    title: "Quiz 1: Control Flow",
    dueDate: "2026-10-25",
    type: "Quiz" as const,
    status: "Active",
    maxScore: 10,
    questions: [
      {
        q: "Which keyword is used for conditional branching?",
        options: ["for", "if", "while", "switch"],
        answer: 1,
      },
      {
        q: "What does a for loop do?",
        options: [
          "Repeats a code block multiple times",
          "Defines a function",
          "Handles runtime errors",
          "Declares a variable",
        ],
        answer: 0,
      },
      {
        q: "Which statement exits a loop immediately?",
        options: ["continue", "exit", "break", "return"],
        answer: 2,
      },
      {
        q: "What does the 'continue' statement do in a loop?",
        options: [
          "Exits the loop",
          "Skips to next iteration",
          "Pauses the loop",
          "Restarts the loop",
        ],
        answer: 1,
      },
      {
        q: "Which of these is a valid way to iterate over an array?",
        options: ["for...of", "for...at", "for...in (for arrays)", "all of them"],
        answer: 0,
      },
    ] as QuizQuestion[],
  },
  {
    id: "a3",
    classId: "c1",
    title: "Coding: Implementing Queues",
    dueDate: "2026-11-15",
    type: "Coding Assignment" as const,
    status: "Active",
    description:
      "Implement a Queue data structure with enqueue(), dequeue(), and peek() operations. The queue should handle edge cases such as dequeuing from an empty queue. Write comprehensive test cases.",
    language: "python",
    testCases: [
      { input: "enqueue(1), enqueue(2), dequeue()", output: "1" },
      { input: "enqueue(5), peek()", output: "5" },
      { input: "dequeue() on empty queue", output: "None" },
    ] as TestCase[],
    maxScore: 100,
  },
  {
    id: "a4",
    classId: "c1",
    title: "Python Basics – Lecture Slides",
    dueDate: "",
    type: "Material" as const,
    status: "Posted",
    description: "Slides from Lecture 3 covering Python syntax fundamentals.",
    maxScore: 0,
  },
  {
    id: "a5",
    classId: "c2",
    title: "Assignment 1: Array Operations",
    dueDate: "2026-10-20",
    type: "Assignment" as const,
    status: "Active",
    description: "Implement insert, delete, and search operations on arrays.",
    maxScore: 100,
  },
  {
    id: "a6",
    classId: "c1",
    title: "Assignment 2: Functions and Scope",
    dueDate: "2026-11-05",
    type: "Assignment" as const,
    status: "Active",
    description: "Explain closure, hoisting, and the difference between function declarations and expressions.",
    maxScore: 100,
  },
  {
    id: "a7",
    classId: "c1",
    title: "Quiz 2: Loops and Arrays",
    dueDate: "2026-11-10",
    type: "Quiz" as const,
    status: "Active",
    maxScore: 10,
    questions: [
      {
        q: "Which loop is best for iterating arrays?",
        options: ["for...of", "while", "do...while", "for...in"],
        answer: 0,
      },
      {
        q: "What does array.push() do?",
        options: ["Adds element at end", "Removes element", "Sorts array", "Reverses array"],
        answer: 0,
      },
    ] as QuizQuestion[],
  },
  {
    id: "a8",
    classId: "c2",
    title: "Coding: Binary Search Tree",
    dueDate: "2026-11-20",
    type: "Coding Assignment" as const,
    status: "Active",
    description: "Implement a Binary Search Tree with insert, search, and delete operations.",
    language: "python",
    testCases: [
      { input: "insert(5), search(5)", output: "True" },
      { input: "insert(3), insert(7), search(3)", output: "True" },
    ] as TestCase[],
    maxScore: 100,
  },
];

// ------- Student submissions -------

export type SubmissionStatus = "pending" | "graded";

export interface StudentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  rollNo: string;
  submittedAt: string;
  status: SubmissionStatus;
  score?: number;
  feedback?: string;
  codeContent?: string;
  language?: string;
  quizAnswers?: number[];
  textResponse?: string;
  files?: string[];
}

const codeRahul = `class Queue:
    def __init__(self):
        self.items = []

    def enqueue(self, item):
        self.items.append(item)

    def dequeue(self):
        if self.is_empty():
            return None
        return self.items.pop(0)

    def peek(self):
        return self.items[0] if self.items else None

    def is_empty(self):
        return len(self.items) == 0

# Test
q = Queue()
q.enqueue(1)
q.enqueue(2)
print(q.dequeue())  # 1
print(q.peek())     # 2`;

const codePriya = `class Queue:
    def __init__(self):
        self.data = []

    def enqueue(self, val):
        self.data.append(val)

    def dequeue(self):
        if len(self.data) == 0:
            return None
        val = self.data[0]
        self.data = self.data[1:]
        return val

    def peek(self):
        if self.data:
            return self.data[0]

q = Queue()
q.enqueue(5)
print(q.peek())  # 5`;

const codeArun = `# Using collections.deque for O(1) ops
from collections import deque

class Queue:
    def __init__(self):
        self._q = deque()

    def enqueue(self, item):
        self._q.append(item)

    def dequeue(self):
        return self._q.popleft() if self._q else None

    def peek(self):
        return self._q[0] if self._q else None

q = Queue()
q.enqueue(1)
q.enqueue(2)
q.enqueue(3)
print(q.dequeue())  # 1
print(q.peek())     # 2`;

export const submittedStudents: StudentSubmission[] = [
  // Assignment a1 – mix of pending and graded
  {
    id: "sub1",
    assignmentId: "a1",
    studentId: "s1",
    studentName: "Alex Johnson",
    rollNo: "CS101-042",
    submittedAt: "2h ago",
    status: "graded",
    score: 85,
    feedback: "Well done! Clear explanation of concepts.",
    textResponse: "1. let allows reassignment and has block scope, const prevents reassignment and has block scope, var has function scope and can be reassigned.\n\n2. Using destructuring: [a, b] = [b, a] or arithmetic: a = a + b; b = a - b; a = a - b;\n\n3. Type coercion examples:\n- '5' + 3 = '53' (number coerced to string)\n- '5' - 3 = 2 (string coerced to number)\n- Boolean('hello') = true (string coerced to boolean)",
    files: ["assignment1_submission.pdf"],
  },
  {
    id: "sub2",
    assignmentId: "a1",
    studentId: "s2",
    studentName: "Priya Singh",
    rollNo: "CS101-015",
    submittedAt: "3h ago",
    status: "pending",
    feedback: "",
  },
  {
    id: "sub3",
    assignmentId: "a1",
    studentId: "s3",
    studentName: "Arun Patel",
    rollNo: "CS101-008",
    submittedAt: "5h ago",
    status: "graded",
    score: 88,
    feedback: "Good work! Improve on edge case explanations.",
  },
  {
    id: "sub4",
    assignmentId: "a1",
    studentId: "s4",
    studentName: "Anjali Desai",
    rollNo: "CS101-023",
    submittedAt: "6h ago",
    status: "graded",
    score: 92,
    feedback: "Excellent explanation of type coercion.",
  },
  {
    id: "sub5",
    assignmentId: "a1",
    studentId: "s5",
    studentName: "Vikram Shah",
    rollNo: "CS101-034",
    submittedAt: "1d ago",
    status: "pending",
    feedback: "",
  },

  // Quiz a2 – all auto-graded
  {
    id: "sub6",
    assignmentId: "a2",
    studentId: "s1",
    studentName: "Alex Johnson",
    rollNo: "CS101-042",
    submittedAt: "1h ago",
    status: "graded",
    score: 8,
    quizAnswers: [1, 0, 2, 1, 0],
  },
  {
    id: "sub7",
    assignmentId: "a2",
    studentId: "s2",
    studentName: "Priya Singh",
    rollNo: "CS101-015",
    submittedAt: "2h ago",
    status: "graded",
    score: 6,
    quizAnswers: [1, 0, 0, 1, 0],
  },
  {
    id: "sub8",
    assignmentId: "a2",
    studentId: "s3",
    studentName: "Arun Patel",
    rollNo: "CS101-008",
    submittedAt: "2h ago",
    status: "graded",
    score: 10,
    quizAnswers: [1, 0, 2, 1, 0],
  },
  {
    id: "sub9",
    assignmentId: "a2",
    studentId: "s4",
    studentName: "Anjali Desai",
    rollNo: "CS101-023",
    submittedAt: "3h ago",
    status: "graded",
    score: 7,
    quizAnswers: [1, 0, 2, 0, 0],
  },
  {
    id: "sub10",
    assignmentId: "a2",
    studentId: "s5",
    studentName: "Vikram Shah",
    rollNo: "CS101-034",
    submittedAt: "4h ago",
    status: "graded",
    score: 9,
    quizAnswers: [1, 0, 2, 1, 3],
  },
  {
    id: "sub11",
    assignmentId: "a2",
    studentId: "s6",
    studentName: "Divya Nair",
    rollNo: "CS101-007",
    submittedAt: "5h ago",
    status: "graded",
    score: 5,
    quizAnswers: [0, 0, 2, 1, 0],
  },

  // Coding a3 – mix
  {
    id: "sub12",
    assignmentId: "a3",
    studentId: "s1",
    studentName: "Alex Johnson",
    rollNo: "CS101-042",
    submittedAt: "1h ago",
    status: "graded",
    score: 92,
    codeContent: codeRahul,
    language: "python",
    feedback: "Great implementation! Clean and efficient code.",
  },
  {
    id: "sub13",
    assignmentId: "a3",
    studentId: "s2",
    studentName: "Priya Singh",
    rollNo: "CS101-015",
    submittedAt: "2h ago",
    status: "pending",
    codeContent: codePriya,
    language: "python",
    feedback: "",
  },
  {
    id: "sub14",
    assignmentId: "a3",
    studentId: "s3",
    studentName: "Arun Patel",
    rollNo: "CS101-008",
    submittedAt: "3h ago",
    status: "graded",
    score: 95,
    codeContent: codeArun,
    language: "python",
    feedback: "Excellent use of collections.deque for O(1) operations!",
  },
  {
    id: "sub15",
    assignmentId: "a3",
    studentId: "s4",
    studentName: "Anjali Desai",
    rollNo: "CS101-023",
    submittedAt: "4h ago",
    status: "graded",
    score: 78,
    codeContent: codePriya,
    language: "python",
    feedback: "Works but slicing is O(n). Consider deque.",
  },
];

export const notSubmitted = [
  { id: "ns1", name: "Ishita Verma", rollNo: "CS101-011" },
  { id: "ns2", name: "Rohan Gupta", rollNo: "CS101-027" },
  { id: "ns3", name: "Meera Joshi", rollNo: "CS101-019" },
];

// legacy – kept for backwards compat
export const studentsQueue = [
  { id: "s1", name: "Rahul Kumar", rollNo: "CS101-042", submittedAt: "2h ago", status: "pending", viewing: true },
  { id: "s2", name: "Priya Singh", rollNo: "CS101-015", submittedAt: "3h ago", status: "pending", viewing: false },
  { id: "s3", name: "Arun Patel", rollNo: "CS101-008", submittedAt: "5h ago", status: "pending", viewing: false },
  { id: "s4", name: "Anjali Desai", rollNo: "CS101-023", submittedAt: "6h ago", status: "pending", viewing: false },
  { id: "s5", name: "Vikram Shah", rollNo: "CS101-034", submittedAt: "1d ago", status: "pending", viewing: false },
];
