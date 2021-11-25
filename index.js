const ethers = require('ethers');
const traderjoe = require('@traderjoe-xyz/sdk');
require("dotenv").config();

const addresses = {
	WAVAX: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7',
	factory: '0x9Ad6C38BE94206cA50bb0d90783181662f0Cfa10',
	router: '0x60aE616a2155Ee3d9A68541Ba4544862310933d4',
	recipient: '0x17710E2dae22882E233357cA196d535F6a67869f',
	SDOG: '0xdE9E52F1838951e4d2bb6C59723B003c353979b6',
	MIM: '0x130966628846BFd36ff31a822705796e8cb8C18D'
}

//First address of this mnemonic must have enough BNB to pay for tx fess

const provider = new ethers.providers.JsonRpcProvider(process.env.MORALIS_AVAX);
const wallet = new ethers.Wallet(process.env.WALLET_PK);
const account = wallet.connect(provider);
// const factory = new ethers.Contract(
//   addresses.factory,
//   ['event PairCreated(address indexed token0, address indexed token1, address pair, uint)'],
//   account
// );
const router = new ethers.Contract(
	addresses.router,
	[
		'function getAmountsOut(uint256 amountIn, address[] memory path) public view returns (uint256[] memory amounts)',
		'function swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, address[] calldata path, address to, uint256 deadline) external returns (uint[] memory amounts)'
	],
	account
);

const wavax = new ethers.Contract(
	addresses.WAVAX,
	[
		'function approve(address guy, uint256 wad) public returns (bool)',
	],
	account
);

const sdog = new ethers.Contract(
	addresses.SDOG,
	[
		'function approve(address spender, uint256 amount) external returns (bool)',
	],
	account
);

const init = async () => {


	newBlock();
}

async function newBlock() {
	let transactionMade = false;
	let currentBlock = await provider.getBlockNumber();
	let sold1 = false;
	let sold2 = false;
	let sold3 = false;
	let sold4 = false;
	let totalSDOG = 1400000000
		while(!transactionMade) {
		while (currentBlock == await provider.getBlockNumber()) {
			let wait;
		}
		currentBlock = await provider.getBlockNumber();
		// console.log(currentBlock);
		//1 SDOG
		const amountIn = 1000000000;
		const amounts = await router.getAmountsOut(amountIn, [addresses.SDOG, addresses.MIM]);
		//Our execution price will be a bit different, we need some flexbility
		const amountOutMin = amounts[1].sub(amounts[1].div(10).mul(3));
		// console.log(amountOutMin.toString());
		console.log(`
			${Date()}
			BLOCK: ${currentBlock}
			=================
			SDOG: ${(amountIn / (10 ** 9)).toString()}
			MIM: ${(amounts[1] / (10 ** 18)).toString()}
			Minimum MIM: ${(amountOutMin / (10 ** 18)).toString()};
		`);


		if ((amounts[1] / (10 ** 18)) > 60000 && sold3) {
			console.log(`SELLING ${totalSDOG} SDOG ~ 20K MIM`)
			const amount60k = await router.getAmountsOut(totalSDOG, [addresses.SDOG, addresses.MIM]);
			const amountOutMin60k = amount60k[1].sub(amount60k[1].div(10).mul(3));
			const tx = await router.swapExactTokensForTokens(
				totalSDOG,
				amountOutMin60k,
				[addresses.SDOG, addresses.MIM],
				addresses.recipient,
				Date.now() + 1000 * 60 * 5 //10 minutes
			);
			const receipt = await tx.wait(); 
			console.log('Transaction receipt');
			console.log(receipt);
			totalSDOG = 0;
			sold3 = true;
		}
		else if ((amounts[1] / (10 ** 18)) > 50000 && sold4) {
			console.log(`SELLING ${totalSDOG} SDOG ~ 20K MIM`)
			const amount50k = await router.getAmountsOut(totalSDOG, [addresses.SDOG, addresses.MIM]);
			const amountOutMin50k = amount50k[1].sub(amount50k[1].div(10).mul(3));
			const tx = await router.swapExactTokensForTokens(
				totalSDOG,
				amountOutMin50k,
				[addresses.SDOG, addresses.MIM],
				addresses.recipient,
				Date.now() + 1000 * 60 * 5 //10 minutes
			);
			const receipt = await tx.wait(); 
			console.log('Transaction receipt');
			console.log(receipt);
			totalSDOG = 0;
			sold4 = true;
		}
		else if ((amounts[1] / (10 ** 18)) > 40000 && !sold1) {
			console.log("SELLING 1 SDOG ~ 40K MIM")
			const amountIn40k = 1000000000;
			const amount40k = await router.getAmountsOut(amountIn40k, [addresses.SDOG, addresses.MIM]);
			const amountOutMin40k = amount40k[1].sub(amount40k[1].div(10).mul(3));
			const tx = await router.swapExactTokensForTokens(
				amountIn40k,
				amountOutMin40k,
				[addresses.SDOG, addresses.MIM],
				addresses.recipient,
				Date.now() + 1000 * 60 * 5 //10 minutes
			);
			const receipt = await tx.wait(); 
			console.log('Transaction receipt');
			console.log(receipt);
			totalSDOG -= amountIn40k;
			sold1 = true;
		}
		else if ((amounts[1] / (10 ** 18)) > 25000 && !sold2 && !sold1) {
			console.log("SELLING 0.5 SDOG ~ 20K MIM")
			const amountIn25k = 500000000;
			const amount25k = await router.getAmountsOut(amountIn25k, [addresses.SDOG, addresses.MIM]);
			const amountOutMin25k = amount25k[1].sub(amount25k[1].div(10).mul(3));
			const tx = await router.swapExactTokensForTokens(
				amountIn25k,
				amountOutMin25k,
				[addresses.SDOG, addresses.MIM],
				addresses.recipient,
				Date.now() + 1000 * 60 * 5 //10 minutes
			);
			const receipt = await tx.wait(); 
			console.log('Transaction receipt');
			console.log(receipt);
			totalSDOG -= amountIn25k;
			sold2 = true;
		}

		if (totalSDOG == 0) {
			transactionMade = true;
		}

		console.log(`Total SDOG: ${totalSDOG}`);
	}
	
}

init();