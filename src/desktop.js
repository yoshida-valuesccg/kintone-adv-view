import Vue from 'vue';
import Vuetify from 'vuetify';
import VueRouter from 'vue-router';
import App from './components/Desktop.vue';
import './style/kintoneCustomize.scss';

const PLUGIN_ID = kintone.$PLUGIN_ID;
const config = kintone.plugin.app.getConfig(PLUGIN_ID);

const router = new VueRouter({
    mode: 'history',
    routes: []
});

Vue.use(VueRouter);
Vue.use(Vuetify);
// Vue.use(Vuetify, {
//     theme: {
//         primary: '#3498db',
//         secondary: '#424242',
//         accent: '#82B1FF',
//         error: '#e74c3c',
//         info: '#89c0c7',
//         success: '#91c36c',
//         warning: '#f1c40f'
//     }
// });

kintone.events.on('app.record.index.show', (event) => {

    const { viewId } = event;
    console.log(event);

    if (Number(viewId) === Number(config.viewId)) {

        const vm = new Vue({
            router,
            el: '#app',
            render: h => h(App, {
                props: {
                    viewId,
                    defaultFields: config.fields || ''
                }
            })
        });

    }

    return event;

});
