export const allowedVerificationCommands=['npm test','npm run build'] as const;
export type AllowedVerificationCommand=typeof allowedVerificationCommands[number];
export interface VerificationResult { id:string; command:AllowedVerificationCommand; status:'RUNNING'|'PASSED'|'FAILED'; startedAt:string; finishedAt?:string; durationMs?:number; exitCode?:number; stdout?:string; stderr?:string; }
export function isAllowedVerificationCommand(command:string):command is AllowedVerificationCommand{return(allowedVerificationCommands as readonly string[]).includes(command)}
