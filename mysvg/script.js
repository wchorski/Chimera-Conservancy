// targeting the svg itself
const svg = document.querySelector("svg");

// // variable for the namespace 
const svgns = "http://www.w3.org/2000/svg";

// // make a simple rectangle
// let newRect = document.createElementNS(svgns, "rect");

// newRect.setAttribute("x", "150");
// newRect.setAttribute("y", "150");
// newRect.setAttribute("width", "100");
// newRect.setAttribute("height", "100");
// newRect.setAttribute("fill", "#5cceee");

// // append the new rectangle to the svg
// svg.appendChild(newRect);

// Method 2: More direct approach using DOMParser
async function loadCircleSVGWithParser() {
	try {
		// const response = await fetch("./public/clown-face-copy.svg")
		const response = await fetch("./blue-rect.svg")
		const svgText = await response.text()
    console.log(svgText);

		// Parse the SVG content
		const parser = new DOMParser()
		const svgDoc = parser.parseFromString(svgText, "image/svg+xml")

		// Get the <g> element
		const gElement = svgDoc.querySelector("g")

		// Get the existing SVG element
		const svg = document.getElementById("svg-element")

		if (gElement && svg) {
			// Import and append the node to the existing SVG
			const importedNode = document.importNode(gElement, true)
			svg.appendChild(importedNode)
		}

	} catch (error) {
		console.error("Error loading SVG:", error)
	}
}
loadCircleSVGWithParser()