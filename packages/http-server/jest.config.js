module.exports = {
	globals: {
		'ts-jest': {
			tsConfigFile: 'tsconfig.json'
		},
		redisk: null,
		redis: null
	},
	testTimeout: 10000,
	moduleFileExtensions: [
		'ts',
		'js'
	],
	transform: {
		'^.+\\.(ts|tsx)$': './node_modules/ts-jest/preprocessor.js'
	},
	testMatch: [
		'./**/**/**.test.(ts)'
	],
	testEnvironment: 'node',
	setupFilesAfterEnv: ["<rootDir>/__tests__/setup.ts"]
}