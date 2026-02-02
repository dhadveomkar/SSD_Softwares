export interface IDynamicNavItem {
Id: number;
Title: string;
Url?: string;
ParentId?: number | null;
Order?: number;
IconUrl?: string;
AudienceType?: string; // 'Everyone' | 'SPGroup' | 'AADGroup' | 'None'
AudienceId?: string; // group title for SPGroup or group id for AADGroup
IsEnabled?: boolean;
OpenInNewTab?: boolean;
}