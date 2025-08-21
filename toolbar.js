const inputColorTop = document.getElementById("colorpicker-top")
const inputColorBottom = document.getElementById("colorpicker-bottom")

const inputBrowTransformY = document.getElementById("brow-transform-y")
const inputBrowTransformX = document.getElementById("brow-transform-x")
const inputBrowScale = document.getElementById("brow-scale")
const inputBrowRotate = document.getElementById("brow-transform-rotate")

const inputEyeTransformY = document.getElementById("eye-transform-y")
const inputEyeTransformX = document.getElementById("eye-transform-x")
const inputEyeScale = document.getElementById("eye-scale")
const inputEyeRotate = document.getElementById("eye-transform-rotate")

const inputMouthTransformY = document.getElementById("mouth-transform-y")
const inputMouthTransformX = document.getElementById("mouth-transform-x")
const inputMouthScale = document.getElementById("mouth-scale")
const inputMouthRotate = document.getElementById("mouth-transform-rotate")

const inputName = document.getElementById("inputfield-name")

// TODO can i make one big event listener or maybe per section?
function main() {
  //? name
  inputName?.addEventListener("input", (e) => {
    window.faceSVG.querySelector("title").textContent = e.currentTarget?.value || "My Emoji Creation"
  })
  
  //? colors
	inputColorTop?.addEventListener("input", (e) => {
		window.faceSVG.style.setProperty("--c-top", e.target?.value)
	})
	inputColorBottom?.addEventListener("input", (e) => {
		window.faceSVG.style.setProperty("--c-bottom", e.target?.value)
	})
  //? Brows
	inputBrowTransformY?.addEventListener("input", (e) => {
		window.faceSVG.style.setProperty(
			"--brow-y-offset",
			`${(e.target.value * 28)}px`
		)
	})
	inputBrowTransformX?.addEventListener("input", (e) => {
		window.faceSVG.style.setProperty(
			"--brow-x-offset",
			`${(e.target.value * 20)}px`
		)
	})
	inputBrowScale?.addEventListener("input", (e) => {
		window.faceSVG.style.setProperty(
			"--brow-scale",
			`${(e.target.value * 1.3)}`
		)
	})
	inputBrowRotate?.addEventListener("input", (e) => {
		window.faceSVG.style.setProperty(
			"--brow-rotation",
			`${(e.target.value * 180)}deg`
		)
	})

  //? Eyes
	inputEyeTransformY?.addEventListener("input", (e) => {
		window.faceSVG.style.setProperty(
			"--eye-y-offset",
			`${(e.target.value * 28)}px`
		)
	})
	inputEyeTransformX.addEventListener("input", (e) => {
		window.faceSVG.style.setProperty(
			"--eye-x-offset",
			`${(e.target.value * 20)}px`
		)
	})
	inputEyeScale.addEventListener("input", (e) => {
		window.faceSVG.style.setProperty(
			"--eye-scale",
			`${(e.target.value * 1.3)}`
		)
	})
	inputEyeRotate.addEventListener("input", (e) => {
		window.faceSVG.style.setProperty(
			"--eye-rotation",
			`${(e.target.value * 180)}deg`
		)
	})

  //? mouth
	inputMouthTransformY.addEventListener("input", (e) => {
		window.faceSVG.style.setProperty(
			"--mouth-y-offset",
			`${(e.target.value * 28)}px`
		)
	})
	inputMouthTransformX.addEventListener("input", (e) => {
		window.faceSVG.style.setProperty(
			"--mouth-x-offset",
			`${(e.target.value * 20)}px`
		)
	})
	inputMouthScale.addEventListener("input", (e) => {
		window.faceSVG.style.setProperty(
			"--mouth-scale",
			`${(e.target.value * 1.3)}`
		)
	})
	inputMouthRotate.addEventListener("input", (e) => {
		window.faceSVG.style.setProperty(
			"--mouth-rotation",
			`${(e.target.value * 180)}deg`
		)
	})
}

main()
