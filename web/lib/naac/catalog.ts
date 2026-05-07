import type { CriterionId, NaacCriterion, NaacSubCriterion } from "./types";

/**
 * Seven NAAC criteria — names and max marks per competition guide.
 */
export const NAAC_CRITERIA: readonly NaacCriterion[] = [
  {
    id: "C1",
    code: "C1",
    name: "Curriculum Aspects",
    maxMarks: 100,
    order: 1,
  },
  {
    id: "C2",
    code: "C2",
    name: "Teaching-Learning & Evaluation",
    maxMarks: 350,
    order: 2,
  },
  {
    id: "C3",
    code: "C3",
    name: "Research, Innovations & Extension",
    maxMarks: 110,
    order: 3,
  },
  {
    id: "C4",
    code: "C4",
    name: "Infrastructure & Learning Resources",
    maxMarks: 100,
    order: 4,
  },
  {
    id: "C5",
    code: "C5",
    name: "Student Support & Progression",
    maxMarks: 140,
    order: 5,
  },
  {
    id: "C6",
    code: "C6",
    name: "Governance, Leadership & Management",
    maxMarks: 100,
    order: 6,
  },
  {
    id: "C7",
    code: "C7",
    name: "Institutional Values & Best Practices",
    maxMarks: 100,
    order: 7,
  },
] as const;

/**
 * All sub-criteria (Section 3 of the NAAC File Management project guide).
 * IDs are stable keys for forms, uploads, and exports.
 */
export const NAAC_SUB_CRITERIA: readonly NaacSubCriterion[] = [
  {
    id: "C1.1",
    criterionId: "C1",
    code: "1.1",
    title: "Curricular Planning & Implementation",
    summary:
      "Teachers in BoS/Academic Council/Syndicate; new programmes introduced (2016–21) with evidence.",
    order: 1,
  },
  {
    id: "C1.2",
    criterionId: "C1",
    code: "1.2",
    title: "Academic Flexibility",
    summary:
      "Syllabi linked to gender, environment, sustainability, human values, professional ethics; audit courses.",
    order: 2,
  },
  {
    id: "C1.3",
    criterionId: "C1",
    code: "1.3",
    title: "Curriculum Enrichment",
    summary:
      "Comprehensive syllabi (core/common/electives/practicals/open courses); field projects/internships with certificates.",
    order: 3,
  },
  {
    id: "C1.4",
    criterionId: "C1",
    code: "1.4",
    title: "Feedback System",
    summary:
      "Structured student feedback on syllabi; ATRs; add-on and value-added courses.",
    order: 4,
  },
  {
    id: "C2.1",
    criterionId: "C2",
    code: "2.1",
    title: "Student Enrolment & Profile",
    summary:
      "Nominal rolls admitted 2016–21; reserved category students with bio-data and category proof.",
    order: 1,
  },
  {
    id: "C2.2",
    criterionId: "C2",
    code: "2.2",
    title: "Catering to Student Diversity",
    summary:
      "Permanent/guest faculty profiles; ICT usage; strategies for slow learners.",
    order: 2,
  },
  {
    id: "C2.3",
    criterionId: "C2",
    code: "2.3",
    title: "Teaching-Learning Process",
    summary:
      "Internal assessment (5 years); grievance minutes; academic calendar and work diary.",
    order: 3,
  },
  {
    id: "C2.4",
    criterionId: "C2",
    code: "2.4",
    title: "Teacher Quality",
    summary:
      "POs/COs; programme outcome attainment; faculty qualifications and research guide recognition.",
    order: 4,
  },
  {
    id: "C2.5",
    criterionId: "C2",
    code: "2.5",
    title: "Evaluation Process & Reforms",
    summary:
      "Results (5 years) with pass percentage split and per-course statistics.",
    order: 5,
  },
  {
    id: "C3.1",
    criterionId: "C3",
    code: "3.1",
    title: "Resource Mobilisation for Research",
    summary:
      "Research grants (govt/non-govt) 2016–21; research guides with orders and scholar details.",
    order: 1,
  },
  {
    id: "C3.2",
    criterionId: "C3",
    code: "3.2",
    title: "Innovation Ecosystem",
    summary:
      "Workshops, seminars, and industry–academia innovative practices.",
    order: 2,
  },
  {
    id: "C3.3",
    criterionId: "C3",
    code: "3.3",
    title: "Research Publications & Awards",
    summary:
      "UGC-notified journal papers; books/chapters/proceedings; PhDs awarded per teacher.",
    order: 3,
  },
  {
    id: "C3.4",
    criterionId: "C3",
    code: "3.4",
    title: "Extension Activities",
    summary:
      "Extension activities in the neighbourhood; student participation 2016–21.",
    order: 4,
  },
  {
    id: "C3.5",
    criterionId: "C3",
    code: "3.5",
    title: "Collaboration",
    summary:
      "Faculty/student exchange, internships, field trips, OJT, research collaborations (5 years).",
    order: 5,
  },
  {
    id: "C4.1",
    criterionId: "C4",
    code: "4.1",
    title: "Physical Facilities",
    summary:
      "Classrooms, labs, computing, research facilities — photos, floor plans, inventory.",
    order: 1,
  },
  {
    id: "C4.2",
    criterionId: "C4",
    code: "4.2",
    title: "Library as a Learning Resource",
    summary:
      "Holdings, e-resources, usage statistics, library budget utilisation (separate library files).",
    order: 2,
  },
  {
    id: "C5.1",
    criterionId: "C5",
    code: "5.1",
    title: "Student Support",
    summary:
      "Government scholarships/fellowships; sports/cultural awards at national/international level with proof.",
    order: 1,
  },
  {
    id: "C5.2",
    criterionId: "C5",
    code: "5.2",
    title: "Student Progression",
    summary:
      "Placements 2016–21; higher education progression; qualifying exams (NET/GATE/etc.).",
    order: 2,
  },
  {
    id: "C5.3",
    criterionId: "C5",
    code: "5.3",
    title: "Student Participation & Activities",
    summary:
      "Alumni association meetings (5 years): agenda, minutes, photographs.",
    order: 3,
  },
  {
    id: "C6.1",
    criterionId: "C6",
    code: "6.1",
    title: "Institutional Vision & Leadership",
    summary: "FDP certificates and participation records with programme details.",
    order: 1,
  },
  {
    id: "C6.2",
    criterionId: "C6",
    code: "6.2",
    title: "Strategy Development & Deployment",
    summary: "PBAS records for all faculty members.",
    order: 2,
  },
  {
    id: "C6.3",
    criterionId: "C6",
    code: "6.3",
    title: "Faculty Empowerment & Fund Generation",
    summary:
      "Fund generation activities (internal mobilisation or external grants) if any.",
    order: 3,
  },
  {
    id: "C7.1",
    criterionId: "C7",
    code: "7.1",
    title: "Institutional Values & Social Responsibilities",
    summary:
      "Green initiatives; disabled-friendly facilities; gender equity programmes.",
    order: 1,
  },
  {
    id: "C7.2",
    criterionId: "C7",
    code: "7.2",
    title: "Best Practices",
    summary:
      "Minimum two best practices: objectives, context, evidence of success, supporting documents; institutional distinctiveness.",
    order: 2,
  },
] as const;

const criterionMap = new Map<CriterionId, NaacCriterion>(
  NAAC_CRITERIA.map((c) => [c.id, c]),
);

const subCriteriaByCriterion = NAAC_CRITERIA.reduce(
  (acc, c) => {
    acc[c.id] = NAAC_SUB_CRITERIA.filter((s) => s.criterionId === c.id);
    return acc;
  },
  {} as Record<CriterionId, NaacSubCriterion[]>,
);

/** Lookup criterion meta by id. */
export function getCriterion(id: CriterionId): NaacCriterion | undefined {
  return criterionMap.get(id);
}

/** Sub-criteria for one criterion, ordered. */
export function getSubCriteriaForCriterion(
  criterionId: CriterionId,
): readonly NaacSubCriterion[] {
  return subCriteriaByCriterion[criterionId] ?? [];
}

const subCriterionById = new Map<string, NaacSubCriterion>(
  NAAC_SUB_CRITERIA.map((s) => [s.id, s]),
);

/** Lookup sub-criterion by stable id (e.g. C2.3). */
export function getSubCriterion(id: string): NaacSubCriterion | undefined {
  return subCriterionById.get(id);
}

/** Validate criterion id string (for dynamic routes). */
export function isCriterionId(value: string): value is CriterionId {
  return criterionMap.has(value as CriterionId);
}
