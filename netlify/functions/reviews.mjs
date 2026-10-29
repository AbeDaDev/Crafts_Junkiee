// GET  /api/reviews  -> latest reviews (newest first)
// POST /api/reviews  -> add a review { name, rating, product, text }
// Needs the MONGODB_URI environment variable set in Netlify (Site settings > Environment variables).
import { collection, json } from '../lib/db.mjs'

const PRODUCTS = ['', 'Keychains', 'DIY Pens', 'Glitter', 'DTF Prints', 'Accessories', 'Custom order']

const clean = ({ _id, ...r }) => ({ id: String(_id), ...r })

export default async (req) => {
  const col = await collection('reviews')
  if (!col) return json({ error: 'Reviews are not connected yet.' }, 503)

  if (req.method === 'GET') {
    const docs = await col.find({}).sort({ createdAt: -1 }).limit(200).toArray()
    return json(docs.map(clean))
  }

  if (req.method === 'POST') {
    const body = await req.json().catch(() => ({}))
    if (body.website) return json({ error: 'Could not post review.' }, 400) // honeypot: bots fill hidden fields
    const name = String(body.name || '').trim().slice(0, 40)
    const text = String(body.text || '').trim().slice(0, 1000)
    const rating = Number(body.rating)
    const product = PRODUCTS.includes(body.product) ? body.product : ''
    if (!name) return json({ error: 'Please add your name.' }, 400)
    if (text.length < 5) return json({ error: 'Please write a few words about your order.' }, 400)
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) return json({ error: 'Please pick a star rating.' }, 400)
    const doc = { name, rating, product, text, createdAt: new Date().toISOString() }
    const { insertedId } = await col.insertOne(doc)
    return json(clean({ _id: insertedId, ...doc }), 201)
  }

  return json({ error: 'Method not allowed' }, 405)
}
