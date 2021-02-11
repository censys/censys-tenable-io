// assetDetection.js

const {asTable} = _g.components;

module.exports = async function tagAssets(my){

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
    let pArray = [];
    unmanagedArray.forEach(async (element) => {
      pArray.push(my.censys.api.saas.setAssetsHostsTag(`${element}`, `${unmanagedTag}`));
  
    });
    await Promise.allSettled(pArray);
    console.log(`${unmanagedArray.length} host(s) were tagged with ${unmanagedTag}.`);

  } else {
      // console.log(`No updates were made to `)

  }
  
  if(managedTag){
    managedArray = testMode ? managedArray.slice(0,20) : managedArray;
    pArray = [];
    managedArray.forEach(async (element) => {
      pArray.push(my.censys.api.saas.setAssetsHostsTag(`${element}`, `${managedTag}`));
  
    });
    await Promise.allSettled(pArray);
    console.log(`${managedArray.length} host(s) were tagged with ${managedTag}.`);

    } else {
      // console.log(`No assets updated because no managed tag was specified.`)
  
  }

  if (testMode){
    console.log('testMode enabled');
  }

}
















