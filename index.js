const fetch = require('isomorphic-fetch')
const traverse = require('traverse')
const jsYaml = require('js-yaml')

const startUrl = process.env.url
const token = process.env.token

const newOwner = process.env.new_owner
const newToken = process.env.new_token
const baseUrl = process.env.new_base_url

console.log('Using: ')
console.log('url', startUrl)
console.log('token', token ? '***' : '?')
console.log('newToken', newToken ? '***' : '?')
console.log('newOwner', newOwner)
console.log('baseUrl', baseUrl)
console.log('')

// This is messy, but it'll copy an api/domains tree into another cluster
getTree(startUrl, new Map(), new Set()).then( (db) => {
  const urls = Array.from(db.keys())
  Promise.all(urls.map( url => {
    const body = db.get(url)
    console.log('Starting: ' + url)
    return postApi({
      token: newToken,
      url: makeUrls(url).postUrl,
      body,
    }).then((res) => console.log(`Completed: ${res.status} : ${res.url} `))
  })).then(() => console.log('done!'))
})

////////////////

function getSpec(url) {
  const req = {}
  req.headers = Object.assign({
    accept: 'application/json',
  }, token ?  {
    authorization: `Bearer ${token}`,
  } : {}, req.headers)
  return fetch(url, req).then( r => r.json())
}

function getUrl(str) {
  if(~str.indexOf('#')) {
    str = str.substr(0, str.indexOf('#'))
  }

  if(/^http/.test(str)) {
    return str
  }
}

function getTree(body, db, downloading) {
  const proms = []
  if(typeof body === 'string') {
    nextStep(body)
  } else {
    traverse(body).forEach(function($ref) {
      if(this.key === '$ref') {
        const url = getUrl($ref)
        if(url) {
          this.update($ref.replace(url, makeUrls(url).url))
          nextStep(url)
        }
      }
    })
  }

  function nextStep(url) {
    if(!downloading.has(url)) {
      downloading.add(url)
      const next = getSpec(url)
      proms.push(next.then( b => {
        db.set(url, b)
        return getTree(b, db, downloading)
      }))
    }
  }

  return Promise.all(proms).then(() => db)
}

function makeUrls(url) {
  const [, type, owner, name, version] = /\/(apis|domains)\/([^/]+)\/([^/]+)\/([^/]+)/.exec(url)
  return {
    type, owner, name, version,
    url: [baseUrl, type, newOwner, name, version].join('/'),
    postUrl: [baseUrl, type, newOwner, name].join('/') + `?version=${version}`,
  }
}

function postApi({ url, token, body }) {
  if(/https:\/\/api\.swaggerhub\.com/.test(url)) {
    console.log('NOPE!')
    console.log('Do not post to prod.. unless we mean too')
    throw Error('Tried to publish to prod')
  }

  const req = {
    method: "POST",
    headers: {
      'content-type': 'application/yaml',
    },
    body: jsYaml.safeDump(body)
  }

  if(token) {
    req.headers.authorization = `Bearer ${token}`
  }

  return fetch(url, req)
}
