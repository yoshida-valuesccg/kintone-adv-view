<template>
	<div class="kintone-customize">
		<v-app v-resize="onResize">
			<v-content>
				<!-- header -->
				<v-layout :style="{background:'#FFF'}">
					<v-flex xs6>
						<div class="text-xs-left">
							<v-btn @click="dialog=true" color="primary" small>フィールドを選択</v-btn>
						</div>
					</v-flex>
					<v-flex xs6>
						<div class="text-xs-right">
							<template v-if="deleteMode">
								<v-btn
									@click="deleteRecords"
									:disabled="selected.length === 0"
									color="error"
									small
								>削除する({{selected.length}})</v-btn>
								<v-btn @click="deleteMode=false" color="grey" icon flat small>
									<v-icon>clear</v-icon>
								</v-btn>
							</template>
							<template v-else>
								<v-btn @click="deleteMode=true" color="error" icon flat small>
									<v-icon>delete</v-icon>
								</v-btn>
							</template>
						</div>
					</v-flex>
				</v-layout>

				<!-- select field dialog -->
				<select-field-dialog :fields="fields" v-model="dialog" :selectedFields.sync="selectedFields"/>

				<!--  -->
				<v-data-table
					id="table"
					ref="table"
					v-model="selected"
					:headers="headers"
					:items="records"
					:loading="loading"
					item-key="$id.value"
					:pagination.sync="pagination"
					:total-items="totalItems"
					:rows-per-page-items="[20,40,60,80,100]"
					rows-per-page-text="表示件数"
					:style="{
                        border:'1px solid rgba(0, 0, 0, 0.12)'
                    }"
					class="table-dense"
				>
					<template slot="items" slot-scope="props">
						<tr :class="{active:deleteMode && props.selected}">
							<td class="text-xs-left">
								<template v-if="deleteMode">
									<v-checkbox
										v-model="props.selected"
										:disabled="!rights[props.index].record.deletable"
										:indeterminate="!rights[props.index].record.deletable"
										primary
										hide-details
									></v-checkbox>
								</template>
								<template v-else>
									<v-btn
										color="primary"
										icon
										flat
										:href="`/k/${appId}/show#record=` + props.item['$id'].value"
										small
										:style="{margin:'0'}"
									>
										<v-icon :size="16">insert_drive_file</v-icon>
									</v-btn>
								</template>
							</td>
							<td
								v-for="(field, index) in selectedFields"
								:key="index"
								class="text-xs-left"
							>{{ toValueString(props.item[field.code]) }}</td>
						</tr>
					</template>
				</v-data-table>
			</v-content>
		</v-app>
	</div>
</template>

<script>
import SelectFieldDialog from './SelectFieldDialog.vue';
import moment from 'moment';

export default {
	props: [
		'viewId',
		'defaultFields'
	],
	components: {
		SelectFieldDialog
	},
	data() {
		return {
			appId: null,
			queryCondition: null,

			// delete
			deleteMode: false,
			selected: [],

			// window size
			windowSize: { width: 0, height: 0 },

			// field select
			dialog: false,
			fields: null,
			selectedFields: [],

			// for table
			records: [],
			rights: [],
			loading: true,
			pagination: {
				rowsPerPage: 20,
				page: 1
			},
			totalItems: 0
		}
	},
	computed: {

		displayFields() {

			if (this.fields) {
				return this.selectedFields.map(({ code }) => code).join(',');
			}

			return this.$route.query.displayFields;

		},

		routeQuery() {

			const { viewId, queryCondition, displayFields } = this;
			const { rowsPerPage, page, sortBy, descending } = this.pagination;

			const routeQuery = {
				view: viewId,
				query: queryCondition,
				displayFields,
				rowsPerPage,
				page,
				sortBy,
				descending
			};

			for (let key of Object.keys(routeQuery)) {
				if (routeQuery[key] == null || routeQuery[key] === '') {
					delete routeQuery[key]
				}
			}

			return routeQuery;

		},

		headers() {

			const sortableFields = [
				"RECORD_NUMBER",
				// "STATUS",
				"SINGLE_LINE_TEXT",
				// "RICH_TEXT",
				"MULTI_LINE_TEXT",
				"NUMBER",
				"CALC",
				"RADIO_BUTTON",
				"DROP_DOWN",
				"DATE",
				"TIME",
				"LINK",
				"DATETIME",
				"UPDATED_TIME",
				"CREATED_TIME",
				"MODIFIER",
				"CREATOR"
			];

			const headers = this.selectedFields.map(({ code, label, type }) => {
				return {
					code, type, label,
					text: label,
					value: code,
					sortable: sortableFields.indexOf(type) > -1,
					align: 'left'
				}
			});

			headers.unshift({
				text: '',
				sortable: false,
				align: 'left'
			});

			return headers;

		},

	},
	watch: {

		deleteMode() {
			this.selected = [];
		},

		routeQuery() {
			const { routeQuery } = this;
			const { path } = this.$route;
			this.$router.replace({ path, query: routeQuery });
		},

		pagination: {
			async handler() {

				this.loading = true;

				await this.getRecords();

				this.loading = false;

			},
			deep: true
		}

	},
	methods: {

		async deleteRecords() {

			let ids = this.selected.map(({ $id }) => $id.value);

			if (ids.length === 0) {
				this.deleteMode = false;
				return;
			}

			this.loading = true;

			await kintone.api('/k/v1/records', 'DELETE', {
				app: this.appId,
				ids
			});

			await this.getRecords();

			this.loading = false;

			this.deleteMode = false;

		},

		onResize() {
			this.windowSize = { width: window.innerWidth, height: window.innerHeight };
		},

		toValueString({ value, type }) {

			switch (type) {
				// case 'RECORD_NUMBER':
				// case 'STATUS':
				// case 'SINGLE_LINE_TEXT':
				// case 'RICH_TEXT':
				// case 'MULTI_LINE_TEXT':
				// case 'NUMBER':
				// case 'CALC':
				// case 'RADIO_BUTTON':
				// case 'DROP_DOWN':
				// case 'DATE':
				// case 'TIME':
				// case 'LINK':
				case 'DATETIME':
				case 'UPDATED_TIME':
				case 'CREATED_TIME':
					return moment(value).format('YYYY-MM-DD HH:mm:ss');
				case 'MODIFIER':
				case 'CREATOR':
					return value.name;
				case 'CHECK_BOX':
				case 'MULTI_SELECT':
					return value.join('\n');
				case 'USER_SELECT':
				case 'GROUP_SELECT':
				case 'ORGANIZATION_SELECT':
					return value.map(({ name }) => name).join('\n');
				default:
					return value;
			}

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

			let displayFields = (this.$route.query.displayFields || this.defaultFields || '').split(',');

			this.fields = fields;
			this.selectedFields = displayFields
				.map((displayField) => fields.find(({ code }) => code === displayField))
				.filter((n) => n);

		},

		async getRecords() {

			const { queryCondition } = this;
			const { sortBy, descending, page, rowsPerPage } = this.pagination;

			let { records, totalCount } = await kintone.api('/k/v1/records', 'GET', {
				app: this.appId,
				query: `
                    ${queryCondition || ''}
                    ${sortBy ? `order by ${sortBy} ${descending ? 'desc' : 'asc'}` : ''}
                    limit ${rowsPerPage}
                    offset ${(page - 1) * rowsPerPage}   
                `,
				totalCount: true
			});

			const ids = records.map(({ $id }) => $id.value);

			let { rights } = ids.length > 0 ? await kintone.api('/k/v1/records/acl/evaluate', 'GET', {
				app: this.appId,
				ids
			}) : { rights: [] };

			this.totalItems = Number(totalCount);
			this.records = records;
			this.rights = rights;

		}
	},
	mounted() {

		this.loading = true;

		// get app info
		this.appId = kintone.app.getId();
		this.queryCondition = kintone.app.getQueryCondition();

		// parse query
		const { rowsPerPage, page, sortBy, descending } = this.$route.query;

		this.pagination.rowsPerPage = Number(rowsPerPage || 20);
		this.pagination.page = Number(page || 1);
		this.pagination.sortBy = sortBy;
		this.pagination.descending = descending == null ? null : descending === 'true';

		this.onResize();

		this.getFields();
		this.getRecords();

		this.loading = false;

	}
}
</script>

<style lang="scss">
.kintone-customize {
	.ghost {
		opacity: 0.5;
		background: #b3d4fc;
	}

	.table-dense {
		table.v-table tbody td,
		table.v-table tbody th {
			height: 32px;
		}
		table.v-table thead tr {
			height: 28px;
		}
	}

	.table-header,
	.table-body,
	.table-dense {
		table.v-table thead td:not(:nth-child(1)),
		table.v-table tbody td:not(:nth-child(1)),
		table.v-table thead th:not(:nth-child(1)),
		table.v-table tbody th:not(:nth-child(1)),
		table.v-table thead td:first-child,
		table.v-table tbody td:first-child,
		table.v-table thead th:first-child,
		table.v-table tbody th:first-child {
			padding: 0 8px;
			border-left: 1px solid rgba(0, 0, 0, 0.12);
			white-space: pre;
			max-width: 240px;
			text-overflow: ellipsis;
			overflow: hidden;
		}
	}

	#table {
		overflow-y: scroll;

		tbody tr.active,
		tbody tr.active:hover {
			background: rgba(179, 212, 252, 0.4);
		}
	}
}
</style>
