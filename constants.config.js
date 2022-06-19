/**
 * Change url to access the network
 * https://testnet.toncenter.com/api/v2/jsonRPC — testnet
 * https://toncenter.com/api/v2/jsonRPC — mainnet
 *
 */
export const TEST_NETWORK = true;
export const NETWORK = TEST_NETWORK ? 'https://testnet.toncenter.com/api/v2/jsonRPC' : 'https://toncenter.com/api/v2/jsonRPC';

export const EXPLORER_URL = TEST_NETWORK ? 'https://testnet.tonscan.org' : 'https://tonscan.org';
/**
 * Create your API_KEY in your Telegram account:
 * @tontestnetapibot — for testnet
 * @tonapibot — for mainnet
 *
 */
export const API_KEY = '840d28de69582aa64848c262cd4633e9736ebc73b7c3cb79c75af1b944368192'