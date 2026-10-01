import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import relativeTime from 'dayjs/plugin/relativeTime';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

/**
 * Fuso de referência do negócio, independente do timezone do host/processo.
 * Sem isso, um servidor em UTC e um browser em -03 discordam sobre que dia é.
 */
const BUSINESS_TIMEZONE = 'America/Sao_Paulo';

dayjs.locale('pt-br');
dayjs.extend(customParseFormat);
dayjs.extend(relativeTime);
dayjs.extend(advancedFormat);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault(BUSINESS_TIMEZONE);

// Importe SEMPRE daqui (`~/libs/dayjs`), nunca `from 'dayjs'` direto: só esta
// instância tem locale, plugins e timezone configurados.
export { BUSINESS_TIMEZONE, dayjs };
