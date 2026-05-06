export function getLocalISO(date: Date = new Date()): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}

export function addDaysLocal(dateISO: string, days: number): string {
	const [year, month, day] = dateISO.split('-').map(Number);
	const date = new Date(year, month - 1, day);
	date.setDate(date.getDate() + days);
	return getLocalISO(date);
}

export function diffDaysLocal(fromISO: string, toISO: string): number {
	const [fy, fm, fd] = fromISO.split('-').map(Number);
	const [ty, tm, td] = toISO.split('-').map(Number);
	const from = new Date(fy, fm - 1, fd).getTime();
	const to = new Date(ty, tm - 1, td).getTime();
	const millisecondsPerDay = 24 * 60 * 60 * 1000;
	return Math.round((to - from) / millisecondsPerDay);
}
