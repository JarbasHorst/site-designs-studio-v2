import * as React from "react";
import { ActionType, IEditSiteScriptActionArgs } from "../../app/IApplicationAction";
import styles from "./NewSiteScriptPanel.module.scss";
import { useAppContext } from "../../app/App";
import { IApplicationState } from "../../app/ApplicationState";
import { ISiteScript, ISiteScriptContent } from "../../models/ISiteScript";
import { SiteScriptSchemaServiceKey } from "../../services/siteScriptSchema/SiteScriptSchemaService";
import { useState, useEffect } from "react";
import { Panel, PanelType } from "office-ui-fabric-react/lib/Panel";
import { SiteDesignsServiceKey, IGetSiteScriptFromWebOptions, IGetSiteScriptFromExistingResourceResult } from "../../services/siteDesigns/SiteDesignsService";
import { TextField, PrimaryButton, Stack, Toggle, CompoundButton, DefaultButton } from "office-ui-fabric-react";
import { SitePicker } from "../common/sitePicker/SitePicker";
import { ListPicker } from "../common/listPicker/ListPicker";

export interface INewSiteScriptPanelProps {
    isOpen: boolean;
    onCancel?: () => void;
}

interface ICreateArgs {
    from: "BLANK" | "WEB" | "LIST";
    listUrl?: string;
    webUrl?: string;
}

const getDefaultFromWebArgs = () => ({
    includeSiteExternalSharingCapability: true,
    includeLinksToExportedItems: true,
    includeBranding: true,
    includeLists: [],
    includeRegionalSettings: true,
    includeTheme: true
});

export const NewSiteScriptPanel = (props: INewSiteScriptPanelProps) => {

    const [appContext, action] = useAppContext<IApplicationState, ActionType>();
    // Get services instances
    const siteScriptSchemaService = appContext.serviceScope.consume(SiteScriptSchemaServiceKey);
    const siteDesignsService = appContext.serviceScope.consume(SiteDesignsServiceKey);
    const [needsArguments, setNeedsArguments] = useState<boolean>(false);
    const [creationArgs, setCreationArgs] = useState<ICreateArgs>({ from: "BLANK" });
    const [fromWebArgs, setFromWebArgs] = useState<IGetSiteScriptFromWebOptions>(getDefaultFromWebArgs());

    useEffect(() => {
        setCreationArgs({ from: "BLANK" });
        setNeedsArguments(false);
        setFromWebArgs(getDefaultFromWebArgs());
    }, [props.isOpen]);

    const onCancel = () => {
        if (props.onCancel) {
            props.onCancel();
        }
    };

    const onScriptAdded = async () => {
        try {
            let newSiteScriptContent: ISiteScriptContent = null;
            let fromExistingResult: IGetSiteScriptFromExistingResourceResult = null;
            switch (creationArgs.from) {
                case "BLANK":
                    newSiteScriptContent = siteScriptSchemaService.getNewSiteScript();
                    break;
                case "WEB":
                    fromExistingResult = await siteDesignsService.getSiteScriptFromWeb(creationArgs.webUrl, fromWebArgs);
                    newSiteScriptContent = fromExistingResult.JSON;
                    break;
                case "LIST":
                    fromExistingResult = await siteDesignsService.getSiteScriptFromList(creationArgs.listUrl);
                    newSiteScriptContent = fromExistingResult.JSON;
                    break;
            }

            const siteScript: ISiteScript = {
                Id: null,
                Title: null,
                Description: null,
                Version: 1,
                Content: newSiteScriptContent
            };
            action("EDIT_SITE_SCRIPT", { siteScript } as IEditSiteScriptActionArgs);
        } catch (error) {
            console.error(error);
        }
    };

    const onChoiceClick = (createArgs: ICreateArgs) => {
        setCreationArgs(createArgs);
        switch (createArgs.from) {
            case "BLANK":
                onScriptAdded();
                break;
            case "LIST":
                setNeedsArguments(true);
                break;
            case "WEB":
                setNeedsArguments(true);
                break;
        }
    };

    const renderFromWebArgumentsForm = () => {
        return <Stack tokens={{ childrenGap: 8 }}>
            <SitePicker label="Site" onSiteSelected={webUrl => {
                setCreationArgs({ ...creationArgs, webUrl });
            }} serviceScope={appContext.serviceScope} />
            <TextField label="Include lists"
                multiline
                rows={6}
                placeholder="1 list relative URL per row"
                onChange={(_, listUrlsStr) => setFromWebArgs({ ...fromWebArgs, includeLists: listUrlsStr.split('\n') })} />
            <div className={styles.toggleRow}>
                <div className={styles.column8}>Include Branding</div>
                <div className={styles.column4}>
                    <Toggle checked={true} onChange={(_, includeBranding) => setFromWebArgs({ ...fromWebArgs, includeBranding })} />
                </div>
            </div>
            <div className={styles.toggleRow}>
                <div className={styles.column8}>Include Regional settings</div>
                <div className={styles.column4}>
                    <Toggle checked={true} onChange={(_, includeRegionalSettings) => setFromWebArgs({ ...fromWebArgs, includeRegionalSettings })} />
                </div>
            </div>
            <div className={styles.toggleRow}>
                <div className={styles.column8}>Include Site external sharing capability</div>
                <div className={styles.column4}>
                    <Toggle checked={true} onChange={(_, includeSiteExternalSharingCapability) => setFromWebArgs({ ...fromWebArgs, includeSiteExternalSharingCapability })} />
                </div>
            </div>
            <div className={styles.toggleRow}>
                <div className={styles.column8}>Include theme</div>
                <div className={styles.column4}>
                    <Toggle checked={true} onChange={(_, includeTheme) => setFromWebArgs({ ...fromWebArgs, includeTheme })} />
                </div>
            </div>
            <div className={styles.toggleRow}>
                <div className={styles.column8}>Include links to exported items</div>
                <div className={styles.column4}>
                    <Toggle checked={true} onChange={(_, includeLinksToExportedItems) => setFromWebArgs({ ...fromWebArgs, includeLinksToExportedItems })} />
                </div>
            </div>
        </Stack>;
    };

    const renderFromListArgumentsForm = () => {
        return <Stack tokens={{ childrenGap: 8 }}>
            <SitePicker label="Site" onSiteSelected={webUrl => {
                setCreationArgs({ ...creationArgs, webUrl });
            }} serviceScope={appContext.serviceScope} />
            <ListPicker serviceScope={appContext.serviceScope}
                webUrl={creationArgs.webUrl}
                label="List"
                onListSelected={(listUrl) => setCreationArgs({ ...creationArgs, listUrl })}
            />
        </Stack>;
    };

    const renderArgumentsForm = () => {
        if (!needsArguments) {
            return null;
        }

        if (creationArgs.from == "LIST") {
            return renderFromListArgumentsForm();
        } else if (creationArgs.from == "WEB") {
            return renderFromWebArgumentsForm();
        }
    };

    const validateArguments = () => {
        return true;
    };

    const getPanelHeaderText = () => {
        if (!needsArguments) {
            return "Add a new Site Script";
        }

        switch (creationArgs.from) {
            case "LIST":
                return "Add a new Site Script from existing list";
            case "WEB":
                return "Add a new Site Script from existing site";
            default:
                return "";
        }
    };

    return <Panel type={PanelType.smallFixedFar}
        headerText={getPanelHeaderText()}
        isOpen={props.isOpen}
        onDismiss={onCancel}
        onRenderFooterContent={() => needsArguments && <div className={styles.panelFooter}>
            <Stack horizontalAlign="end" horizontal tokens={{ childrenGap: 25 }}>
                <PrimaryButton text="Add Site Script" onClick={onScriptAdded} disabled={!validateArguments()} />
                <DefaultButton text="Cancel" onClick={onCancel} />
            </Stack>
        </div>}>
        <div className={styles.NewSiteScriptPanel}>
            {!needsArguments && <Stack tokens={{ childrenGap: 20 }}>
                <CompoundButton
                    iconProps={{ iconName: "PageAdd" }}
                    text="Blank"
                    secondaryText="Create a new blank Site Script"
                    onClick={() => onChoiceClick({ from: "BLANK" })}
                />
                <CompoundButton
                    iconProps={{ iconName: "SharepointLogoInverse" }}
                    text="From Site"
                    secondaryText="Create a new Site Script from an existing site"
                    onClick={() => onChoiceClick({ from: "WEB" })}
                />
                <CompoundButton
                    iconProps={{ iconName: "PageList" }}
                    text="From List"
                    secondaryText="Create a new Site Script from an existing list"
                    onClick={() => onChoiceClick({ from: "LIST" })}
                />
            </Stack>}
            {renderArgumentsForm()}
        </div>
    </Panel>;
};