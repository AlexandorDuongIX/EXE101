import type { Senior } from '../seniors/types';

export type LinkCode = {
  code: string;
  expiresAt: number;
  seniorId: string;
};

export type LinkRepositoryOptions = {
  now?: () => number;
  generateCode?: () => string;
};

export interface LinkRepository {
  getLinkedSenior(): Senior | undefined;
  getLinkedSeniorId(): string | undefined;
  getProfileLinkStatus(seniorId: string): boolean;
  issueCode(seniorId: string, forceNew?: boolean): LinkCode;
  linkSenior(code: string): Senior;
}
