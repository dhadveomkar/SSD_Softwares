// src/extensions/dynamicNavigationHeader/components/IDynamicHeaderProps.ts
import { ApplicationCustomizerContext } from '@microsoft/sp-application-base';

export interface IDynamicHeaderProps {
  context: ApplicationCustomizerContext;
  listName: string;
  logoText?: string;
}
