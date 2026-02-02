
export interface IUserDataBase {
  id: string;
}

export interface IUserData {
  isNew?: boolean;
  units: ISelectionData[];
  user: User;
  links: Link[];
  tools: Tool[];
  subjects: ISelectionData[];
  opMessages?: boolean;
}

export interface ISelectionData extends IUserDataBase {
  label: string;
  value: string;
  isSelected: boolean;
  children?: ISelectionData[];
  url: string;
  parent?: string;
  section?: string;
  hasChildEqualToHeader?: string;
}

export interface IGroupedSelectionData {
  title: string;
  children: ISelectionData[];
}
export interface Link {
  id?: string;
  displayText: string;
  url: string;
  priority?: string;
}

export interface Tool extends IUserDataBase {
  id: string;
  displayText: string;
  url: string;
  priority?: string;
  isSelected?: boolean;
  isPromoted?: boolean;
}

export interface User {
  userEmail: string;
  linkFieldId?: string;
}
