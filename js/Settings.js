export class Settings {
	static auditoriumColor = '#3B3C41' //цвета аудиторий
	static entrancesColors = ['#9CBBFF'] //цвета входов
	static entrancesTag = 'circle' //тэг точек входа
	static auditoriumsEntrances = new Map()
	static auditoriumsRusNames = new Map()
	static auditoriumsEngNames = new Map()
	static throughPassVertexes = [] //Вершины со сквозным проходом (например аудитория со сквозным проходом)
	
	static planName = 'resources/NULL-PLAN.svg' //ПУТЬ К ПЛАНУ ТУТ!!!
	static graphName = 'resources/NULL-GRAPH.svg' //ПУТЬ К ГРАФУ ТУТ!!!
	
	static wayColor = '#3CD288'
	static wayWidth = '8px'
}

//ассоциации для сэмпла
let auditoriumsEntrances = [

]


Settings.auditoriumsEntrances = new Map(auditoriumsEntrances)

let auditoriumsRusNames = [
	//Корпус Н этаж 3
	['n-301','Н301'],['n-302','Н302'],['n-303a','Н303А'],['n-303b','Н303Б'],['n-304','Н304'],['n-305','Н305'],['n-306','Н306'],['n-307','Н307'],['n-308','Н308'],['n-309','Н309'],['n-310','Н310'],['n-311','Н311'],['n-312','Н312'],['n-313','Н313'],['n-314','Н314'],['n-315','Н315'],['n-316','Н316'],['n-317','Н317'],['n-318','Н318'],['n-319','Н319'],['n-320','Н320'],['n-321','Н321'],['n-322','Н322'],['n-323','Н323'],['n-324','Н324'],['n-325','Н325'],['n-326','Н326'],['n-327','Н327'],['n-3-stair-1','Лестница #1 Н3'],['n-3-stair-2','Лестница #2 Н3'],['n-3-stair-3','Лестница #3 Н3'],['n-3-lift-1','Лифт #1 Н3'],['n-3-lift-2','Лифт #2 Н3'],['n-3-lift-3','Лифт #3 Н3'],['n-3-lift-4','Лифт #4 Н3'],['n-3-lift-5','Лифт #5 Н3'],['n-3-lift-6','Лифт #6 Н3'],['n-3-lift-7','Лифт #7 Н3'],['n-3-wcm-1','Мужской туалет Н3'],['n-3-wcw-1','Женский туалет Н3']
]

let auditoriumsEngNames = []
for (const auditoriumsRusName of auditoriumsRusNames) {
	let nameRusEng = [auditoriumsRusName[1], auditoriumsRusName[0]]
	auditoriumsEngNames.push(nameRusEng)
}
console.log(auditoriumsEngNames)
Settings.auditoriumsEngNames = new Map(auditoriumsEngNames)
Settings.auditoriumsRusNames = new Map(auditoriumsRusNames)

let throughPassVertexes = [
]
Settings.throughPassVertexes = throughPassVertexes