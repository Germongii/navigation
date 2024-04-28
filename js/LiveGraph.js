import {calculateLineSegment, compare, segmentBetween12SegAnd3Point} from './functions_LiveGraph.js'

let Modes = {
	None: 'None',
	HallwayLine: 'HallwayLine',
	ConnectEntrancesToLine: 'ConnectEntrancesToLine',
	Trim: 'Trim',
	SplitSegment: 'SplitSegment'
}
window.Modes = Modes

export class LiveGraph {
	liveGraphSvg
	segments = []
	mode = Modes.None
	modeData = null
	form
	planName
	planHandler
	
	constructor(dragAble, planHandler) {
		document.querySelector('.create-live-graph').classList.add('non-active-button')
		
		let removingClasses = ['select-type', 'binding-entrances', 'show-graph', 'select-points', 'selector-auditoriums']
		for (const removingClass of removingClasses) {
			document.querySelector(`.${removingClass}`).remove()
		}
		
		this.planHandler = planHandler
		
		let liveGraphObject = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
		dragAble.prepend(liveGraphObject)
		liveGraphObject.outerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${planHandler.$svgPlan.getAttribute('viewBox')}" fill="none" class="live-graph">
		<g id="A-1">
		
		</g>
		</svg>`
		this.liveGraphSvg = document.querySelector('.live-graph')
		
		this.planName = planHandler.planName
		
		let outerHTML = planHandler.$svgPlan.outerHTML
		planHandler.$svgPlan.outerHTML = '<svg class="plan"></svg>'
		planHandler.$svgPlan = document.querySelector('.plan')
		planHandler.$svgPlan.outerHTML = outerHTML
		planHandler.$svgPlan = document.querySelector('.plan')
		
		for (const circle of planHandler.$svgPlan.querySelectorAll('#Entrances circle')) {
			circle.classList.replace('entrance', 'live-entrance')
			circle.addEventListener('click', ev => this.onCircleClick(ev))
		}
		
		this.form = document.querySelector('.modes-form')
		this.form.style.display = 'block'
		
		// this.addSegment(100, 100, 500, 500)
		
		// this.addSegment(1363, - 2427, 2197, 4524)
		// this.addSegment(0,0, 100, 100)
		
		this.render()
		this.setMode(Modes.None)
		// this.setMode(Modes.ConnectEntrancesToLine)
		// this.onPathClick({target: document.getElementById('path_1363_-2427_2197_4524')})
		// this.onCircleClick({target: document.getElementById('23')})
		// this.onCircleClick({target: document.getElementById('27')})
		// this.onCircleClick({target: document.getElementById('25')})
		// this.onCircleClick({target: document.getElementById('35')})
		// this.setMode(Modes.Trim)
	}
	
	downloadLiveGraph() {
		let link = document.createElement('a')
		link.download = `${this.planName}-GRAPH.svg`
		
		const file = new Blob([this.liveGraphSvg.outerHTML], {type: 'text/svg'})
		
		link.href = URL.createObjectURL(file)
		
		link.click()
		
		URL.revokeObjectURL(link.href)
	}
	
	render() {
		console.log('Рендерю')
		this.liveGraphSvg.innerHTML = `
			<defs>
				<marker fill="none" id="end-point" refX=".5" refY=".5" viewBox="0 0 1 1">
					<circle fill="#ffffff" fill-opacity=".5" cx=".5" cy=".5" r=".15"></circle>
				</marker>
			</defs>
		`
		for (const segment of this.segments) {
			let pathOuterHTML = `
			<path xmlns="http://www.w3.org/2000/svg"
				id="${segment.id}"
				d="M${segment.x1} ${segment.y1}L${segment.x2} ${segment.y2}"
				stroke="#FF5F5F" stroke-opacity="0.6" stroke-width="6"
				marker-start="url(#end-point)" marker-end="url(#end-point)"
			/>
			`
			this.liveGraphSvg.insertAdjacentHTML('afterbegin', pathOuterHTML)
			this.liveGraphSvg.getElementById(segment.id).addEventListener('click', ev => this.onPathClick(ev))
		}
	}
	
	addSegment(x1, y1, x2, y2) {
		let segment = new Segment(x1, y1, x2, y2)
		this.segments.push(segment)
	}
	
	getSegmentData(id) {
		return this.segments.find(segment => segment.id === id)
	}
	
	// removeSegment(x1, y1, x2, y2) {
	// 	let segmentIndex = this.segments.findIndex(s => s.x1 === x1 && s.y1 === y1 && s.x2 === x2 && s.y2 === y2)
	// 	this.segments.splice(segmentIndex, 1)
	// }
	removeSegment(segment) {
		let segmentIndex = this.segments.findIndex(s => s === segment)
		this.segments.splice(segmentIndex, 1)
	}
	
	setMode(mode) {
		if (this.mode === Modes.ConnectEntrancesToLine) {
			if (this.modeData.selectedPathId !== null) {
				let points = this.getSegmentData(this.modeData.selectedPathId).points
				this.removeSegment(this.getSegmentData(this.modeData.selectedPathId))
				console.log(points)
				for (let i = 0; i < points.length - 1; i ++) {
					this.addSegment(points[i].x, points[i].y, points[i + 1].x, points[i + 1].y)
				}
			}
		}
		
		this.form.elements.modes.value = mode
		this.mode = mode
		this.modeData = null
		for (const element of planHandler.$svgPlan.querySelectorAll('*')) {
			element.classList.remove('selected')
		}
		this.render()
		
		
		if (this.mode === Modes.HallwayLine) {
			this.modeData = {
				p1: null,
				p2: null,
				p3: null
			}
		}
		
		if (this.mode === Modes.ConnectEntrancesToLine) {
			this.modeData = {
				selectedPathId: null
			}
		}
		if (this.mode === Modes.Trim) {
			this.modeData = {}
		}
		if(this.mode === Modes.SplitSegment){
			this.modeData = {}
		}
	}
	
	onPathClick(e) {
		let segment = this.getSegmentData(e.target.id)
		if(this.mode === Modes.SplitSegment){
			let scaleAbleWidth = document.querySelector('.scale-able').clientWidth
			let viewBoxWidth = this.liveGraphSvg.viewBox.baseVal.width
			let k =  viewBoxWidth / (scaleAbleWidth - 1)
			let clickCoordinates = new Point(
				Math.round(e.offsetX * k),
				Math.round(e.offsetY * k)
			)
			let nearestPoint = segmentBetween12SegAnd3Point(
				{x: segment.x1, y: segment.y1},
				{x: segment.x2, y: segment.y2},
					clickCoordinates
			)
			let middlePoint = new Point(nearestPoint.x2, nearestPoint.y2)
			this.addSegment(segment.x1, segment.y1, middlePoint.x, middlePoint.y)
			this.addSegment(segment.x2, segment.y2, middlePoint.x, middlePoint.y)
			this.removeSegment(segment)
			console.log(clickCoordinates, middlePoint)
			this.render()
		}
		if (this.mode === Modes.ConnectEntrancesToLine) {
			if (this.modeData.selectedPathId !== null) {
				this.setMode(Modes.ConnectEntrancesToLine)
			}
			this.liveGraphSvg.getElementById(e.target.id).classList.add('selected')
			this.modeData.selectedPathId = e.target.id
		}
		if (this.mode === Modes.Trim) {
			this.removeSegment(this.getSegmentData(e.target.id))
			this.render()
			let scaleAbleWidth = document.querySelector('.scale-able').clientWidth
			let viewBoxWidth = this.liveGraphSvg.viewBox.baseVal.width
			let k =  viewBoxWidth / (scaleAbleWidth - 1)
			let clickCoordinates = new Point(
				Math.round(e.offsetX * k),
				Math.round(e.offsetY * k)
			)
			// function getIndexNearestPoint(originPoint, points){
			// 	let minDistance = Infinity
			// 	let minIndex = -1
			// 	for(let point of points){
			// 		let distance = ((point.x-originPoint.x)**2 + (point.y-originPoint.y)**2)**0.5
			// 		if(distance<minDistance) {
			// 			minDistance = distance
			// 			minIndex = points.indexOf(point)
			// 		}
			// 	}
			// 	return minIndex
			// }
			//
			// let segment = this.getSegmentData(e.target.id)
			// let nearestPointIndex = getIndexNearestPoint(
			// 	clickCoordinates,
			// 	segment.points
			// )
			// function isFirstPointLarge(point1, point2) {
			// 	if(point1.x > point2.x)
			// 		return true
			// 	else return point1.y > point2.y;
			// }
			// let isLarge = isFirstPointLarge(segment.points[nearestPointIndex], clickCoordinates)
			// if(isLarge) {
			// 	this.addSegment(
			// 		segment.points[nearestPointIndex].x,
			// 		segment.points[nearestPointIndex].y,
			// 		segment.points[nearestPointIndex - 1].x,
			// 		segment.points[nearestPointIndex - 1].y,
			// 	)
			// }
			// else {
			// 	this.addSegment(
			// 		segment.points[nearestPointIndex].x,
			// 		segment.points[nearestPointIndex].y,
			// 		segment.points[nearestPointIndex + 1].x,
			// 		segment.points[nearestPointIndex + 1].y,
			// 	)
			// }
			// this.render()
		}
	}
	
	onCircleClick(e) {
		if (this.mode === Modes.None)
			return
		
		let circle = e.target
		let cx = Number(circle.getAttribute('cx'))
		let cy = Number(circle.getAttribute('cy'))
		
		if (this.mode === Modes.HallwayLine) {
			e.target.classList.add('selected')
			if (!this.modeData.p1)
				this.modeData.p1 = {x: cx, y: cy}
			else if (!this.modeData.p2)
				this.modeData.p2 = {x: cx, y: cy}
			else {
				this.modeData.p3 = {x: cx, y: cy}
				let hallwaySegmentCoordinates = calculateLineSegment(this.modeData)
				let {x1, y1, x2, y2} = hallwaySegmentCoordinates
				this.addSegment(x1, y1, x2, y2)
				this.render()
				this.setMode(Modes.HallwayLine)
			}
		}
		
		else if (this.mode === Modes.ConnectEntrancesToLine) {
			if (this.modeData.selectedPathId === null)
				return
			let p3 = {x: cx, y: cy}
			let segment1to2 = this.getSegmentData(this.modeData.selectedPathId)
			let p1 = {x: segment1to2.x1, y: segment1to2.y1}
			let p2 = {x: segment1to2.x2, y: segment1to2.y2}
			let addingSegment = segmentBetween12SegAnd3Point(p1, p2, p3)
			this.addSegment(addingSegment.x1, addingSegment.y1, addingSegment.x2, addingSegment.y2)
			// this.addSegment(addingSegment.x2, addingSegment.y2, segment1to2.x1, segment1to2.y1)
			// this.addSegment(addingSegment.x2, addingSegment.y2, segment1to2.x2, segment1to2.y2)
			// this.removeSegment(segment1to2)
			segment1to2.addPoints(addingSegment.x2, addingSegment.y2)
			console.log(segment1to2)
			this.render()
			this.liveGraphSvg.getElementById(segment1to2.id).classList.add('selected')
		}
	}
}

class Segment {
	id
	x1
	y1
	x2
	y2
	points
	
	constructor(x1, y1, x2, y2) {
		this.id = `path_${x1}_${y1}_${x2}_${y2}`
		this.x1 = x1
		this.y1 = y1
		this.x2 = x2
		this.y2 = y2
		this.points = []
		// this.points = [new Point(x1,y1), new Point(x2,y2)]
		this.addPoints(x1, y1)
		this.addPoints(x2, y2)
	}
	
	addPoints(x, y) {
		this.points.push(new Point(x, y))
		this.points.sort(compare('x'))
		this.points.sort(compare('y'))
	}
}

class Point {
	x
	y
	
	constructor(x, y) {
		this.x = x
		this.y = y
	}
}
