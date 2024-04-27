import {Settings} from './Settings.js'
import {activateButton, deactivateButton} from './app.js'

export class PlanHandler {
	$planObject
	$svgPlan
	auditoriums = new Map() //map ид-аудитории: dom-элемент аудитории
	entrances = new Map() //map ид-входа: dom-элемент входа
	AuditoriumsIdEntrancesId = new Map() //ассоциация айдишников аудиторий и входов
	$selector //элемент выбора аудиторий старта и финиша
	$fromInput //текстовое поле "откуда"
	$toInput  //текстовое поле "куда"
	$bFrom //кнопка "отсюда"
	$bTo //кнопка "сюда"
	currentAuId //
	fromId
	toId
	planName
	
	constructor($planObject) {
		this.$planObject = $planObject //объект отображения плана
		// this.$planWrapper = $mapObject.parentElement //внешний контейнер с картами
	}
	
	onPlanLoad() { //при загрузки плана
		//Удаление старого плана и перемещение svg загруженного плана в map-objects
		let $planDocument = this.$planObject.contentDocument //получаем документа плана внутри <object>
		this.$svgPlan = $planDocument.documentElement.cloneNode(true)//получаем корневой элемент svg
		for (const $oldPlan of document.querySelectorAll('.plan'))
			$oldPlan.remove() //удаляем старый план
		this.$svgPlan.removeAttribute('width')
		this.$svgPlan.removeAttribute('height')
		this.$svgPlan.classList.add('plan')
		this.$planObject.before(this.$svgPlan) //вставляем в map-objects загруженный план
		$planDocument.documentElement.remove() //удаляем всё из документа <object>
		this.planName = this.$svgPlan.querySelector('g').getAttribute('id')
		
		// this.$svgPlan.parentElement.style.transform = `translateY(${Math.floor(wrapperHeight - height)/2}px)`
		
		// let test = document.createElement('div')
		// test.classList.add("hello")
		
		
		// let linkXmlToStylesheet = document.createElement('style') //тэг для задания стиля в свг
		// linkXmlToStylesheet.innerHTML = `@import url(${Settings.planStyleLink});`
		// //
		// this.$svgPlan.prepend(linkXmlToStylesheet)
		// // console.log()
		
		// setTimeout(function () {
		//     this.$planObject.style = 'visibility: visible'
		// }.bind(this), 20)
		
		// let planElements = this.$svgPlan.getElementsByTagName('*') //все элементы документа плана
		// for (const $el of planElements) { //если элемент это аудитория - добавляем в аудитории
		//     if ($el.tagName === 'circle' //если элемент - вход - добавляем в входы
		//         && Settings.entrancesColors.includes($el.getAttribute('fill'))) {
		//         this.entrances.set($el.id, $el)
		//         $el.classList.add('entrance') //и добавляем соответствующий класс для
		//         $el.setAttribute('fill-opacity', '0')
		//     } else if (Settings.auditoriumsColors.includes($el.getAttribute('fill'))) {
		//         this.auditoriums.set($el.id, $el)
		//         $el.classList.add('auditorium') //и добавляем аудитории соответствующий класс, для подсветки
		//     }
		// }
		console.log(this.$svgPlan.getElementById('Spaces'))
		console.groupCollapsed('Помещения')
		for (let $space of this.$svgPlan.getElementById('Spaces').children) {
			if ($space.id.at(0) === '!')
				continue
			
			this.auditoriums.set($space.id, $space)
			if ($space.getAttribute('fill') === Settings.auditoriumColor)
				$space.classList.add('auditorium') //и добавляем аудитории соответствующий класс, для подсветки
			else {
				$space.classList.add('other-space') //и добавляем аудитории соответствующий класс, для подсветки
				$space.removeAttribute('opacity')
			}
			console.log($space)
		}
		console.groupEnd()
		console.groupCollapsed('Входы')
		for (let $entrance of this.$svgPlan.getElementById('Entrances').children) {
			this.entrances.set($entrance.id, $entrance)
			$entrance.classList.add('entrance') //и добавляем соответствующий класс для
			console.log($entrance)
		}
		console.groupEnd()
		
		function isEntranceOfAuditorium($entrance, $auditorium) {
			let cx = Number($entrance.getAttribute('cx'))
			let cy = Number($entrance.getAttribute('cy'))
			let x = Number($auditorium.getAttribute('x'))
			let y = Number($auditorium.getAttribute('y'))
			let width = Number($auditorium.getAttribute('width'))
			let height = Number($auditorium.getAttribute('height'))
			return (cx >= x && cx <= x + width && cy >= y && cy <= y + height)
		}
		
		for (const [auditoriumId, $auditorium] of this.auditoriums) {
			if (Settings.auditoriumsEntrances.get(auditoriumId) !== undefined) {
				this.AuditoriumsIdEntrancesId.set(auditoriumId, Settings.auditoriumsEntrances.get(auditoriumId))
			}
			else {
				for (const [entranceId, $entrance] of this.entrances) {
					if (isEntranceOfAuditorium($entrance, $auditorium)) {
						this.AuditoriumsIdEntrancesId.set(auditoriumId, entranceId)
					}
				}
			}
		}
		console.log(this.AuditoriumsIdEntrancesId)
		
		for (const [auId, $au] of this.auditoriums) { //для каждой аудитории поставить слушатель клика
			$au.addEventListener('click', event => this.onAuditoriumClicked(auId, event))
		}
	}
	
	setSelectorElements($selector, $bFrom, $bTo) {
		this.$selector = $selector
		this.$selector.setAttribute('auID', '')
		this.$bFrom = $bFrom
		this.$bTo = $bTo
		this.$bFrom.addEventListener('mousedown', () => this.onBFromClicked())
		this.$bTo.addEventListener('mousedown', () => this.onBToClicked())
		
		this.$fromInput = document.querySelector('#input-from')
		this.$toInput = document.querySelector('#input-to')
		console.log(this.$bFrom, this.$bTo)
	}
	
	flipFromTo() {
		let tInputValue = this.$fromInput.value
		this.$fromInput.value = this.$toInput.value
		this.$toInput.value = tInputValue
		
		let tId = this.fromId
		this.fromId = this.toId
		this.toId = tId
	}
	
	onBFromClicked() {
		if (this.$toInput.value === Settings.auditoriumsRusNames.get(this.currentAuId)) {
			this.flipFromTo()
		}
		else {
			this.$fromInput.value = Settings.auditoriumsRusNames.get(this.currentAuId)
			this.fromId = this.currentAuId
		}
		this.onAuditoriumClicked(this.currentAuId, null)
		if (this.fromId !== undefined && this.toId !== undefined) {
			document.querySelector('.build-way').click()
		}
	}
	
	onBToClicked() {
		if (this.$fromInput.value === Settings.auditoriumsRusNames.get(this.currentAuId)) {
			this.flipFromTo()
		}
		else {
			this.$toInput.value = Settings.auditoriumsRusNames.get(this.currentAuId)
			this.toId = this.currentAuId
		}
		this.onAuditoriumClicked(this.currentAuId, null)
		if (this.fromId !== undefined && this.toId !== undefined) {
			document.querySelector('.build-way').click()
		}
	}
	
	onAuditoriumClicked(clickedAuId, event) { //когда нажато на аудиторию
		for (const [auditoriumID, $auditorium] of this.auditoriums) { //когда нажима
			if (auditoriumID !== clickedAuId) $auditorium.classList.remove('selected')
			else $auditorium.classList.toggle('selected')
		}
		
		let clickedAuditoriumEntranceId = this.AuditoriumsIdEntrancesId.get(clickedAuId) //ид входа в нажатую аудиторию
		for (const [entranceID, $entrance] of this.entrances) {
			if (entranceID !== clickedAuditoriumEntranceId) $entrance.classList.remove('selected-entrance')
			else $entrance.classList.toggle('selected-entrance')
		}
		
		let isSelected = this.auditoriums.get(clickedAuId).classList.contains('selected')
		this.showSelector(event, isSelected, clickedAuId)
		
	}
	
	showSelector(event, isSelected, clickedAuId) {
		
		
		if (isSelected) {
			this.$selector.classList.remove('showing-selector')
			setTimeout((planHandler) => {
				planHandler.$selector.style.left = `${event.clientX}px`
				planHandler.$selector.style.top = `${event.clientY}px`
				planHandler.$selector.classList.remove('hidden-selector')
				planHandler.$selector.classList.add('showing-selector')
				this.currentAuId = clickedAuId
				if (this.currentAuId === this.fromId) deactivateButton('button-from')
				else activateButton('button-from')
				if (this.currentAuId === this.toId) deactivateButton('button-to')
				else activateButton('button-to')
			}, 20, this)
		}
		else {
			this.$selector.classList.remove('showing-selector')
			this.$selector.classList.add('hidden-selector')
		}
		this.$selector.setAttribute('auID', clickedAuId)
	}
	
	onBindingMode() {
		let allEntrances = this.$svgPlan.querySelectorAll('#Entrances>circle')
		let [bindingEntranceId, bindingSpaceId] = [null, null]
		let ph = this
		let newBinds = []
		
		// this.$selector.remove()
		
		function bindSpaceAndEntrance(parameter) {
			if (parameter.entranceId) bindingEntranceId = parameter.entranceId
			if (parameter.spaceId) {
				bindingSpaceId = parameter.spaceId
				setTimeout(e => {
					ph.showSelector(null, false, null)
				}, 20)
			}
			if (bindingSpaceId && bindingEntranceId) {
				newBinds.push([bindingSpaceId, bindingEntranceId])
				
				let bindingSpace = ph.auditoriums.get(bindingSpaceId)
				bindingSpace.classList.replace('not-bound-space','bound-space')
				
				for (const entrance of allEntrances) {
					if(entrance.id === bindingEntranceId){
						entrance.classList.replace('not-bound-entrance','bound-entrance')
						break
					}
				}
				
				console.log('Список новых привязанных кружочков входа', newBinds)
				bindingEntranceId = null
				bindingSpaceId = null
			}
		}
		
		let filledEntrances = new Set(this.AuditoriumsIdEntrancesId.values())
		for (const element of allEntrances) {
			element.classList.remove('selected-entrance')
			element.classList.remove('entrance')
			if (filledEntrances.has(element.id)) {
				element.classList.add('bound-entrance')
			}
			else {
				element.classList.add('not-bound-entrance')
			}
			element.addEventListener('click', e => {
				bindSpaceAndEntrance({entranceId: e.target.id})
			})
		}
		
		let filledSpaces = new Set(this.AuditoriumsIdEntrancesId.keys())
		for (const [spaceId, space] of this.auditoriums) {
			space.classList.remove('auditorium')
			space.classList.remove('other-space')
			space.removeEventListener('click', this.showSelector)
			if (filledSpaces.has(spaceId)) {
				space.classList.add('bound-space')
			}
			else {
				space.classList.add('not-bound-space')
			}
			space.addEventListener('click', e => {
				bindSpaceAndEntrance({spaceId: e.target.id})
			})
		}
	}
}