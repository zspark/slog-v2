export type pid_t = string;
export type wid_t = string;
export type tid_t = string;

export type url_t = string;
export type path_t = string;

export enum PANE_TYPE {
    UNKNOWN = 'unknown',
    CONTENT = "content",
    LAYOUT = "layout",
    ACTION = "action",
}
export const WIDGET_ICON_SIZE = 16; //px
export const WIDGET_MIN_HEIGHT = 200; //px

export enum WIDGET_STATE {
    EDITOR = -1,
    UNKNOWN = 0,
    VIEW = 1,
}

export enum WIDGET_TYPE {
    UNKNOWN = 'unknown',
    PAGE_NEW = 'page_new',
    PROPERTY = 'property',
    MARKDOWN = 'markdown',
    CUSTOM = 'custom',
    TEMPLATE = 'template',
}
export enum WIDGET_ACTION {
    NONE = 0x0,
    NEW = 0x01,
    TOGGLE = 0x01 << 1,
    PREVIEW = 0x01 << 2,
    SAVE = 0x01 << 3,
    DELETE = 0x01 << 4,
    SAVE_TEMPLATE = 0x01 << 7,
}
export type widget_content_t = {
    id: wid_t,
    type: WIDGET_TYPE,
    data: {
        content: string,
        layout: string,
        action: string,
    }
}

export type page_content_t = {
    id: pid_t,
    indexes: Array<wid_t>,
    sections: Record<wid_t, widget_content_t>,
}

export type page_resource_t = {
    name: string,
    dim: Array<number>,
    sizeInBytes: number,
}

export type page_property_t = {
    id: pid_t,
    createTime: string,
    modifyTime: string,
    title: string,
    author: string,
    description: string,
    tags: string,
    resources: Array<page_resource_t>,
}

export type template_content_t = {
    tid: string,
    name: string,
    content?: string,
    layout?: string,
    action?: string,
}
/*
{
  "indexes": ["W-53d9c676-2de9-4469-8d4f-f67c491c1050"],
  "sections": {
    "W-53d9c676-2de9-4469-8d4f-f67c491c1050": {
      "WID": "W-53d9c676-2de9-4469-8d4f-f67c491c1050",
      "type": 9,
      "data":{
          "js":"",
          "markdown":'sfsfsfs',
      }
    }
  },
  "version": { "major": 0, "minor": 4, "patch": 0 }
}
*/

