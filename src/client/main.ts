import Controller from "./controller"
import * as WidgetUi from "./ui/widget-handler"
import CommonUi from "./ui/common-ui"
import PageUi from "./ui/page-ui"
import MenuUi from "./ui/menu-ui"
import NavUi from "./ui/nav-ui"
import TemplateUi from "./ui/template-ui"
import SearchUi from "./ui/search-ui"
import MainUiInit from "./ui/main-ui"
//import Messager from "./core/messager.js"
//import Sidebar from "./sidebar/sidebar.js"
//import Page from "./page/page.js"
//import Property from "./property/property.js"
//import Footer from "./footer/footer.js"
//import Search from "./search/search.js"
//import Asset from "./asset/asset.js"

export type ApplicationCreateOption = {
    arrCmd: Array<string>,
    editorMode: boolean,
}
export default class Application {
    //#sidebar = undefined;
    //#page = undefined;
    //#property = undefined;
    //#search = undefined;
    //#asset = undefined;
    //#footer = undefined;

    constructor(TPL: HTMLElement, option?: ApplicationCreateOption) {
        CommonUi.Init(TPL);
        MainUiInit(TPL);
        NavUi.Init(TPL);
        MenuUi.Init(TPL);
        PageUi.Init(TPL);
        TemplateUi.Init(TPL);
        WidgetUi.Init(TPL);
        SearchUi.Init(TPL);
        //new TemplateUi();
        new MenuUi();
        new NavUi();
        new PageUi();
        new SearchUi();


        /*
        const _eh = EventHandler();
        this.#sidebar = new Sidebar(_eh.dispatcher, _eh.listener);
        this.#page = new Page(_eh.dispatcher, _eh.listener);
        this.#property = new Property(_eh.dispatcher, _eh.listener);
        this.#search = new Search(_eh.dispatcher, _eh.listener);
        this.#footer = new Footer(_eh.dispatcher, _eh.listener);
        this.#asset = new Asset();

        DS.Subscribe(DS.EVT_DATASTORAGE_BEFORE_METAS_FETCHED, _event => {
            const _layout = UIAPI.CreateLayout();
            document.body.replaceChildren(_layout.element);

            Messager(UIAPI);
            this.#sidebar.Init(UIAPI);
            this.#page.Init(UIAPI);
            this.#property.Init(UIAPI);
            this.#search.Init(UIAPI);
            this.#asset.Init(UIAPI);
            this.#footer.Init(UIAPI);
        })
        */


        Controller.TryFetchPageList();
    }
}

