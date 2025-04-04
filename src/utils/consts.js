export const DEFAULT_NODE = 'https://node.vite.net/gvite';

export const DEFAULT_NODE_WS = 'wss://node.vite.net/gvite/ws';

export const IS_DEV = process.env.NODE_ENV === 'development';

export const PAGE_SIZE = 10;

export const VITE = 'tti_5649544520544f4b454e6e40';

export const nullToken = {
	decimals: 0,
	index: 0,
	tokenId: "",
	tokenName: "",
	tokenSymbol: "",
}

export const settings = {
	accounts: [
		{
			desc: 'Quota Contract',
			address: 'vite_0000000000000000000000000000000000000003f6af7459b9'
		},
		{
			desc: 'Consensus Contract',
			address: 'vite_0000000000000000000000000000000000000004d28108e76b'
		},
		{
			desc: 'Token Issuance Contract',
			address: 'vite_000000000000000000000000000000000000000595292d996d'
		},
		{
			desc: 'DEX Fund Contract',
			address: 'vite_0000000000000000000000000000000000000006e82b8ba657'
		},
		{
			desc: 'DEX Trade Contract',
			address: 'vite_00000000000000000000000000000000000000079710f19dc7'
		},
		{
			desc: 'MEXC Exchange Deposit Address',
			address: 'vite_fb66881bd014825318d566b2631dafdcc75cc0fd812ecaa63a'
		}
	]
}