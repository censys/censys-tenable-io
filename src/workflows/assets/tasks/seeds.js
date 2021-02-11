// assetDetection.js

const {asTable} = _g.components;

module.exports = async function tagAssets(my){

  const seedsFromTenable = my.argv.seedsFromTenable ? my.argv.seedsFromTenable : false;
  const seedsLabel = my.argv.seedsLabel ? my.argv.seedsLabel : 'tenable';
  const testMode = my.argv.testMode ? true : false;

  let ca = await my.censys.api.saas.getAssetsHosts();

  if (ca.success){
    my.db.assets.import(ca.response.body.assets);
  }

  let tc = await my.tenableCloud.listAssets();
  if(tc.success) my.db.tenable.import(tc.response.body.assets);

  let managedArray = [];
  my.db.assets.allRows();
  my.db.assets.rowSet.forEachRow( caRow => {
    my.db.tenable.where( tcRow => tcRow.ipv4.includes(caRow.data.ipAddress) );
    if(my.db.tenable.rowSet.numOfRows() != 0 ){
      managedArray.push(caRow.data.ipAddress);

    }
  })
  managedArray = testMode ? managedArray.slice(0,20) : managedArray;


  let allIps = [...new Set(managedArray)]; // eliminate duplicates
  let seedsArray = [];
  for (i in allIps) {
    seedsArray.push({
      type: 'IP_ADDRESS',
      value: allIps[i]
    });
  }
  let query = {label: seedsLabel};
  let data = await my.censys.api.saas.putSeeds({seeds: seedsArray}, query);


  if (testMode){
    console.log('testMode enabled');
  }

}
















