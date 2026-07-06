A highly navigable, clean, and minimalist user interface inspired by the core structure of Google Classroom, tailored for an educational ecosystem. All interactive elements (buttons, inputs, toggles) must be explicitly rendered with realistic hover/active states to show they are functional. The views are presented as a multi-frame layout within a single Figma workspace canvas.

Color Palette: Clean, color-friendly, and accessible. Use a primary trustworthy tone (e.g., Indigo or Teal Blue) for active states and primary buttons, soft neutrals for backgrounds, and distinct accent colors for status indicators (e.g., Green for success/saved, Blue for secondary actions).

Frame 1: Portal Entry & Role Selection (Start State)
Style: Simple, balanced, and highly visual center-card landing screen. No traditional credentials-based login page exists.
Components:

Header: Portal Logo (e.g., "LearnConnect LMS") centered at the top.

Central Card:

Instructional Text: "Select your portal to continue."

Interactive Role Selection Icons: Two large, side-by-side selectable component cards acting as main gateways:

Faculty Portal Icon: A distinct illustration or high-fidelity icon representing an educator/instructor (e.g., a teacher or lecture board icon). Below the icon, prominent bold text reads "Faculty Portal".

Student Portal Icon: A distinct illustration or high-fidelity icon representing a student (e.g., a graduation cap or backpack icon). Below the icon, prominent bold text reads "Student Portal".

Functional States: Both icon cards are designed as fully operational buttons. Clicking the "Faculty Portal" icon instantly routes the workspace prototype to Frame 2 (Faculty Dashboard), while clicking the "Student Portal" icon instantly routes to Frame 6 (Student Dashboard).

Frame 2: Faculty Dashboard (Role: Faculty Selected)
Style: A clean, tiled grid layout optimized for quick navigation across classrooms.
Components:

Navigation Bar (Top):

Logo (Top Left) with a small "Faculty View" label badge.

Center links: "My Classes" (Active state with underline), "Global Calendar", "Overall Analytics".

Right side: A large "+" (Create Class) button and a User Profile avatar icon (e.g., "Dr. Smith").

Main Content Area: A grid of cards representing subjects handled by the faculty member:

Active Class Cards (e.g., "CS101 - Intro to Programming"): Displays Class Name, Section (e.g., "Section A"), Student Count (e.g., "30 Students"), and a distinct color-coded header banner.

"Create Class" Action Card: A dashed-border card within the grid featuring a prominent central "+" icon and the text "Create a new classroom" (fully styled as an active, clickable target).

Frame 3: Class Hub (Faculty View)
Style: Minimalist, tab-based navigation keeping everything accessible on one screen.
Components:

Left Sidebar Navigation: A collapsible vertical menu listing all other classes the faculty member handles for easy switching without returning to the main dashboard.

Class Header Banner: Displays the specific class name ("CS101 - Intro to Programming") with a clean background theme.

Horizontal Navigation Tabs (Top Center): Four distinct, flat tabs: "Announcements" (Active/Highlighted), "Classwork", "Grades", and "Students List".

Main Content (Announcements Feed):

A large box at the top labeled "Share an announcement or resource with your class...".

An active, primary-colored "Post" button directly beneath the text box.

A chronological feed below showing previous posts, attached resource links, and student comment sections.

Frame 4: Classwork & Creation Engine (Faculty View)
Style: List-based view focused on course requirements and assignment generation.
Components:

Class Hub Structure: Retains the core layout from Frame 3, but with the "Classwork" tab active.

Primary Action Button: A highly visible "Create +" button positioned at the top right of the workspace. Clicking this exposes an active pop-out menu containing: "Assignment", "Quiz", "Coding Assignment", and "Material".

Organized Classwork List: Below the button, tasks are listed cleanly under module headers. Each item includes a task-type icon (e.g., a code bracket icon for programming, a checklist icon for quizzes), a clear title, a due date, and an active three-dot management menu.

Example Item: "Assignment 3: Implementing Queues" (Coding Icon), Due: Nov 15.

Frame 5: Evaluation Portal (Queue-Based Flow - Referenced from image_7e29d5.png)
Style: A dedicated, side-by-side dual-pane evaluation workspace for grading submissions efficiently. This is the direct implementation of the design layout found in image_7e29d5.png.
Components:

Header Context: Displays the assignment title at the top left: "Queue-Based Evaluation", along with a sub-header showing submission metadata: "25 of 30 submitted • 5 pending review".

Submission Queue (Left Pane, directly following image_7e29d5.png):

Two prominent selection buttons at the top: "Pending (5)" (Active/Blue fill) and "All (30)" (Inactive/Outline style), accompanied by vertical scroll arrows.

Pending Submissions List: Stacked interactive cards for students awaiting review. The top card, "01. Rahul Kumar" (with text "Submitted 2h ago"), features an active marker indicating → VIEWING NOW.

Subsequent cards for "02. Priya Singh", "03. Arun Patel", "04. Anjali Desai", and "05. Vikram Shah" are stacked beneath it.

Not Submitted Section: Located further down the pane, featuring a "NOT SUBMITTED (5)" header with cards for students like "Ishita Verma" and "Rohan Gupta" (labeled with a "Mark as Unchecked" option), followed by a clickable text link: "+2 more... Click to expand".

Evaluation & Grading Area (Right Pane, directly following image_7e29d5.png):

Student Header Info: "Rahul Kumar", "Roll No: CS101-042", "Submitted 2 hours ago", and a prominent bold indicator showing Queue Position: 1 of 5.

File Preview Container: A centralized, dark-bordered box housing a file document icon, the text "assignment.pdf - Click to preview", and a highly visible blue button labeled "Open Preview".

Assign Score Controls:

An input field box labeled POINTS AWARDED with placeholder text "0 - 100".

A neighboring display block labeled PERCENTAGE showing a computed value of "80 %".

Quick Grade Buttons: A horizontal row of 5 segmented buttons: "A+ (95)", "A (90)", "B+ (85)", "B (80)", and "C (75)". Every button is styled as an active, clickable choice.

Feedback Box: A multi-line text input block labeled Feedback (Optional) with the placeholder "Great work! Consider adding...".

Footer Action Buttons: Three clearly separated, high-contrast operational buttons:

"✓ Save & Next" (Styled with a distinct green background).

"→ Skip to Next" (Styled with a dark blue background).

"Undo" (Styled with a neutral, dark gray outline background).

Shortcut Legend: Subtle helper text anchored at the base: "💡 Press ENTER to Save & Next | TAB to Skip | 1-5 for Quick Grade".

Frame 6: Student Dashboard (Role: Student Selected)
Style: A simplified version of the main dashboard, tailored heavily toward task tracking and learning delivery.
Components:

Navigation Bar (Top):

Logo (Top Left) with a small "Student View" label badge.

Center links: "My Classrooms" (Active state), "To-Do List/Deadlines", "My Report Card".

Right side: A prominent "Join Class +" action button and the Student Profile icon.

Main Content Area: A grid layout displaying all enrolled classrooms.

Enrolled Class Cards: Each card maps out the subject name, handling faculty name, and a quick snippet indicator of outstanding tasks (e.g., "1 Pending Assignment").

"Join Class" Action Card: A card featuring a large central "+" icon and the text "Join a new class using a code" to simulate student self-enrollment.

Frame 7: Classwork View (Student View)
Style: Streamlined workspace focused on consumption, task execution, and progress visibility.
Components:

Class Architecture: Uses three flat, student-facing tabs: "Stream" (Announcements), "Classwork" (Active), and "People" (Faculty & classmates directory).

Functional Task List: Displays all coursework deployed by the faculty. Each row features an explicit, color-coded Status Pill Badge:

Green Badge: "Turned In" (with the grade achieved, if evaluated).

Orange Badge: "Assigned" (acting as an active link that redirects the student directly to the assignment execution page).

Red Badge: "Missing" (overdue tasks).

Frame 8: Student Coding Assignment Page (The 'Playground')
Style: A robust, side-by-side integrated development environment (IDE) layout designed for programming tasks.
Components:

Top Info Header: Displays the specific coding prompt (e.g., "Assignment 3: Implement an Enqueue and Dequeue operation in a Queue framework") along with functional instructions and constraints.

Left Pane (Interactive Code Editor):

A high-fidelity mockup of a tabbed text editor (e.g., showing file tabs like main.py or solution.java).

Simulated IDE visual components: line numbering, colorized syntax text, and an expand window control.

Footer Control Bar: Features two distinct, heavily styled operational buttons: a primary blue "Run Code" button (to compile and test code locally) and a secondary green "Submit Code" button to lock in the implementation for evaluation.

Right Pane (The Playground Console):

A standard terminal screen simulating live outputs.

Header bar titled "Terminal / Playground Output".

The console window displays simulated real-time test verification outputs (e.g., Running Test Case 1... Success. Running Test Case 2... Success.).

An active, blinking text cursor line at the bottom of the console window, indicating a functional playground environment where custom variables can be tested.