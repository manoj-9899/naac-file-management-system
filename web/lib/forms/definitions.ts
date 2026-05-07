import type { SubCriterionFormDef } from "./types";

const Y1617_2021 = ["2016-17", "2017-18", "2018-19", "2019-20", "2020-21"] as const;
const COURSE_TYPES = ["Core", "Elective", "Practical", "Open", "Audit"] as const;
const STUDENT_CAT = ["General", "OBC", "SC", "ST", "PH"] as const;
const DESIGNATIONS = ["Professor", "Asst. Professor", "Guest Faculty"] as const;
const QUAL = ["UG", "PG", "M.Phil", "Ph.D"] as const;
const ICT = ["PPT", "LMS", "Videos", "CDs", "Software"] as const;
const FACILITY_TYPES = [
  "Classroom",
  "Lab",
  "Computer Lab",
  "Research Facility",
] as const;
const SCHOLARSHIP_CAT = ["SC", "ST", "OBC", "Minority", "Merit"] as const;
const EXAMS = [
  "NET",
  "SLET",
  "GATE",
  "UPSC",
  "PSC",
  "CAT",
  "GRE",
  "TOFEL",
  "GMAT",
] as const;
const YESNO = ["Yes", "No"] as const;

function f(
  partial: Omit<SubCriterionFormDef, "fields"> & { fields: SubCriterionFormDef["fields"] },
): SubCriterionFormDef {
  return partial;
}

/**
 * Field sets aligned to NAAC guide Section 7 (condensed per sub-criterion).
 */
export const SUB_CRITERION_FORM_DEFS: SubCriterionFormDef[] = [
  f({
    subCriterionId: "C1.1",
    criterionId: "C1",
    allowMultiple: true,
    requiresUpload: true,
    fields: [
      { key: "programmeName", label: "Programme Name", type: "text", required: true },
      {
        key: "academicYear",
        label: "Academic Year",
        type: "select",
        required: true,
        options: [...Y1617_2021],
      },
      {
        key: "courseType",
        label: "Course Type",
        type: "select",
        required: true,
        options: [...COURSE_TYPES],
      },
      {
        key: "newProgrammeIntroduced",
        label: "New Programme Introduced?",
        type: "radio",
        required: true,
        options: [...YESNO],
      },
      {
        key: "bosMemberNameDate",
        label: "BoS Member Name + Date of nomination",
        type: "text",
        required: true,
      },
    ],
  }),
  f({
    subCriterionId: "C1.2",
    criterionId: "C1",
    allowMultiple: false,
    requiresUpload: false,
    fields: [
      {
        key: "syllabusThemes",
        label:
          "Syllabi themes (Gender / Environment / Sustainability / Human Values / Ethics)",
        type: "textarea",
        required: true,
      },
      { key: "auditCoursesList", label: "Audit Courses list", type: "textarea", required: true },
    ],
  }),
  f({
    subCriterionId: "C1.3",
    criterionId: "C1",
    allowMultiple: true,
    requiresUpload: true,
    fields: [
      { key: "fieldProjectTitle", label: "Field Project Title", type: "text", required: true },
      {
        key: "internshipOrganisation",
        label: "Internship Organisation",
        type: "text",
        required: true,
      },
      {
        key: "valueAddedCourseName",
        label: "Value Added Course Name + hours",
        type: "text",
        required: false,
      },
    ],
  }),
  f({
    subCriterionId: "C1.4",
    criterionId: "C1",
    allowMultiple: false,
    requiresUpload: true,
    fields: [
      {
        key: "feedbackCollected",
        label: "Structured feedback collected on syllabi?",
        type: "radio",
        required: true,
        options: [...YESNO],
      },
      {
        key: "atrSummary",
        label: "ATR / follow-up actions (summary)",
        type: "textarea",
        required: true,
      },
    ],
  }),
  f({
    subCriterionId: "C2.1",
    criterionId: "C2",
    allowMultiple: true,
    requiresUpload: true,
    fields: [
      { key: "studentFullName", label: "Student Full Name", type: "text", required: true },
      { key: "rollNumber", label: "Roll Number", type: "text", required: true },
      {
        key: "category",
        label: "Category",
        type: "select",
        required: true,
        options: [...STUDENT_CAT],
      },
      { key: "yearOfAdmission", label: "Year of Admission", type: "year", required: true },
    ],
  }),
  f({
    subCriterionId: "C2.2",
    criterionId: "C2",
    allowMultiple: true,
    requiresUpload: false,
    fields: [
      { key: "facultyName", label: "Faculty Name", type: "text", required: true },
      {
        key: "designation",
        label: "Designation",
        type: "select",
        required: true,
        options: [...DESIGNATIONS],
      },
      {
        key: "highestQualification",
        label: "Highest Qualification",
        type: "select",
        required: true,
        options: [...QUAL],
      },
      {
        key: "publicationsCount",
        label: "Publications (last 5 years)",
        type: "number",
        required: true,
      },
      {
        key: "ictToolsUsed",
        label: "ICT Tools Used",
        type: "multiselect",
        required: true,
        options: [...ICT],
      },
      {
        key: "slowLearnerStrategies",
        label: "Strategies for slow learners",
        type: "textarea",
        required: true,
      },
    ],
  }),
  f({
    subCriterionId: "C2.3",
    criterionId: "C2",
    allowMultiple: false,
    requiresUpload: true,
    fields: [
      {
        key: "internalAssessmentMarks",
        label: "Internal Assessment Marks (representative)",
        type: "number",
        required: true,
      },
      {
        key: "grievanceSummary",
        label: "Grievance redressal (summary / minutes ref.)",
        type: "textarea",
        required: true,
      },
      {
        key: "academicCalendarNotes",
        label: "Academic calendar & work diary notes",
        type: "textarea",
        required: true,
      },
    ],
  }),
  f({
    subCriterionId: "C2.4",
    criterionId: "C2",
    allowMultiple: false,
    requiresUpload: true,
    fields: [
      { key: "poCoSummary", label: "PO/CO summary", type: "textarea", required: true },
      {
        key: "attainmentSummary",
        label: "Programme outcome attainment summary",
        type: "textarea",
        required: true,
      },
      {
        key: "facultyQualifications",
        label: "Faculty qualifications / guide recognition",
        type: "textarea",
        required: true,
      },
    ],
  }),
  f({
    subCriterionId: "C2.5",
    criterionId: "C2",
    allowMultiple: true,
    requiresUpload: true,
    fields: [
      { key: "academicYear", label: "Academic Year", type: "select", required: true, options: [...Y1617_2021] },
      { key: "courseCodeName", label: "Course code / name", type: "text", required: true },
      { key: "passPercentage", label: "Pass percentage", type: "decimal", required: true },
      { key: "statsNotes", label: "Statistics notes", type: "textarea", required: false },
    ],
  }),
  f({
    subCriterionId: "C3.1",
    criterionId: "C3",
    allowMultiple: true,
    requiresUpload: true,
    fields: [
      { key: "projectTitle", label: "Research Project Title", type: "text", required: true },
      { key: "principalInvestigator", label: "Principal Investigator", type: "text", required: true },
      { key: "fundingAgency", label: "Funding Agency", type: "text", required: true },
      { key: "grantAmountInr", label: "Grant Amount (INR)", type: "number", required: true },
      { key: "projectStartDate", label: "Project Start Date", type: "date", required: true },
      { key: "projectEndDate", label: "Project End Date", type: "date", required: true },
    ],
  }),
  f({
    subCriterionId: "C3.2",
    criterionId: "C3",
    allowMultiple: true,
    requiresUpload: true,
    fields: [
      { key: "eventName", label: "Workshop/Seminar Name", type: "text", required: true },
      { key: "eventDate", label: "Event Date", type: "date", required: true },
      {
        key: "innovationPractice",
        label: "Industry–academia innovation practice",
        type: "textarea",
        required: true,
      },
    ],
  }),
  f({
    subCriterionId: "C3.3",
    criterionId: "C3",
    allowMultiple: true,
    requiresUpload: true,
    fields: [
      { key: "paperTitle", label: "Journal Paper Title", type: "text", required: true },
      { key: "journalName", label: "Journal Name", type: "text", required: true },
      { key: "ugcListed", label: "UGC-CARE listed?", type: "radio", required: true, options: [...YESNO] },
      { key: "issn", label: "ISSN", type: "text", required: false },
      { key: "bookChapterTitle", label: "Book/Chapter Title (if any)", type: "text", required: false },
      { key: "phdScholarName", label: "PhD Scholar Name (if any)", type: "text", required: false },
      { key: "phdAwardedYear", label: "PhD Awarded Year", type: "year", required: false },
    ],
  }),
  f({
    subCriterionId: "C3.4",
    criterionId: "C3",
    allowMultiple: true,
    requiresUpload: true,
    fields: [
      { key: "activityName", label: "Extension Activity Name", type: "text", required: true },
      {
        key: "studentsParticipated",
        label: "Students Participated (count)",
        type: "number",
        required: true,
      },
    ],
  }),
  f({
    subCriterionId: "C3.5",
    criterionId: "C3",
    allowMultiple: true,
    requiresUpload: false,
    fields: [
      { key: "collaborationSummary", label: "Collaboration details (5 years)", type: "textarea", required: true },
    ],
  }),
  f({
    subCriterionId: "C4.1",
    criterionId: "C4",
    allowMultiple: true,
    requiresUpload: true,
    fields: [
      {
        key: "facilityType",
        label: "Facility Type",
        type: "select",
        required: true,
        options: [...FACILITY_TYPES],
      },
      { key: "roomNumber", label: "Room Number / Name", type: "text", required: true },
      { key: "areaSqFt", label: "Area (sq. ft.)", type: "number", required: true },
      { key: "seatingCapacity", label: "Seating Capacity", type: "number", required: true },
      { key: "numberOfSystems", label: "Number of Systems (if applicable)", type: "number", required: false },
      { key: "equipmentName", label: "Equipment Name (if applicable)", type: "text", required: false },
    ],
  }),
  f({
    subCriterionId: "C4.2",
    criterionId: "C4",
    allowMultiple: false,
    requiresUpload: true,
    fields: [
      { key: "holdingsSummary", label: "Library holdings summary", type: "textarea", required: true },
      { key: "eResources", label: "E-resources subscribed", type: "textarea", required: true },
      { key: "usageStats", label: "Annual usage statistics", type: "textarea", required: true },
      { key: "budgetUtilisation", label: "Library budget utilisation", type: "textarea", required: true },
    ],
  }),
  f({
    subCriterionId: "C5.1",
    criterionId: "C5",
    allowMultiple: true,
    requiresUpload: true,
    fields: [
      { key: "scholarshipName", label: "Scholarship Name", type: "text", required: true },
      { key: "awardingBody", label: "Awarding Body", type: "text", required: true },
      { key: "beneficiaryName", label: "Beneficiary Student Name", type: "text", required: true },
      {
        key: "category",
        label: "Category",
        type: "select",
        required: true,
        options: [...SCHOLARSHIP_CAT],
      },
      { key: "amountInr", label: "Amount (INR)", type: "number", required: true },
      {
        key: "academicYear",
        label: "Academic Year",
        type: "select",
        required: true,
        options: [...Y1617_2021],
      },
    ],
  }),
  f({
    subCriterionId: "C5.2",
    criterionId: "C5",
    allowMultiple: true,
    requiresUpload: false,
    fields: [
      { key: "placementCompany", label: "Placement Company", type: "text", required: false },
      { key: "jobRole", label: "Job Role", type: "text", required: false },
      { key: "packageLpa", label: "Package (LPA)", type: "decimal", required: false },
      {
        key: "higherEduInstitution",
        label: "Higher Education Institution",
        type: "text",
        required: false,
      },
      { key: "programmePursued", label: "Programme Pursued", type: "text", required: false },
      { key: "competitiveExam", label: "Competitive Exam", type: "select", required: false, options: [...EXAMS] },
      { key: "examYear", label: "Exam Year", type: "year", required: false },
      { key: "rankOrScore", label: "Rank / Score", type: "text", required: false },
    ],
  }),
  f({
    subCriterionId: "C5.3",
    criterionId: "C5",
    allowMultiple: true,
    requiresUpload: true,
    fields: [
      { key: "alumniEventDate", label: "Alumni Event Date", type: "date", required: true },
      { key: "agendaSummary", label: "Agenda summary", type: "textarea", required: true },
    ],
  }),
  f({
    subCriterionId: "C6.1",
    criterionId: "C6",
    allowMultiple: true,
    requiresUpload: true,
    fields: [
      { key: "fdpName", label: "FDP Programme Name", type: "text", required: true },
      { key: "organisingInstitution", label: "Organising Institution", type: "text", required: true },
      { key: "durationDays", label: "Duration (Days)", type: "number", required: true },
      { key: "facultyMemberName", label: "Faculty Member Name", type: "text", required: true },
      { key: "dateOfAttendance", label: "Date of Attendance", type: "date", required: true },
    ],
  }),
  f({
    subCriterionId: "C6.2",
    criterionId: "C6",
    allowMultiple: true,
    requiresUpload: true,
    fields: [
      { key: "facultyName", label: "Faculty Member Name", type: "text", required: true },
      { key: "pbasScore", label: "PBAS Score", type: "decimal", required: true },
      { key: "assessmentYear", label: "Assessment Year", type: "year", required: true },
    ],
  }),
  f({
    subCriterionId: "C6.3",
    criterionId: "C6",
    allowMultiple: true,
    requiresUpload: true,
    fields: [
      { key: "activityName", label: "Fund Generation Activity", type: "text", required: true },
      { key: "amountGeneratedInr", label: "Amount Generated (INR)", type: "number", required: true },
      { key: "sourceOfFunds", label: "Source of Funds", type: "textarea", required: true },
    ],
  }),
  f({
    subCriterionId: "C7.1",
    criterionId: "C7",
    allowMultiple: false,
    requiresUpload: true,
    fields: [
      { key: "greenInitiative", label: "Green Initiative Name", type: "text", required: true },
      { key: "genderEquityActivity", label: "Gender Equity Activity + Date", type: "text", required: true },
      {
        key: "disabledFriendlyFeatures",
        label: "Disabled-friendly features",
        type: "textarea",
        required: true,
      },
    ],
  }),
  f({
    subCriterionId: "C7.2",
    criterionId: "C7",
    allowMultiple: true,
    requiresUpload: true,
    fields: [
      { key: "bestPracticeTitle", label: "Best Practice Title", type: "text", required: true },
      { key: "objective", label: "Objective", type: "textarea", required: true },
      { key: "context", label: "Context", type: "textarea", required: true },
      { key: "description", label: "Practice Description", type: "textarea", required: true },
      { key: "evidenceOfSuccess", label: "Evidence of Success", type: "textarea", required: true },
      { key: "problemsEncountered", label: "Problems Encountered", type: "textarea", required: true },
      { key: "resourcesRequired", label: "Resources Required", type: "textarea", required: true },
    ],
  }),
];

export const FORM_DEF_BY_ID: Record<string, SubCriterionFormDef> = Object.fromEntries(
  SUB_CRITERION_FORM_DEFS.map((d) => [d.subCriterionId, d]),
);

export function getFormDef(subCriterionId: string): SubCriterionFormDef | undefined {
  return FORM_DEF_BY_ID[subCriterionId];
}
