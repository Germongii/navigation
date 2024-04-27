import {Graph} from './Graph.js';
import {PlanHandler} from './PlanHandler.js'
import {Settings} from './Settings.js'
import {Way} from './Way.js'
import {DragHandler} from "./DragHandler.js";
import {Names} from "./Names.js";
import {LiveGraph} from "./LiveGraph.js"

//обработчик карты, передаем объект содержащий карту
export let planHandler = new PlanHandler(document.querySelector('.plan-object'))
planHandler.$planObject.data = Settings.planName
planHandler.setSelectorElements(document.querySelector('.selector'),
	document.querySelector('.button-from'),
	document.querySelector('.button-to'))

let isGraphLoaded = false
export let graph = new Graph(document.querySelector('.graph'), Settings.planName)
graph.$graphObject.data = Settings.graphName
graph.$graphObject.addEventListener('load', () => { //при загрузке плана
	console.log('граф загружен', Date.now())
	isGraphLoaded = true
	processGraphAndPlan()
})

let isPlanLoaded = false
export let dragHandler
planHandler.$planObject.addEventListener('load', () => { //при загрузке плана
	console.log('план загружен', Date.now())
	isPlanLoaded = true
	processGraphAndPlan()
})

dragHandler = new DragHandler(
	document.querySelector('.drag-able'),
	document.querySelector('.scale-able'),
	document.querySelector('.map-wrapper'),
	document.querySelector('.button-plus'),
	document.querySelector('.button-minus'));

function processGraphAndPlan() {
	if (isGraphLoaded && isPlanLoaded) {
		planHandler.onPlanLoad()
		way.setupWay(planHandler.$svgPlan)
		
		//Процесс трассировки и заполнения графа
		graph.tracing($tableOfEdge)
		graph.createVertexesList()
		graph.fillGraph()
		graph.tracingCross()
		graph.fillAuditoriumsVertexes(planHandler.AuditoriumsIdEntrancesId, planHandler.$svgPlan)
		graph.defineVertexesTypes()
		graph.makeNeighboringIDsAsArray()
	}
}

export let way = new Way(document.querySelector('.svg-way'),)


let $tableOfEdge = document.getElementsByClassName('list-of-edges')[0]

export function activateButton(buttonClassName) {
	document.getElementsByClassName(buttonClassName)[0].classList.remove('non-active-button')
}

export function deactivateButton(buttonClassName) {
	document.getElementsByClassName(buttonClassName)[0].classList.add('non-active-button')
}

document.querySelector('.show-graph').addEventListener('click', () => {
	graph.showGraph(document.querySelector('.graph-markers'), planHandler.$svgPlan)
	graph.$graphObject.style.visibility = 'visible'
	deactivateButton('show-graph')
	activateButton('get-way')
})

document.querySelector('.get-way').addEventListener('click', () => {
	let idVertex1 = document.getElementById('input-idPoint1').value
	let idVertex2 = document.getElementById('input-idPoint2').value
	
	let wayAndDistance = graph.getShortestWayFromTo(idVertex1, idVertex2)
	
	let outputContent = ''
	wayAndDistance.way.forEach(vertexId => {
		outputContent += `→ ${vertexId} `
	})
	outputContent = outputContent.substring(2)
	outputContent += `<br>Длина: ${wayAndDistance.distance}`
	
	let $output = document.getElementsByClassName('output-found-way')[0]
	$output.innerHTML = outputContent
	
	
})

document.querySelector('.build-way').addEventListener('click', () => {
	let idVertex1 = planHandler.fromId
	let idVertex2 = planHandler.toId
	let wayAndDistance = graph.getShortestWayFromTo(idVertex1, idVertex2)
	let outputContent = ''
	wayAndDistance.way.forEach(vertexId => {
		outputContent += `→ ${vertexId} `
	})
	outputContent = outputContent.substring(2)
	outputContent += `<br>Длина: ${wayAndDistance.distance}`
	
	let $output = document.getElementsByClassName('output-way-between-au')[0]
	$output.innerHTML = outputContent
	way.build(graph, wayAndDistance)
	
})

document.querySelector('.assign-type').addEventListener('click',() =>{
	let vertexId = graph.getVertexByID(document.getElementById('input-idPointType').value)
	vertexId.type = document.getElementById('input-type').value
	console.log(graph.vertexes)
})

document.querySelector('.map-wrapper').onwheel = function() {
	return false
}

export function bindingEntrancesOnClick(e) {
	planHandler.onBindingMode()
}

let liveGraph
export function createLiveGraph() {
	liveGraph = new LiveGraph(document.querySelector('.drag-able'), planHandler)
	window.liveGraph = liveGraph
}

export function downloadGraph() {
	liveGraph.downloadLiveGraph()
}
window.downloadGraph = downloadGraph

setTimeout(() => {
	document.querySelector('.create-live-graph').click()
}, 300)