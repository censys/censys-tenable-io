// tags.js

const {asTable} = _g.components;

module.exports = async function tags(my){

  const apiBatch = my.argv.apiBatch ? my.argv.apiBatch : 1;
  const apiDelay = my.argv.apiDelay ? my.argv.apiDelay : 500;

  const unmanagedTag = my.argv.unmanagedTag ? my.argv.unmanagedTag : '';
  const managedTag = my.argv.managedTag ? my.argv.managedTag : '';
  const testMode = my.argv.testMode ? true : false;

  let ca = await my.censys.api.saas.getAssetsHosts();

  if (ca.success){
    my.db.assets.import(ca.response.body.assets);
  }

  let tc = await my.tenableCloud.listAssets();
  if(tc.success) my.db.tenable.import(tc.response.body.assets);

  let unmanagedArray = [];
  let managedArray = [];
  my.db.assets.allRows();
  my.db.assets.rowSet.forEachRow( caRow => {
    my.db.tenable.where( tcRow => tcRow.ipv4.includes(caRow.data.ipAddress) );
    if(my.db.tenable.rowSet.numOfRows() == 0 ){
      unmanagedArray.push(caRow.data.ipAddress);

    } else {
      managedArray.push(caRow.data.ipAddress);

    }
  })

  if(unmanagedTag){
    unmanagedArray = testMode ? unmanagedArray.slice(0,20) : unmanagedArray;

    for(let i = 0; i < unmanagedArray.length; i += apiBatch ){
      ipsChunk = unmanagedArray.slice(i, i+apiBatch);

      let pArray = [];
      unmanagedArray.forEach(async (element) => {
       pArray.push(my.censys.api.saas.setAssetsHostsTag(`${element}`, `${unmanagedTag}`));
  
      });
      await Promise.allSettled(pArray);
      await sleep(apiDelay);
    }

    console.log(`${unmanagedArray.length} host(s) were tagged as unmanaged with ${unmanagedTag}.`);

  } else {
      console.log(`No host(s) were tagged as unmanaged because --unmanagedTag wasn't specified.`);

  }
  
  if(managedTag){
    managedArray = testMode ? managedArray.slice(0,20) : managedArray;

    for(let i = 0; i < managedArray.length; i += apiBatch ){
      ipsChunk = managedArray.slice(i, i+apiBatch);

      pArray = [];
      managedArray.forEach(async (element) => {
        pArray.push(my.censys.api.saas.setAssetsHostsTag(`${element}`, `${managedTag}`));
  
      });
      await Promise.allSettled(pArray);
      await sleep(apiDelay);
    }
      console.log(`${managedArray.length} host(s) were tagged as managed with ${managedTag}.`);

    } else {
      console.log(`No host(s) were tagged as managed because --managedTag wasn't specified.`);
  
  }

  if (testMode){
    console.log('testMode enabled');
  }

}


function sleep(ms) {
  return new Promise( resolve => {
    setTimeout(resolve, ms);
  })
}














