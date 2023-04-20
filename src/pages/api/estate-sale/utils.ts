import jsdom from 'jsdom';
import { Dictionary } from '@/types';


export async function parseResponseBodyIntoDom(response: Response): Promise<Document> {
	const body = await response.text();

	const dom = new jsdom.JSDOM(body);
	return dom.window.document;
}

export function removeTabsAndNewLines(x: string | undefined): string | null {
	if (!x) return null;
	return x.replace(/[\t\n\r]/gm, ' ').trim();
}

export const monthIndex: Dictionary = {
	January: '01',
	February: '02',
	March: '03',
	April: '04',
	May: '05',
	June: '06',
	July: '07',
	August: '08',
	September: '09',
	October: '10',
	November: '11',
	December: '12'
};

const convertTime12to24 = (time: string, modifier: string) => {
	let [hours, minutes] = time.split(':');

	if (hours === '12') {
		hours = '00';
	}

	if (modifier.toUpperCase() === 'PM') {
		hours = (parseInt(hours, 10) + 12).toString();
	}

	return `${hours.padStart(2, '0')}:${minutes}`;
};


export function parseSaleDateString(x: string | undefined) {
	if (!x) return;

	const [startAndEndRaw, dayAndTimeRaw] = x.split('   ').map(el => el.trim()).filter(el => !!el);
	const [start, end] = startAndEndRaw.split('till');

	const [startDayOfWeek, startDayOfMonth, startMonth, startYear, startTimeOfDay, startMeridiem] = start.split(' ').filter(el => el !== 'of');
	const [endDayOfWeek, endDayOfMonth, endMonth, endYear, endTimeOfDay, endMeridiem] = end.split(' ').filter(el => !!el && el !== 'of');

	const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;

	// YYYY-MM-DDTTT:TT:TT
	const startTime = new Date(`${startYear}-${monthIndex[startMonth]}-${(startDayOfMonth.slice(0, -2).padStart(2, '0'))}T${convertTime12to24(startTimeOfDay, startMeridiem)}z`).getTime();
	// if (!startTime) console.log(`${startYear}-${monthIndex[startMonth]}-${(startDayOfMonth.slice(0, -2).padStart(2, '0'))}T${convertTime12to24(startTimeOfDay, startMeridiem)}`);
	const endTime = new Date(`${endYear}-${monthIndex[endMonth]}-${(endDayOfMonth.slice(0, -2).padStart(2, '0'))}T${convertTime12to24(endTimeOfDay, endMeridiem)}z`).getTime();

	// const startTime = DateTime.fromISO(`${startDate.toISOString()}`, { zone }).toUnixInteger();
	// const endTime = DateTime.fromISO(`${endDate.toISOString()}`, { zone }).toUnixInteger();

	const pattern = /([A-Z][a-z]+): (\d+-\d+)/g;

	// array to store parsed strings
	const dayAndTime = [];

	// loop through all matches and add parsed strings to array
	let match;
	while ((match = pattern.exec(dayAndTimeRaw)) !== null) {
		const dayOfWeek = match[1];
		const timeOfDay = match[2];
		const parsedString = `${dayOfWeek}: ${timeOfDay}`;
		dayAndTime.push(parsedString);
	}

	return {
		startTime,
		endTime,
		dayAndTime
	};
}

export function parseSaleAddress(x: string | undefined) {
	if (!x) return null;

	const [address, region] = x.split('   ').filter(el => !!el.trim());

	if (address.toLocaleLowerCase().includes('tba')) return `Not Posted - ${region.trim()}`;

	return address.trim();
}

export async function logAsyncTime(label: string, callback: () => Promise<any>) {
	console.time(label);
	const res = await callback();
	console.timeEnd(label);

	return res;
}