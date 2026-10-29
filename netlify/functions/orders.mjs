// POST /api/orders -> saves an order and returns { orderNumber, total }
// Prices come from src/catalog.js on the server, never from the browser.
import { randomBytes } from 'node:crypto'
import { collection, json } from '../lib/db.mjs'
import { findProduct, cleanOpts, totals, describe, CUSTOM_KEYCHAIN } from '../../src/catalog.js'

const str = (v, max) => String(v ?? '').trim().slice(0, max)

export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)
  const col = await collection('orders')
  if (!col) return json({ error: 'Online ordering is not connected yet.' }, 503)

  const body = await req.json().catch(() => ({}))
  const c = body.customer || {}
  if (c.website) return json({ error: 'Could not place order.' }, 400) // honeypot

  const customer = {
    firstName: str(c.firstName, 60), lastName: str(c.lastName, 60),
    email: str(c.email, 120), phone: str(c.phone, 30),
    address1: str(c.address1, 120), address2: str(c.address2, 120),
    city: str(c.city, 60), state: str(c.state, 2).toUpperCase(), zip: str(c.zip, 10),
    notes: str(c.notes, 1000),
  }
  for (const k of ['firstName', 'lastName', 'address1', 'city'])
    if (!customer[k]) return json({ error: 'Please fill in all required fields.' }, 400)
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) return json({ error: 'Please enter a valid email.' }, 400)
  if (!/^[A-Z]{2}$/.test(customer.state) || !/^\d{5}(-\d{4})?$/.test(customer.zip))
    return json({ error: 'Please check your state and ZIP code.' }, 400)

  if (!Array.isArray(body.items) || !body.items.length || body.items.length > 50)
    return json({ error: 'Your cart is empty.' }, 400)
  const items = []
  for (const i of body.items) {
    const p = findProduct(i?.id)
    const qty = Number(i?.qty)
    if (!p || !Number.isInteger(qty) || qty < 1 || qty > 99) return json({ error: 'Something in your cart is no longer available.' }, 400)
    const item = { id: p.id, qty }
    if (p.id === CUSTOM_KEYCHAIN.id) {
      const opts = cleanOpts(i.opts)
      if (!opts) return json({ error: 'A custom keychain in your cart is missing its options.' }, 400)
      item.opts = opts
    }
    items.push({ ...item, name: p.name, details: describe(item), unitPrice: p.price })
  }

  const t = totals(items)
  const orderNumber = 'CJ-' + randomBytes(3).toString('hex').toUpperCase()
  await col.insertOne({ orderNumber, status: 'new', customer, items, ...t, createdAt: new Date().toISOString() })
  return json({ orderNumber, total: t.total }, 201)
}
