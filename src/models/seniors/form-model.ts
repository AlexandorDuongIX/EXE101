import type { CreateSeniorInput, SeniorRelationship } from './types';

export const RELATIONSHIPS: readonly { value: SeniorRelationship; label: string }[] = [
  { value: 'grandfather', label: 'Ông' },
  { value: 'grandmother', label: 'Bà' },
  { value: 'father', label: 'Cha' },
  { value: 'mother', label: 'Mẹ' },
  { value: 'relative', label: 'Người thân khác' },
  { value: 'other', label: 'Khác' },
];

export const CHRONIC_CONDITIONS: readonly { value: string; label: string }[] = [
  { value: 'hypertension', label: 'Tăng huyết áp' },
  { value: 'diabetes', label: 'Đái tháo đường (tiểu đường)' },
  { value: 'cardiovascular', label: 'Bệnh tim mạch' },
  { value: 'asthma-copd', label: 'Hen suyễn / COPD' },
  { value: 'chronic-kidney', label: 'Bệnh thận mạn' },
  { value: 'arthritis', label: 'Viêm khớp / thoái hóa khớp' },
  { value: 'stroke', label: 'Tai biến mạch máu não (tiền sử đột quỵ)' },
  { value: 'dementia', label: 'Sa sút trí tuệ / Alzheimer' },
  { value: 'none', label: 'Không có bệnh nền đã biết' },
  { value: 'unknown', label: 'Chưa rõ' },
  { value: 'other', label: 'Khác' },
];

export type SeniorFormValues = {
  fullName: string;
  birthYear: string;
  relationship: SeniorRelationship | '';
  relationshipOther: string;
  avatarUri?: string;
  chronicConditions: string[];
  chronicConditionOther: string;
  medicalNotes: string;
  isPrimarySosContact: boolean;
};

export type SeniorFormErrors = Partial<Record<keyof SeniorFormValues, string>>;

export function createEmptySeniorForm(): SeniorFormValues {
  return {
    fullName: '',
    birthYear: '',
    relationship: '',
    relationshipOther: '',
    chronicConditions: [],
    chronicConditionOther: '',
    medicalNotes: '',
    isPrimarySosContact: false,
  };
}

function cleanText(text: string): string {
  return text.normalize('NFC').trim().replace(/\s+/g, ' ');
}

function comparisonKey(text: string): string {
  return cleanText(text)
    .toLocaleLowerCase('vi')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd');
}

const conditionAliases: Readonly<Record<string, readonly string[]>> = {
  diabetes: ['Đái tháo đường', 'Tiểu đường'],
  'asthma-copd': ['Hen suyễn', 'COPD'],
  arthritis: ['Viêm khớp', 'Thoái hóa khớp'],
  stroke: ['Tai biến mạch máu não', 'Tiền sử đột quỵ', 'Đột quỵ'],
  dementia: ['Sa sút trí tuệ', 'Alzheimer'],
};

function normalizeOtherConditions(text: string, selected: readonly string[]): string | undefined {
  const knownKeys = new Set<string>();
  for (const condition of CHRONIC_CONDITIONS) {
    if (!selected.includes(condition.value)) continue;
    knownKeys.add(comparisonKey(condition.label));
    knownKeys.add(comparisonKey(condition.value));
    for (const alias of conditionAliases[condition.value] ?? []) knownKeys.add(comparisonKey(alias));
  }
  const normalized: string[] = [];
  for (const item of text.split(/[,;\n]+/)) {
    const value = cleanText(item);
    const key = comparisonKey(value);
    if (!key || knownKeys.has(key)) continue;
    knownKeys.add(key);
    normalized.push(value);
  }
  return normalized.length ? normalized.join(', ') : undefined;
}

export function toggleChronicCondition(selected: readonly string[], value: string): string[] {
  if (selected.includes(value)) return selected.filter((item) => item !== value);
  if (value === 'none' || value === 'unknown') return [value];
  return [...selected.filter((item) => item !== 'none' && item !== 'unknown'), value];
}

export function validateSeniorForm(
  values: SeniorFormValues,
  currentYear = new Date().getFullYear()
): SeniorFormErrors {
  const errors: SeniorFormErrors = {};
  if (Array.from(cleanText(values.fullName)).length < 2) {
    errors.fullName = 'Vui lòng nhập họ tên có ít nhất 2 ký tự.';
  }
  const yearText = values.birthYear.trim();
  if (!/^\d{4}$/.test(yearText) || Number(yearText) < 1000 || Number(yearText) > currentYear) {
    errors.birthYear = `Vui lòng nhập năm sinh gồm 4 chữ số, từ 1000 đến ${currentYear}.`;
  }
  if (!RELATIONSHIPS.some((item) => item.value === values.relationship)) {
    errors.relationship = 'Vui lòng chọn quan hệ của người thân với bạn.';
  }
  if (values.relationship === 'other' && !cleanText(values.relationshipOther)) {
    errors.relationshipOther = 'Vui lòng nhập quan hệ của người thân với bạn.';
  }
  if (values.chronicConditions.some((value) => !CHRONIC_CONDITIONS.some((item) => item.value === value))) {
    errors.chronicConditions = 'Vui lòng chọn bệnh nền trong danh sách hoặc nhập ở mục Khác.';
  }
  const conditions = [...new Set(values.chronicConditions)];
  if (conditions.some((value) => value === 'none' || value === 'unknown') && conditions.length > 1) {
    errors.chronicConditions = 'Không có bệnh nền đã biết và Chưa rõ phải được chọn riêng.';
  }
  return errors;
}

export function normalizeSeniorForm(values: SeniorFormValues): CreateSeniorInput {
  const errors = validateSeniorForm(values);
  if (Object.keys(errors).length) throw new Error('Vui lòng kiểm tra các thông tin bắt buộc.');
  const selected = [...new Set(values.chronicConditions)];
  const exclusive = selected.includes('none') || selected.includes('unknown');
  return {
    fullName: cleanText(values.fullName),
    birthYear: Number(values.birthYear.trim()),
    relationship: values.relationship as SeniorRelationship,
    relationshipOther:
      values.relationship === 'other' ? cleanText(values.relationshipOther) : undefined,
    avatarUri: values.avatarUri?.trim() || undefined,
    chronicConditions: selected.filter((value) => value !== 'other'),
    chronicConditionOther: exclusive
      ? undefined
      : normalizeOtherConditions(values.chronicConditionOther, selected),
    medicalNotes: values.medicalNotes.trim().normalize('NFC') || undefined,
    isPrimarySosContact: values.isPrimarySosContact,
  };
}
