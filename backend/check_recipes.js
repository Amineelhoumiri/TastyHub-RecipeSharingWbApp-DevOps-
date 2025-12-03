const http = require('http');

http.get('http://localhost:5000/api/recipes?pageSize=100', (resp) => {
  let data = '';

  resp.on('data', (chunk) => { data += chunk; });

  resp.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log(`Total Count: ${json.totalCount}`);
      console.log(`Fetched: ${json.recipes.length}`);

      const simplified = json.recipes.map(r => ({
        id: r.id,
        title: r.title,
        username: r.author ? r.author.username : 'No Author'
      }));
      console.log(JSON.stringify(simplified, null, 2));
    } catch (_e) {
      console.log(data);
    }
  });

}).on('error', (err) => {
  console.log('Error: ' + err.message);
});
