export const mockAttendance = {
  overall: 85,
  subjects: [
    { name: 'Data Structures', code: 'CS201', attended: 35, total: 40, percentage: 87.5 },
    { name: 'Computer Networks', code: 'CS202', attended: 38, total: 42, percentage: 90.4 },
    { name: 'Operating Systems', code: 'CS203', attended: 30, total: 40, percentage: 75.0 },
    { name: 'Database Systems', code: 'CS204', attended: 40, total: 40, percentage: 100.0 },
    { name: 'Software Engineering', code: 'CS205', attended: 32, total: 38, percentage: 84.2 },
  ],
  monthly: [
    { month: 'Jan', percentage: 90 },
    { month: 'Feb', percentage: 85 },
    { month: 'Mar', percentage: 75 },
    { month: 'Apr', percentage: 88 },
    { month: 'May', percentage: 82 },
  ]
};

export const mockResults = {
  currentCgpa: 8.4,
  semesters: [
    {
      semester: 'Semester 1',
      sgpa: 8.2,
      subjects: [
        { name: 'Mathematics I', grade: 'A', credits: 4 },
        { name: 'Physics', grade: 'B+', credits: 4 },
        { name: 'Programming in C', grade: 'A+', credits: 3 },
      ]
    },
    {
      semester: 'Semester 2',
      sgpa: 8.6,
      subjects: [
        { name: 'Mathematics II', grade: 'A+', credits: 4 },
        { name: 'Chemistry', grade: 'A', credits: 4 },
        { name: 'Data Structures', grade: 'B+', credits: 3 },
      ]
    }
  ]
};

export const mockHostel = {
  status: 'Allocated',
  block: 'Block A (Boys)',
  room: '214',
  roomType: '2-Sharing Non-AC',
  messBill: '₹3,500 (Paid)',
  warden: 'Mr. Venkat Rao',
  wardenPhone: '+91 98765 43210'
};

export const mockLibrary = {
  issuedBooks: [
    { title: 'Introduction to Algorithms', author: 'Cormen', issuedDate: '2026-05-10', dueDate: '2026-06-25', fine: 0 },
    { title: 'Operating System Concepts', author: 'Silberschatz', issuedDate: '2026-06-01', dueDate: '2026-06-15', fine: 0 },
  ],
  fineTotal: 0
};

export const mockTransport = {
  status: 'Active',
  route: 'Route 14 (Kukatpally)',
  pickupPoint: 'JNTU Metro',
  pickupTime: '07:45 AM',
  busNumber: 'AP 09 TA 1234',
  driverName: 'Srinivas',
  driverPhone: '+91 87654 32109'
};

export const mockPlacements = {
  eligible: true,
  appliedDrives: [
    { company: 'TCS Digital', role: 'Software Engineer', status: 'Shortlisted', date: '2026-06-20' },
    { company: 'Infosys', role: 'System Engineer', status: 'Applied', date: '2026-06-25' },
    { company: 'Wipro', role: 'Project Engineer', status: 'Assessment Pending', date: '2026-07-02' }
  ],
  upcomingDrives: [
    { company: 'Cognizant', role: 'GenC Next', ctc: '6.75 LPA', deadline: '2026-06-18' },
    { company: 'Accenture', role: 'Advanced App Engineering', ctc: '6.5 LPA', deadline: '2026-06-22' }
  ]
};

export const mockGrievances = [
  { id: 'GRV-001', category: 'Hostel', description: 'Fan not working in room 214', status: 'Resolved', date: '2026-05-15' },
  { id: 'GRV-002', category: 'Library', description: 'Book unavailable: AI by Norvig', status: 'In Progress', date: '2026-06-10' }
];

export const mockInternships = [
  { company: 'TechNova', role: 'Frontend Intern', duration: '3 Months', status: 'Applied' },
  { company: 'DataCorp', role: 'Data Analyst Intern', duration: '6 Months', status: 'Interview Scheduled' }
];
