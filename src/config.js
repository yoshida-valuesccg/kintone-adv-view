import App from './components/Config.vue';
import './style/kintoneCustomize.scss';

const PLUGIN_ID = kintone.$PLUGIN_ID;
const config = kintone.plugin.app.getConfig(PLUGIN_ID);

const { viewId, fields } = config || {};

const vm = new Vue({
    el: '#config',
    render: h => h(App, {
        props: {
            defaultViewId: viewId || '',
            defaultFields: fields || '',
        }
    })
});
