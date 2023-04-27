import { CoordinateSaleData } from '@/types';
import { createContext } from 'react';

interface Data<T> {
	data: T | null;
	error: string | null;
	loading: boolean;
}

interface IEstateSaleContext {
	saleInfo: Data<CoordinateSaleData[]>
}

const defaultData = { data: null, error: null, loading: false };

export const defaultEstateSaleContext = {
	saleInfo: defaultData
};

const EstateSaleContext = createContext<IEstateSaleContext>(defaultEstateSaleContext);

export default EstateSaleContext;