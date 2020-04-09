import { IApplicationState } from "./ApplicationState";
import { IEditSiteDesignActionArgs, ActionType, ISetAllAvailableSiteDesigns, ISetAllAvailableSiteScripts, IEditSiteScriptActionArgs, ISetLoadingArgs } from "./IApplicationAction";
import { IAction } from "./App";

export const Reducers: (applicationState: IApplicationState, action: IAction<ActionType>) => IApplicationState =
    (applicationState: IApplicationState, action: IAction<ActionType>) => {
        if (!action) {
            return applicationState;
        }

        const actionArgs = action as any;

        switch (action.type) {
            case "GO_TO":
                return {
                    ...applicationState,
                    page: actionArgs.page
                };
            case "EDIT_SITE_DESIGN":
                return {
                    ...applicationState,
                    page: "SiteDesignEdition",
                    currentSiteDesign: (actionArgs as IEditSiteDesignActionArgs).siteDesign
                };
            case "EDIT_SITE_SCRIPT":
                return {
                    ...applicationState,
                    page: "SiteScriptEdition",
                    currentSiteScript: (actionArgs as IEditSiteScriptActionArgs).siteScript
                };
            case "SET_ALL_AVAILABLE_SITE_DESIGNS":
                return {
                    ...applicationState,
                    allAvailableSiteDesigns: (actionArgs as ISetAllAvailableSiteDesigns).siteDesigns
                };
            case "SET_ALL_AVAILABLE_SITE_SCRIPTS":
                return {
                    ...applicationState,
                    allAvailableSiteScripts: (actionArgs as ISetAllAvailableSiteScripts).siteScripts
                };
            case "SET_LOADING":
                return {
                    ...applicationState,
                    isLoading: (actionArgs as ISetLoadingArgs).loading
                };
            default:
                return applicationState;
        }
    };