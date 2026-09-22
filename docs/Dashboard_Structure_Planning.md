## Shared Primary Navigation (All Users)

```
\[Logo/Brand] \[Search Bar] \[Home Icon] \[Notifications Icon] \[Profile Dropdown] \[Floating Message Button]
```

### Navigation Elements:

* **Logo**: ProjectHub branding (clickable, goes to dashboard)
* **Search Bar**: Global search across projects, portfolios, instructors, internships
* **Home Icon**: Navigate to main dashboard
* **Notifications Icon**: Shows unread notification count badge
* **Profile Dropdown**: View profile, settings, logout
* **Floating Message Button**: Fixed bottom-right, opens message popup panel

\---

## Student Dashboard

### Purpose

Central hub for students to manage their projects, collaborations, internship applications, and academic progress.

### Main Elements (In Order):

#### 1\. Welcome Card

* Greeting: "Welcome back, \[First Name]"
* Quick stats: Total projects, Pending invitations

#### 2\. My Projects Section

**Requirement:** Req 21.0 - View list of all my projects

* Display: Project cards showing:

  * Project title
  * Course name
  * Creation date
  * Visibility status (Public/Private)
  * Number of collaborators
* Action buttons: "View Details", "Edit"
* "View All Projects" link

#### 3\. Project Invitations

**Requirement:** Req 29.0 - View list of invitations

* Show pending invitations from:

  * Other students (collaborations)
  * Course instructors
* Display:

  * Inviter name
  * Project title
  * Invitation date
* Action buttons: "Accept", "Reject"
* Badge showing count of pending invitations

#### 4\. My Tasks

**Requirement:** Req 33.0 - View task list

* Quick preview of recent tasks:

  * Task description
  * Assigned project
  * Status (Pending/Postponed/Completed)
  * Deadline
* Color-coded status indicators
* "View All Tasks" link

#### 5\. Recent Notifications

**Requirement:** Req 35.0 - View list of all notifications

* Display last 5 notifications:

  * Project invitation
  * Task updates
  * Feedback from instructors
  * Message received
  * Internship application status (Req 89.0)
* "View All Notifications" link
* Mark as read/unread option

#### 6\. Favorites

**Requirement:** Req 65-66.0 - Save/View favorite projects and portfolios

* Two sub-sections:

  * **Favorite Projects**: Show 3-4 saved projects
  * **Favorite Portfolios**: Show 3-4 saved student portfolios
* "View All Favorites" link

#### 7\. My Statistics

**Requirement:** Req 72.0 - View statistics about my projects

* Display:

  * Total number of projects created
  * Programming languages used (percentage bar chart)
  * Top collaborators per project
* Charts/visualizations

#### 8\. Recommended Projects

**Requirement:** Req 67.0 - View list of recommended projects

* Show 3-4 recommended projects as cards
* Display: Project title, creator, rating, course

#### 9\. Internship Applications (If Applicable)

**Requirement:** Req 84.0 - Apply for internship

* Show recent internship applications:

  * Company name
  * Position
  * Application status (Applied/Nominated/Accepted/Rejected)
* "Browse Internships" button

#### 10\. Completed Internships

**Requirement:** Req 90.0 - View completed internships in portfolio

* List of internships completed
* "Add to Portfolio" button

\---

## Course Instructor Dashboard

### Purpose

Central hub for instructors to manage their courses, review student projects, provide feedback, and accept linking requests.

### Main Elements (In Order):

#### 1\. Welcome Card

* Greeting: "Welcome back, \[Name]"
* Quick stats: Number of courses, Pending reviews

#### 2\. My Courses

**Requirement:** Req 7.0, Req 56.0 - Link/unlink courses, View list of courses

* Display all linked courses:

  * Course name
  * Course code
  * Number of students
  * Number of projects
* Action button: "View Course Details"
* "Link/Unlink Courses" button

#### 3\. Linking Requests

**Requirement:** Req 57.0 - Accept/Reject link/unlink requests

* Show pending link/unlink requests:

  * Course name
  * Action requested (Link/Unlink)
  * Request date
* Action buttons: "Accept", "Reject"
* Badge showing count

#### 4\. Projects to Review

**Requirement:** Req 38.0, Req 39.0 - Add feedback and rate projects

* List of student projects from linked courses:

  * Project title
  * Student name
  * Course
  * Status (Submitted/In Progress)
* Action buttons: "View Project", "Add Feedback", "Rate"
* Quick status: "Reviewed" / "Pending Review" indicators

#### 5\. Recent Notifications

**Requirement:** Req 35.0 - View list of all notifications

* Display last 5 notifications:

  * Project submissions
  * Linking requests (Req 58.0)
  * Task completions
  * Messages
* "View All Notifications" link

#### 6\. Recommended Projects

**Requirement:** Req 67.0 - View list of recommended projects

* Show 3-4 projects from their courses
* Display: Project title, student name, rating, course

#### 7\. Messages

**Requirement:** Req 68-70.0 - View messages, Send/receive messages

* Show recent conversations:

  * Student/instructor name
  * Last message preview
  * Unread badge
* "Open Messages" button (to floating message panel)

#### 8\. Bachelor Project Students (If Applicable)

* Show students working on bachelor projects
* Quick actions: "View Thesis", "Add Feedback"

\---

## Employer Dashboard

### Purpose

Central hub for employers to post internships, manage applications, review student portfolios, and track hiring progress.

### Main Elements (In Order):

#### 1\. Welcome Card

* Greeting: "Welcome back, \[Company Name]"
* Quick stats: Active internships, Pending applications

#### 2\. My Internships

**Requirement:** Req 85.0 - View list of my internships

* Display all internships:

  * Internship title
  * Status (Currently Hiring / Position Filled / Archived)
  * Number of applications
  * Application deadline
* Action buttons: "View Details", "Edit", "Set Status" (Req 77.0)
* "Create New Internship" button (Req 74.0)

#### 3\. Recent Applications

**Requirement:** Req 87.0 - View list of students that applied

* Show latest applications received:

  * Student name
  * Applied for (internship title)
  * Application date
  * Current status (Nominated/Accepted/Rejected)
* Action button: "View Application" / "Change Status" (Req 88.0)
* "Sort by Top Contributors" option (Req 75.0)

#### 4\. Favorites

**Requirement:** Req 65-66.0 - Save/View favorite portfolios

* Display saved student portfolios:

  * Student name
  * Major/Skills
  * Number of projects
* "View All Saved Portfolios" link
* "Top Suggested Applications" (Req 76.0)

#### 5\. Company Statistics

**Requirement:** Req 71.0 - View statistics about internships

* Display:

  * Number of students hired over time (chart)
  * Total internships offered (lifetime)
  * Current open positions
  * Historical hiring trends

#### 6\. Recommended Student Portfolios

**Requirement:** Req 67.0 - View list of recommended projects

* Show 3-4 top-rated student portfolios
* Display: Student name, major, skills, number of projects

#### 7\. Messages

**Requirement:** Req 68-70.0 - View messages, Send/receive messages

* Show recent conversations:

  * Student name
  * Last message preview
  * Unread badge
* "Open Messages" button (to floating message panel)

#### 8\. Company Profile Status

* Quick view of company information:

  * Company name
  * Verification status (Pending/Approved)
* "Edit Company Profile" button
* "Upload Documents" link (Req 13.0)

\---

## Administrator Dashboard

## Purpose

Central hub for admins to manage users, courses, projects, handle approvals, and monitor platform activity.

### Main Elements (In Order):

#### 1\. Welcome Card

* Greeting: "Administrator Panel"
* Quick stats: Total active users, Total projects, Total courses

#### 2\. Platform Statistics

**Requirement:** Req 73.0 - View statistics about platform usage

* Display:

  * Total users (count by role: Students, Instructors, Employers, Admins)
  * Total projects on platform
  * Total courses created
  * User growth chart (over time)
  * Project activity timeline

#### 3\. Pending Approvals

**Requirement:** Req 14.0, Req 18.0 - View employers applying, Accept/reject companies

* Show pending employer applications:

  * Company name
  * Application date
  * Verification documents status
* Action buttons: "View Details", "Accept", "Reject"
* Badge showing count

#### 4\. Linking Requests

**Requirement:** Req 57.0, Req 58.0 - Accept/Reject link/unlink requests, Receive notifications

* Show pending instructor linking requests:

  * Instructor name
  * Course
  * Action requested (Link/Unlink)
* Action buttons: "Accept", "Reject"
* Badge showing count

#### 5\. Flagged Projects

**Requirement:** Req 62.0, Req 59.0 - View list of flagged projects, Flag projects

* Display recently flagged projects:

  * Project title
  * Student name
  * Reason for flagging
  * Flag date
  * Current status (Active/Deactivated)
* Action buttons: "View Details", "Deactivate", "Review Appeal"

#### 6\. Student Appeals

**Requirement:** Req 63.0 - View list of appeals

* Show appeals from students:

  * Student name
  * Project flagged
  * Appeal message
  * Appeal date
* Action buttons: "Review Appeal", "Approve", "Reject"

#### 7\. Recent Notifications

**Requirement:** Req 35.0 - View notifications

* Display last 5 admin notifications:

  * Employer applications
  * Linking requests
  * Project flags
  * User registrations
  * Appeals submitted
* "View All Notifications" link

#### 8\. Quick Actions

* "Manage Users" button (Req 52.0)
* "Manage Courses" button (Req 55.0)
* "Manage Admins" button (Req 53.0)
* "View All Projects" button
* "View Flagged Content" button

#### 9\. Recent Activity Log

* Timeline of recent platform actions:

  * New user registrations
  * Employer verifications
  * Projects flagged
  * Appeals submitted
  * Courses created

\---

## Common Features Across All Dashboards

### 1\. Floating Message Button

**Requirement:** Req 68-70.0 - View messages, Send/receive private messages

* Fixed position: Bottom-right corner
* Shows unread message count badge
* Clicking opens message popup panel:

  * Conversation list
  * Chat thread with selected conversation
  * Message input field
  * Send button

### 2\. Notification Center

**Requirement:** Req 35.0, Req 36.0 - View all notifications, Mark as read/unread

* Accessible via notification icon in nav bar
* Features:

  * List of all notifications
  * Grouped by type (if needed)
  * Mark as read/unread toggle
  * Filter options
  * Pagination

### 3\. Search Functionality

**Requirement:** Req 8.0, Req 42.0, Req 47.0 - Global search

* Search across:

  * Projects (Req 42.0)
  * Portfolios (Req 47.0)
  * Instructors (Req 8.0)
  * Internships (Req 79.0)
  * Users (for admins)
* Results grouped by category

### 4\. Profile Access

**Requirement:** Req 5.0, Req 6.0, Req 10.0 - Update profile information

* Profile dropdown in nav bar
* Quick access to:

  * "View My Profile"
  * "Edit Profile"
  * "Settings"
  * "Logout"

\---

## Design Consistency

All dashboards follow:

* **Same color scheme**: Emerald green (#10b981) primary color
* **Same typography**: System fonts across all pages
* **Same layout pattern**: Header, welcome card, content sections
* **Same button styles**: Consistent button design and behavior
* **Same card design**: Uniform card styling for content blocks
* **Responsive design**: Mobile, tablet, and desktop layouts

