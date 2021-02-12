// importNewlogbookHosts.js


module.exports = async function importNewLogbookHosts(my){

  const { argv, censys, tenableCloud, db } = my;

  let filter = argv.filter ? {type: [...argv.filter]} : {};

  let idFrom = argv.idFrom ? Number(argv.idFrom) : 0;
  let saved = await my.storage.get('lastId.json');
  idFrom = saved ? Number(saved.lastId) : idFrom;

  if(Number.isNaN(idFrom)){
    console.log('Error: idFrom is not a number. Verify the lastId.json and settings.yaml contain a valid number value for idFrom.');
    return
  }

  if(idFrom == 0){ // limit the filter type to HOST when downloading the entire logbook since this may be very large
    filter = {type: ['HOST']}
  }

  let results = {};
  results = await censys.api.saas.getLogbookCursor( {filter: filter, idFrom: idFrom});

  let cursor = results.data.cursor;

  let lb = await censys.api.saas.getLogbookData({cursor: cursor});


  if (lb.success){
// console.log('success');
    db.logbook.import(lb.data);

    // get the last id retrieved
    db.logbook.allRows();
    db.logbook.lastRow();
    let dbLastId = db.logbook.row['id'];

    db.logbook.where( row => row.type == 'HOST' && row.operation == 'ASSOCIATE');

    // convert ip addresses to an array and eliminate duplicates
    let {entity} = db.logbook.rowSetToArray({entity: []});
    let ip = entity.map(i => i.ipAddress);
    ip = [... new Set(ip)];

    const assets = ip.map( i => ({ipv4: [i]}) ); // convert ip array to tenable assets array

    if (assets.length > 0){
        const tc = await tenableCloud.importAssets({
          assets: assets,
          source: 'censys_asm_platform',
        });

      if( tc.success && (typeof dbLastId == 'number') ){
          await my.storage.put({lastId: dbLastId+1},'lastId.json', `tasks/${my.taskName}/input`);

          // summarize results and output to console
          console.log();
          console.log('Summary');
          console.log('-------')
          console.log(`Total number of events: ${db.logbook.numOfRows()}`);
          console.log(`Number of HOST, ASSOCIATE events: ${db.logbook.rowSet.numOfRows()}`);
          console.log(`Number of IPs shipped to Tenable Cloud instance: ${assets.length}`);
          console.log();
      }

    }
  }
}

