<template>
	<u-popup
		:show="show"
		:mode="mode"
		:round="round"
		:zIndex="zIndex"
		:safeAreaInsetBottom="safeAreaInsetBottom"
		:closeOnClickOverlay="closeOnClickOverlay"
		:closeable="closeable"
		@close="$emit('close')"
	>
		<slot></slot>
	</u-popup>
</template>

<script>
export default {
	name: 'CaregiverPopup',
	props: {
		show: {
			type: Boolean,
			default: false
		},
		mode: {
			type: String,
			default: 'bottom'
		},
		round: {
			type: [Number, String],
			default: 24
		},
		zIndex: {
			type: [Number, String],
			default: 10080
		},
		safeAreaInsetBottom: {
			type: Boolean,
			default: true
		},
		closeOnClickOverlay: {
			type: Boolean,
			default: true
		},
		closeable: {
			type: Boolean,
			default: false
		}
	}
}
</script>
