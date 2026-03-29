export type RunState = 'pass' | 'fail' | 'running' | 'cancelled';

export type NodeState = 'pass' | 'fail' | 'running' | 'pending' | 'cancelled';

export type TriggerKind = 'branch' | 'tag' | 'pr' | 'retry';
