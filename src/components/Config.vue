<template>
	<div class="kintone-customize">
		<v-app v-resize="onResize">
			<v-content>
				<!-- select field dialog -->
				<select-field-dialog :fields="fields" v-model="dialog" :selectedFields.sync="selectedFields"/>
				<v-container>
					<v-layout>
						<v-flex xs3>
							<v-text-field v-model="viewId" label="一覧ID"></v-text-field>
						</v-flex>
					</v-layout>
					<v-layout>
						<v-flex xs3>
							<v-btn @click="dialog=true" color="primary" small>フィールドを選択</v-btn>
						</v-flex>
					</v-layout>
					<v-layout>
						<v-flex xs12>
							<div class="text-xs-right">
								<v-btn @click="submit" color="primary" small>保存</v-btn>
							</div>
						</v-flex>
					</v-layout>
				</v-container>
			</v-content>
		</v-app>
	</div>
</template>

<script>
import SelectFieldDialog from './SelectFieldDialog.vue';
import moment from 'moment';

export default {
	props: [
		'defaultViewId',
		'defaultFields'
	],
	components: {
		SelectFieldDialog
	},
	data() {
		return {
			appId: null,

			// window size
			windowSize: { width: 0, height: 0 },

			// field select
			dialog: false,
			fields: null,
			selectedFields: [],

		}
	},
	computed: {


	},
	watch: {

	},
	methods: {

		onResize() {
			this.windowSize = { width: window.innerWidth, height: window.innerHeight };
		},

		async getFields() {

			const { properties } = await kintone.api('/k/v1/form', 'GET', {
				app: this.appId
			});

			const fields = [];

			let ngFieldTypes = [
				'REFERENCE_TABLE',
				'SUBTABLE',
				'GROUP',
				'FILE',
				'RICH_TEXT'
			];

			for (let prop of properties) {
				const { code, label, type } = prop;
				if (code && type && ngFieldTypes.indexOf(type) === -1) {
					fields.push({ code, label, type });
				}
			}

			const displayFields = (this.defaultFields || '').split(',');

			this.fields = fields;
			this.selectedFields = displayFields
				.map((displayField) => fields.find(({ code }) => code === displayField))
				.filter((n) => n);

		},

		submit() {

			const viewId = this.viewId;
			const fields = this.selectedFields.map(({ code }) => code).join(',');
			console.log(fields);

			kintone.plugin.app.setConfig({ viewId, fields });

		}

	},
	mounted() {

		this.onResize();

		// get app info
		this.appId = kintone.app.getId();

		this.viewId = this.defaultViewId;
		this.getFields();

	}
}
</script>

<style lang="scss">
.kintone-customize {
}
</style>
