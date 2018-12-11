<template>
	<div>
		<v-dialog v-model="dialog" max-width="800px">
			<v-card>
				<v-card-title>
					<span class="headline">フィールド選択</span>
				</v-card-title>
				<v-card-text>
					<v-layout>
						<v-flex xs6 ma-2>
							<v-subheader>フィールドを選択</v-subheader>
							<v-list :style="{height: '400px', overflow:'auto', border:'1px solid rgba(0, 0, 0, 0.12)',}">
								<draggable v-model="sourceFields" :options="dragOptions">
									<transition-group type="transition" class="list-group" tag="div">
										<v-list-tile
											v-for="(field, index) in sourceFields"
											:key="field.code"
											:style="{
                                                border:'1px solid rgba(0, 0, 0, 0.12)',
                                                cursor:'move'
                                            }"
										>
											<v-list-tile-avatar>
												<v-icon>zoom_out_map</v-icon>
											</v-list-tile-avatar>
											<v-list-tile-content>
												<v-list-tile-title>{{ field.label }}</v-list-tile-title>
												<v-list-tile-sub-title>{{ field.code }}</v-list-tile-sub-title>
											</v-list-tile-content>
										</v-list-tile>
									</transition-group>
								</draggable>
							</v-list>
						</v-flex>
						<v-icon>arrow_right</v-icon>
						<v-flex xs6 ma-2>
							<v-subheader>並び替え</v-subheader>
							<v-list :style="{height: '400px', overflow:'auto', border:'1px solid rgba(0, 0, 0, 0.12)',}">
								<draggable v-model="selected" :options="dragOptions">
									<transition-group type="transition" class="list-group" tag="div">
										<v-list-tile
											v-for="(field, index) in selected"
											:key="field.code"
											:style="{
                                                border:'1px solid rgba(0, 0, 0, 0.12)',
                                                cursor:'move'
                                            }"
										>
											<v-list-tile-avatar>
												<v-icon>unfold_more</v-icon>
											</v-list-tile-avatar>
											<v-list-tile-content>
												<v-list-tile-title>{{ field.label }}</v-list-tile-title>
												<v-list-tile-sub-title>{{ field.code }}</v-list-tile-sub-title>
											</v-list-tile-content>
											<v-list-tile-action>
												<v-btn icon ripple @click="selected.splice(index, 1)">
													<v-icon color="grey">clear</v-icon>
												</v-btn>
											</v-list-tile-action>
										</v-list-tile>
									</transition-group>
								</draggable>
							</v-list>
						</v-flex>
					</v-layout>
				</v-card-text>
				<v-card-actions>
					<v-spacer></v-spacer>
					<v-btn color="primary" flat @click="dialog = false">閉じる</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</div>
</template>

<script>
import draggable from 'vuedraggable';

export default {
	props: [
		'fields',
		'selectedFields',
		'value'
	],
	components: {
		draggable
	},
	data() {
		return {
			// field select
			dialog: false,
			// fields: null
			selected: [],
		}
	},
	computed: {

		sourceFields: {
			get() {

				if (this.fields) {
					return this.fields.filter(({ code }) => this.selected.findIndex((f) => code === f.code) === -1);
				}

				return [];

			},
			set(val) { }
		},

		dragOptions() {
			return {
				animation: 0,
				group: 'description',
				disabled: false,
				ghostClass: 'ghost'
			};
		}

	},
	watch: {
		value(val) {
			this.dialog = val;
		},
		dialog(val) {
			this.$emit('input', val);
		},
		selected(val) {
			this.$emit('update:selectedFields', val);
		},
		selectedFields(val) {
			this.selected = val;
		}
	},
	methods: {

	},
	mounted() {
		this.selected = this.selectedFields;
	}
}
</script>

<style lang="scss">
html .kintone-customize .v-list {
	padding: 0;
}

.list-group {
	min-height: 398px;
}
</style>