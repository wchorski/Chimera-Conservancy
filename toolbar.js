const inputColorTop = document.getElementById("colorpicker-top")
const inputColorBottom = document.getElementById("colorpicker-bottom")
const inputBrowTransformY = document.getElementById("brow-transform-y")
const inputBrowTransformX = document.getElementById("brow-transform-x")
const inputBrowScale = document.getElementById("brow-scale")
const inputBrowRotate = document.getElementById("brow-transform-rotate")

function main() {
	inputColorTop.addEventListener("input", (e) => {
		document.documentElement.style.setProperty("--c-top", e.target.value)
	})
	inputColorBottom.addEventListener("input", (e) => {
		document.documentElement.style.setProperty("--c-bottom", e.target.value)
	})
	inputBrowTransformY.addEventListener("input", (e) => {
		document.documentElement.style.setProperty(
			"--brow-y-offset",
			`${(e.target.value * 28)}px`
		)
	})
	inputBrowTransformX.addEventListener("input", (e) => {
		document.documentElement.style.setProperty(
			"--brow-x-offset",
			`${(e.target.value * 20)}px`
		)
	})
	inputBrowScale.addEventListener("input", (e) => {
		document.documentElement.style.setProperty(
			"--brow-scale",
			`${(e.target.value * 1.3)}`
		)
	})
	inputBrowRotate.addEventListener("input", (e) => {
		document.documentElement.style.setProperty(
			"--brow-rotation",
			`${(e.target.value * 180)}deg`
		)
	})
}

main()
