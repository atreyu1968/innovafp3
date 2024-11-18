import { UserRole } from './auth';

export type FormFieldType = 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'date' | 'number' | 'file' | 'section';

export type FormStatus = 'borrador' | 'publicado' | 'cerrado';

export interface ConditionalRule {
  fieldId: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains';
  value: string | string[];
  jumpToFieldId: string;
}

export interface FormField {
  id: string;
  type: FormFieldType;
  label: string;
  required: boolean;
  options?: string[];
  placeholder?: string;
  description?: string;
  fileTypes?: string[];
  maxFileSize?: number;
  multiple?: boolean;
  fields?: FormField[];
  conditionalRules?: ConditionalRule[];
}

export interface FormResponse {
  id: string;
  formId: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  academicYearId: string;
  responses: {
    [fieldId: string]: string | string[] | boolean | FileResponse[];
  };
  status: 'borrador' | 'enviado';
  responseTimestamp: string;
  lastModifiedTimestamp: string;
  submissionTimestamp?: string;
}

export interface FileResponse {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: string;
}

export interface Form {
  id: string;
  title: string;
  description: string;
  fields: FormField[];
  assignedRoles: UserRole[];
  academicYearId: string;
  startDate?: string;
  endDate?: string;
  status: FormStatus;
  acceptingResponses: boolean;
  allowMultipleResponses: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  createdByName?: string;
}