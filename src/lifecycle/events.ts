import type { EventType } from '../parser/types';
export const rescueSteps: { type: EventType; title: string; description: string }[] = [
 { type:'session_started', title:'Incident detected', description:'Coupon validation failure reported from checkout-service.' },
 { type:'user_prompt', title:'Checkpoint context restored', description:'Recovered intent and recent working assumptions.' },
 { type:'agent_response', title:'Previous work reconstructed', description:'Validation flow and expected failure behavior recovered.' },
 { type:'file_read', title:'Files identified', description:'Mapped the affected checkout implementation and test coverage.' },
 { type:'tool_call', title:'Root cause investigation', description:'Tracing validation precedence for disabled and expired coupons.' },
 { type:'file_changed', title:'Fix prepared', description:'Corrected validation order with the smallest safe change.' },
 { type:'test_execution', title:'Tests running', description:'Executing focused coupon validation coverage.' },
 { type:'tool_result', title:'Verification passed', description:'Targeted checks completed successfully.' },
 { type:'checkpoint_created', title:'Checkpoint created', description:'Recovery reasoning recorded for the next agent.' },
];
