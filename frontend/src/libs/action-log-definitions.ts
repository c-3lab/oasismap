import type { ActionLogType } from '@/libs/client-error-reporting'

export type ActionDefinition = {
  type: ActionLogType
  label: string
  target?: string
}

const LOG_TYPE = {
  CLICK: 'click',
  API_CALL: 'apiCall',
  MAP_INTERACTION: 'mapInteraction',
  ROUTE_CHANGE: 'routeChange',
} as const satisfies Record<string, ActionLogType>

export function defineAction(
  type: ActionLogType,
  label: string,
  target?: string
): ActionDefinition {
  return target !== undefined ? { type, label, target } : { type, label }
}

export const clickActions = {
  loginGoogle: defineAction(LOG_TYPE.CLICK, 'loginGoogle'),
  headerMenu: defineAction(LOG_TYPE.CLICK, 'headerMenu'),
  headerFilter: defineAction(LOG_TYPE.CLICK, 'headerFilter'),
  searchDrawerClose: defineAction(LOG_TYPE.CLICK, 'searchDrawerClose'),
  search: defineAction(LOG_TYPE.CLICK, 'search'),
  mapCurrentPosition: defineAction(LOG_TYPE.CLICK, 'mapCurrentPosition'),
  mapAddHappiness: defineAction(LOG_TYPE.CLICK, 'mapAddHappiness'),
  mapClusterClick: defineAction(LOG_TYPE.CLICK, 'mapClusterClick'),
  mapPinClick: defineAction(LOG_TYPE.CLICK, 'mapPinClick'),
  mapPopupClose: defineAction(LOG_TYPE.CLICK, 'mapPopupClose'),
  listRowExpand: defineAction(LOG_TYPE.CLICK, 'listRowExpand'),
  listRowMenu: defineAction(LOG_TYPE.CLICK, 'listRowMenu'),
  listShowOnMap: defineAction(LOG_TYPE.CLICK, 'listShowOnMap'),
  listDelete: defineAction(LOG_TYPE.CLICK, 'listDelete'),
  listSort: defineAction(LOG_TYPE.CLICK, 'listSort'),
  deleteConfirmCancel: defineAction(LOG_TYPE.CLICK, 'deleteConfirmCancel'),
  deleteConfirmDelete: defineAction(LOG_TYPE.CLICK, 'deleteConfirmDelete'),
  inputRadio: defineAction(LOG_TYPE.CLICK, 'inputRadio'),
  inputMemo: defineAction(LOG_TYPE.CLICK, 'inputMemo'),
  inputImageSelect: defineAction(LOG_TYPE.CLICK, 'inputImageSelect'),
  inputSubmit: defineAction(LOG_TYPE.CLICK, 'inputSubmit'),
  importFileSelect: defineAction(LOG_TYPE.CLICK, 'importFileSelect'),
  importUpload: defineAction(LOG_TYPE.CLICK, 'importUpload'),
  sidebarNav: (target: string) =>
    defineAction(LOG_TYPE.CLICK, 'sidebarNav', target),
  sidebarExport: defineAction(LOG_TYPE.CLICK, 'sidebarExport'),
  sidebarSignOut: defineAction(LOG_TYPE.CLICK, 'sidebarSignOut'),
}

export const apiActions = {
  happinessMe: defineAction(LOG_TYPE.API_CALL, 'happiness/me'),
  happinessAll: defineAction(LOG_TYPE.API_CALL, 'happiness/all'),
  happinessList: defineAction(LOG_TYPE.API_CALL, 'happiness/list'),
  happinessPost: defineAction(LOG_TYPE.API_CALL, 'happiness/post'),
  happinessDelete: defineAction(LOG_TYPE.API_CALL, 'happiness/delete'),
  happinessExport: defineAction(LOG_TYPE.API_CALL, 'happiness/export'),
  happinessImport: defineAction(LOG_TYPE.API_CALL, 'happiness/import'),
}

export const mapActions = {
  mapZoom: defineAction(LOG_TYPE.MAP_INTERACTION, 'mapZoom'),
  mapPan: defineAction(LOG_TYPE.MAP_INTERACTION, 'mapPan'),
}

export const routeActions = {
  routeChange: (pathname: string) =>
    defineAction(LOG_TYPE.ROUTE_CHANGE, pathname),
}
