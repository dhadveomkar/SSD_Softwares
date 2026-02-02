import * as React from 'react';
import styles from './NavetPersonalLinks.module.scss';
import { INavetPersonalLinksProps } from './INavetPersonalLinksProps';
import {
  DefaultButton,
  Dialog,
  DialogFooter,
  DialogType,
  Link,
  PrimaryButton,
  TextField
} from '@fluentui/react';
import { SPHttpClient } from '@microsoft/sp-http';
import { IUserData, Link as LinkObject } from '../../../common/IUserData';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { v1 as generateId } from 'uuid';

export interface INavetPersonalLinksState {
  userData?: IUserData;
  panelIsOpen: boolean;
  editMode: boolean;
  editDialogIsHidden: boolean;
  editDialogHeader?: string;
  deleteDialogIsHidden: boolean;
  editLink?: LinkObject;
  errorMessageUrlTextField?: string;
  errorMessageDisplayTextTextField?: string;
}

export const LinkList = (props: { links: LinkObject[], limit?: number}) => {
  const {links, limit} = props;
  const [showAll, setShowAll] = React.useState(false);
  if (!links) return;
  return (<>
    <ul className={styles.linkList}>
      {links.slice(0, limit && !showAll ? limit : undefined).map((link) =>
        <li className={styles.linkListItem}>
          <Link href={link.url} target="_blank">{link.displayText}</Link>
        </li>
      )}
    </ul>
    {links.length > limit &&
      <Link onClick={() => setShowAll(!showAll)}>
        {showAll ? 'Se færre' : 'Se alle'}
      </Link>
    }
  </>);
};

export const ConfirmDeleteDialog = (props: {
  show: boolean,
  link: LinkObject,
  onDismiss: CallableFunction,
  onDeleteLink: CallableFunction,
}) => {
  const {show, link, onDismiss, onDeleteLink} = props;
  const handleOnDismiss = React.useCallback(_ => onDismiss(), [onDismiss]);
  const handleOnDeleteSaveLink = () => onDeleteLink(link);

  return (
    <Dialog
    hidden={!show}
    onDismiss={handleOnDismiss}
    dialogContentProps={{
      type: DialogType.normal,
      title: 'Er du sikker på at du vil slette snarveien?',
      subText: 'Handlingen kan ikke angres.',
    }}
  >
    <DialogFooter>
      <DefaultButton text="Avbryt" onClick={handleOnDismiss} />
      <PrimaryButton text="Slett snarvei" onClick={handleOnDeleteSaveLink} />
    </DialogFooter>
  </Dialog>
  );
};

export const EditDialog = (props: {
  show: boolean;
  header: string;
  editLink: LinkObject,
  onDismiss: CallableFunction,
  onDismissed: CallableFunction,
  onSaveLink: CallableFunction,
}) => {
  const {show, header, editLink, onDismiss, onDismissed, onSaveLink} = props;
  const [link, setLink] = React.useState(editLink);
  const [urlHasError, setUrlHasError] = React.useState(false);
  const [displayTextHasError, setDisplayTextHasError] = React.useState(false);

  React.useEffect(() => setLink(props.editLink), [props.editLink]);

  const validateLink = (): LinkObject | false => {
    const {url, displayText, id} = link;
    let validated = true;

    // ensure link has ID
    if (!id) link.id = generateId();

    // link must have text
    if (displayText === '') {
      setDisplayTextHasError(true);
      validated = false;
    } else {
      setDisplayTextHasError(false);
    }

    // ensure url is valid
    try {
      const _ = new URL(url);
      setUrlHasError(false);
    } catch (_) {
      try {
        const prefix = 'https://';
        const modifiedUrl = url.startsWith(prefix) ? url : `${prefix}${url}`;
        const _ = new URL(modifiedUrl);
        link.url = modifiedUrl;
        setUrlHasError(false);
      } catch(_) {
        setUrlHasError(true);
        validated = false;
      }
    }
    return validated && link;
  };

  const handleOnDismiss = React.useCallback(_ => onDismiss(), [onDismiss]);
  const handleOnDismissed = React.useCallback(_ => onDismissed(), [onDismissed]);

  return (
    <Dialog
      hidden={!show}
      onDismiss={handleOnDismiss}
      modalProps={{onDismissed: () => handleOnDismissed}}
      dialogContentProps={{type: DialogType.normal, title: header}}
    >
      <TextField
        label="Url"
        value={link && link.url}
        onChange={(_, newValue) => {
          setLink({...link, url: newValue});
          if (urlHasError) validateLink();
        }}
        placeholder={'https://'}
        errorMessage={urlHasError && 'Dette er ikke en gyldig URL.'}
        required
      />
      <TextField
        label="Lenketekst"
        value={link && link.displayText}
        onChange={(_, newValue) => {
          setLink({...link, displayText: newValue});
          if (displayTextHasError) validateLink();
        }}
        errorMessage={displayTextHasError && 'Skriv inn navnet på snarveien.'}
        required />
      <DialogFooter>
        <DefaultButton text="Avbryt" onClick={handleOnDismiss} />
        <PrimaryButton text="Lagre snarvei" onClick={() => {
          if (validateLink()) onSaveLink(link);
        }} />
      </DialogFooter>
    </Dialog>
  );
};

export default class NavetPersonalLinks extends React.Component<INavetPersonalLinksProps, INavetPersonalLinksState> {

  public constructor(props: INavetPersonalLinksProps) {
    super(props);
    this.state = {
      panelIsOpen: false,
      editMode: false,
      editDialogIsHidden: true,
      deleteDialogIsHidden: true,
    };
    this.getUserData();
  }

  public render(): React.ReactElement<INavetPersonalLinksProps> {
    const { smallListLimit } = this.props;
    const {
      userData,
      editMode,
      editDialogIsHidden,
      editLink,
      editDialogHeader,
      deleteDialogIsHidden,
    } = this.state;
    const links = userData ? userData.links : [];

    return (
      <div className={styles.navetPersonalLinks}>
        <div className={styles.headerContainer}>
          <div className={styles.headerText} role="heading" aria-level={2}>Mine snarveier</div>
          <Link onClick={()=>this.setState({editMode: !editMode})}>{editMode ? 'Avslutt redigering': 'Rediger snarveier'}</Link>
        </div>
        {!editMode && <>
          {userData && links.length === 0 &&
            <div>Du kan legge inn snarveier til de sidene du bruker oftest. <Link onClick={()=>this.setState({editMode: true})}>Legg inn snarveier</Link></div>
          }
          <LinkList links={links} limit={smallListLimit} />
        </>}
        {editMode && <>
          <p>Legg til, rediger eller slett snarveier.</p>
          <p>Dra snarveiene opp eller ned i listen for å omorganisere.</p>
          <DragDropContext onDragEnd={this._reorderLinks.bind(this)}>
            <Droppable droppableId="droppable">
              {(droppableProvided, droppableSnapshot) => (
                <div
                  {...droppableProvided.droppableProps}
                  ref={droppableProvided.innerRef}
                >
                  {links.map((link, index)=>(
                    <Draggable key={link.id} draggableId={link.id} index={index}>
                      {(draggableProvided, draggableSnapshot) => (
                        <div
                          ref={draggableProvided.innerRef}
                          {...draggableProvided.draggableProps}
                          {...draggableProvided.dragHandleProps}
                        >
                          <div style={{border: '1px solid rgb(237, 235, 233)', borderRadius: '4px', marginBottom: '3px', padding: '3px', display: 'flex', alignItems: 'center', cursor: 'grab'}}>
                            <div aria-label="Flytt snarvei" style={{cursor: 'grab', padding:'0 5px', fontSize: '18px'}}>&#x21f3;</div>
                            <div style={{flexGrow: 1, padding:'0 5px'}}>{link.displayText}</div>
                            <Link className="columnEditLink" style={{padding:'0 5px'}} onClick={()=>this.setState({editDialogIsHidden: false, editLink: link, editDialogHeader: 'Rediger snarvei'})}>Rediger</Link>
                            <Link className="columnDeleteLink" style={{padding:'0 5px'}} onClick={()=>this.setState({deleteDialogIsHidden: false, editLink: link})}>Slett</Link>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {droppableProvided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
          <DefaultButton
            iconProps={{ iconName: 'Add' }}
            text="Legg til snarvei"
            style={{marginTop:10}}
            onClick={()=> this.setState({
              editDialogIsHidden: false,
              editLink: {displayText: '', url: ''},
              editDialogHeader: 'Legg til snarvei',
            })}
          />
          <ConfirmDeleteDialog
            show={!deleteDialogIsHidden}
            link={editLink}
            onDismiss={() => this.setState({deleteDialogIsHidden: true, editLink: undefined})}
            onDeleteLink={() => {
              this._deleteLink(editLink);
              this.setState({deleteDialogIsHidden: true, editLink: undefined});
            }}
          />
          <EditDialog
            show={!editDialogIsHidden}
            header={editDialogHeader}
            editLink={editLink}
            onDismiss={()=>this.setState({editDialogIsHidden: true})}
            onDismissed={()=> this.setState({
              errorMessageDisplayTextTextField: undefined,
              errorMessageUrlTextField: undefined,
              editLink: undefined,
              editDialogHeader: undefined,
            })}
            onSaveLink={(link: LinkObject) => {
              this._upsertLink(link);
              this.setState({editDialogIsHidden: true});
            }}
          />
        </>}
      </div>
    );
  }

  private _upsertLink(link: LinkObject) {
    const {userData} = this.state;

    const existingLinkIndex = userData.links.findIndex(_item => _item.id === link.id);
    if (existingLinkIndex > -1) userData.links[existingLinkIndex] = link;
    else userData.links.push(link);

    this.saveUserData(userData);
  }

  private _reorderLinks(result) {
    // dropped outside the list
    if (!result.destination) return;

    const {userData} = this.state;
    const [removed] = userData.links.splice(result.source.index, 1);
    userData.links.splice(result.destination.index, 0, removed);
    this.saveUserData(userData);
  }

  private _deleteLink(link: LinkObject) {
    const {userData} = this.state;
    userData.links = userData.links.filter((l) => l.id !== link.id);
    this.saveUserData(userData);
  }

  public async getUserData(retryInterval = 200, attempt = 0, maxAttempts = 5) {
    const {
      listTitle,
      context: {
        pageContext: {
          web: {absoluteUrl},
          user: {loginName},
        }
      }
    } = this.props;
    const userEmail = `i:0#.f|membership|${loginName}`;
    const url = `${absoluteUrl}/_api/web/lists/GetByTitle('${listTitle}')/items?` +
      `$select=Id,PzlPersonalLinks,Title,Modified` +
      `&$filter=PzlLogin eq '${encodeURIComponent(userEmail)}'` +
      `&$orderby=Modified desc`;
    const result = await this.props.context.spHttpClient.get(url, SPHttpClient.configurations.v1);
    const data = await result.json();
    const currentUserData = data.value ? data.value[0] : undefined;
    if(currentUserData === undefined) {
      if (attempt < maxAttempts) {
        setTimeout(async () => {
          return await this.getUserData(Math.min(4000, retryInterval * 2), attempt + 1, maxAttempts);
        }, retryInterval);
        return;
      }
      const newUserData: IUserData = {
        isNew: false,
        links: [],
        subjects: [],
        tools: [],
        units: [],
        user: {userEmail}
      };
      this.saveUserData(newUserData);
      return;
    }
    const currentUserDataObject = JSON.parse(currentUserData['PzlPersonalLinks']) as IUserData;
    currentUserDataObject.user.linkFieldId = currentUserData['Id'];
    this.setState({userData: currentUserDataObject});
  }

  public async saveUserData(userData: IUserData): Promise<boolean> {
    this.setState({userData});
    const {
      listTitle,
      context: {
        pageContext: {
          web: {absoluteUrl},
        }
      }
    } = this.props;
    let itemId = userData.user.linkFieldId ? Number(userData.user.linkFieldId) : undefined;
    const stringData = JSON.stringify(userData);
    let okStatus: boolean;
    try {
      if(itemId) {
        const url = `${absoluteUrl}/_api/web/lists/GetByTitle('${listTitle}')/items(${itemId})`;
        const result = await this.props.context.spHttpClient.post(url, SPHttpClient.configurations.v1, {
          headers: {
            'Accept': 'application/json;odata=nometadata',
            'Content-type': 'application/json;odata=nometadata',
            'odata-version': '',
            'IF-MATCH': '*',
            'X-HTTP-Method': 'MERGE',
          },
          body: JSON.stringify({
            'PzlPersonalLinks': stringData,
          }),
        });
        const data = await result.json();
      } else {
        const url = `${absoluteUrl}/_api/web/lists/GetByTitle('${listTitle}')/items`;
        const result = await this.props.context.spHttpClient.post(url, SPHttpClient.configurations.v1, {
          headers: {
            'Accept': 'application/json;odata=nometadata',
            'Content-type': 'application/json;odata=nometadata',
            'odata-version': '',
          },
          body: JSON.stringify({
            'PzlPersonalLinks': stringData,
            'Title': userData.user.userEmail,
            'PzlLogin': userData.user.userEmail,
          }),
        });
        const data = await result.json();
      }
      okStatus = true;
      sessionStorage.clear();
    } catch( err ) {
      okStatus = false;
    }
    this.getUserData();
    return okStatus;
  }

  /*
  public async getLinkStats() {
    const {
      web: {absoluteUrl},
    } = this.props.context.pageContext;
    const listTitle = 'Personlige data';
    const url = `${absoluteUrl}/_api/web/lists/GetByTitle('${listTitle}')/items?` +
      `$select=Id,PzlPersonalLinks,PzlLogin,Modified` +
      `&$orderby=Modified desc` +
      `&$top=5000`;
    const result = await this.props.context.spHttpClient.get(url, SPHttpClient.configurations.v1);
    const data = await result.json();
    const userData = data.value;
    const linksLengths = userData.map((user) => {
      if (user) {
        const d = JSON.parse(user['PzlPersonalLinks']) as IUserData;
        return d.links.length;
      }
      return 0;
    });
    const csvContent = "data:text/csv;charset=utf-8," + linksLengths.join("\n");
    var encodedUri = encodeURI(csvContent);
    window.open(encodedUri);
  }
  */

}
