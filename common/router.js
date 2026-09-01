export function safeJump(url) {
	const pages = getCurrentPages()
	const opt = {
		url,
		fail: e => console.error('跳转失败', e)
	}
	if (pages.length >= 9) {
		uni.redirectTo(opt)
	} else {
		uni.navigateTo(opt)
	}
}
