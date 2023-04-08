import express from 'express';
import { allUpcomingSales } from '../handlers/estate-sale';

const router = express.Router()

router.get('/all-upcoming-sales', allUpcomingSales)

export default router;