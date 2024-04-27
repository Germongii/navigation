export function calculateLineSegment(points) {
	let x1 = points.p1.x
	let y1 = points.p1.y
	let x2 = points.p2.x
	let y2 = points.p2.y
	let x3 = points.p3.x
	let y3 = points.p3.y
	// const {x1, y1, x2, y2, x3, y3} = points
	console.log(points)
	console.log(x1, y1, x2, y2, x3, y3)
	// Calculate the slope of the line passing through points 1 and 2
	const slope = - (y2 - y1) / (x2 - x1)
	
	// Calculate the midpoint between points 2 and 3
	const midX = (x2 + x3) / 2
	const midY = (y2 + y3) / 2
	
	// Calculate the distance between points 2 and 3
	const distance = Math.sqrt(Math.pow(x3 - x2, 2) + Math.pow(y3 - y2, 2))
	
	// Calculate the length of half of the line segment
	const halfLength = 7000 / 2
	
	// Calculate the angle between the line passing through points 1 and 2 and the x-axis
	const angle = Math.atan(slope)
	
	// Calculate the angle between the line passing through points 2 and 3 and the x-axis
	const angle2 = Math.atan((y3 - y2) / (x3 - x2))
	
	// Calculate the angle between the line passing through the midpoint and the x-axis
	const angle3 = angle + Math.PI / 2 + angle2
	
	// Calculate the coordinates of the start and end points of the line segment
	let startX = midX - halfLength * Math.cos(-angle)
	let startY = midY - halfLength * Math.sin(-angle)
	let endX = midX + halfLength * Math.cos(-angle)
	let endY = midY + halfLength * Math.sin(-angle)
	
	// Round the coordinates to the nearest integer
	startX = Math.round(startX)
	startY = Math.round(startY)
	endX = Math.round(endX)
	endY = Math.round(endY)
	
	if (Math.abs(startX - endX) <= 7) {
		let x = Math.round((startX + endX)/2)
		startX = x
		endX = x
	}
	if (Math.abs(startY - endY) <= 7) {
		let y = Math.round((startY + endY)/2)
		console.log(y)
		startY = y
		endY = y
	}
	// Return an object with the rounded coordinates of the start and end points
	return {x1: startX, y1: startY, x2: endX, y2: endY}
}

export function segmentBetween12SegAnd3Point(point1, point2, point3) {
	const dx = point2.x - point1.x;
	const dy = point2.y - point1.y;
	
	// Случай, когда отрезок A вырождается в точку
	if (dx === 0 && dy === 0) {
		return null;
	}
	
	const t = ((point3.x - point1.x) * dx + (point3.y - point1.y) * dy) / (dx * dx + dy * dy);
	
	let perpendicularPoint;
	
	// Проверяем, находится ли точка 3 снаружи отрезка A
	if (t < 0) {
		perpendicularPoint = { x: point1.x, y: point1.y };
	} else if (t > 1) {
		perpendicularPoint = { x: point2.x, y: point2.y };
	} else {
		perpendicularPoint = {
			x: point1.x + t * dx,
			y: point1.y + t * dy,
		};
	}
	
	const lineB = {
		x1: point3.x,
		y1: point3.y,
		x2: Math.round(perpendicularPoint.x),
		y2: Math.round(perpendicularPoint.y),
	};
	
	return lineB;
}

export function compare(field, order) {
	let len = arguments.length;
	if (len === 0) {
		return (a, b) => (a < b && - 1) || (a > b && 1) || 0;
	}
	if (len === 1) {
		switch (typeof field) {
			case 'number':
				return field < 0 ?
					((a, b) => (a < b && 1) || (a > b && - 1) || 0) :
					((a, b) => (a < b && - 1) || (a > b && 1) || 0);
			case 'string':
				return (a, b) => (a[field] < b[field] && - 1) || (a[field] > b[field] && 1) || 0;
		}
	}
	if (len === 2 && typeof order === 'number') {
		return order < 0 ?
			((a, b) => (a[field] < b[field] && 1) || (a[field] > b[field] && - 1) || 0) :
			((a, b) => (a[field] < b[field] && - 1) || (a[field] > b[field] && 1) || 0);
	}
	let fields, orders;
	if (typeof field === 'object') {
		fields = Object.getOwnPropertyNames(field);
		orders = fields.map(key => field[key]);
		len = fields.length;
	}
	else {
		fields = new Array(len);
		orders = new Array(len);
		for (let i = len; i --;) {
			fields[i] = arguments[i];
			orders[i] = 1;
		}
	}
	return (a, b) => {
		for (let i = 0; i < len; i ++) {
			if (a[fields[i]] < b[fields[i]]) return orders[i];
			if (a[fields[i]] > b[fields[i]]) return - orders[i];
		}
		return 0;
	};
}