const crypto = require('crypto');

function info(key){
  const val = process.env[key] || '';
  return { length: val.length, sha256: crypto.createHash('sha256').update(val).digest('hex') };
}

exports.handler = async function(event){
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({
      WEB_PUSH_PUBLIC_KEY: info('WEB_PUSH_PUBLIC_KEY'),
      WEB_PUSH_PRIVATE_KEY: info('WEB_PUSH_PRIVATE_KEY')
    })
  };
};
