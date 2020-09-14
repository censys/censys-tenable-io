// index.js

const {http} = _g.components;

module.exports = class {

	constructor({
		tenable_access_key = '',
		tenable_secret_key = '',
		catchErrors = true,
		rootEndpoint = 'https://cloud.tenable.com'
	})
	{
		const httpRequest = catchErrors ? http.tryRequest : http.request;

		let defaultHeaders = {
						'content-type': 'application/json',
						'cache-control': 'no-cache',
						'user-agent': 'censys-integrator/1.0',
						'X-ApiKeys': `accessKey=${tenable_access_key}; secretKey=${tenable_secret_key}`,
					};

		this.importAssets = (payload = '') => 
			httpRequest(`${rootEndpoint}/import/assets`, {
				method: 'POST',
				headers: {...defaultHeaders},
				payload: payload
			});

		this.listAssets = () => 
			httpRequest(`${rootEndpoint}/assets`, {
				method: 'GET',
				headers: {...defaultHeaders},
				payload: ''
			});

		this.assetDetails = (assetUuid) => 
			httpRequest(`${rootEndpoint}/import/assets/${assetUuid}`, {
				method: 'GET',
				headers: {...defaultHeaders},
				payload: ''
			});

		this.listAssetImportJobs = () => 
			httpRequest(`${rootEndpoint}/import/asset-jobs`, {
				method: 'GET',
				headers: {...defaultHeaders},
				payload: ''
			});

		this.getImportJobInfo = (jobUuid) => 
			httpRequest(`${rootEndpoint}/import/asset-jobs/${jobUuid}`, {
				method: 'GET',
				headers: {...defaultHeaders},
				payload: ''
			});
	}
}


